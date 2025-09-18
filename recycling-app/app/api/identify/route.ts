import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithClarifai, interpretClarifaiLabels } from '@/lib/clarifai-service';
import { interpretWithOpenAI, interpretWithClarifai, interpretWithRules } from '@/lib/ai-interpreter';

// Main identify endpoint - now with AI interpretation!
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Step 1: Use Clarifai for image analysis
    const clarifaiResult = await analyzeImageWithClarifai(image);

    if (!clarifaiResult.labels || clarifaiResult.labels.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not identify item in image',
        processing_time_ms: Date.now() - startTime
      });
    }

    // Step 2: Use AI to interpret the results for recycling
    let interpretation;
    let aiService = 'rules'; // Track which service we used

    try {
      // Try OpenAI first if available
      if (process.env.OPENAI_API_KEY) {
        interpretation = await interpretWithOpenAI(
          clarifaiResult.labels,
          process.env.OPENAI_API_KEY
        );
        aiService = 'openai';
      }
      // Try Clarifai LLM if available
      else if (process.env.CLARIFAI_PAT) {
        interpretation = await interpretWithClarifai(
          clarifaiResult.labels,
          process.env.CLARIFAI_PAT
        );
        aiService = 'clarifai-llm';
      }
      // Fallback to rule-based interpretation
      else {
        interpretation = interpretWithRules(clarifaiResult.labels);
        aiService = 'rules';
      }
    } catch (aiError) {
      console.error('AI interpretation failed, using rules:', aiError);
      // Fallback to rule-based if AI fails
      interpretation = interpretWithRules(clarifaiResult.labels);
      aiService = 'rules-fallback';
    }

    // Step 3: Format response
    const response = {
      success: true,
      item: {
        name: interpretation.item_name,
        is_recyclable: interpretation.is_recyclable,
        bin_color: interpretation.bin_color,
        disposal_method: interpretation.disposal_method,
        preparation: interpretation.preparation,
        special_instructions: interpretation.special_instructions,
        category: interpretation.is_recyclable ? 'recyclable' :
                  interpretation.bin_color === 'Special' ? 'hazardous' : 'trash',
        material: detectMaterial(clarifaiResult.labels)
      },
      recyclable: interpretation.is_recyclable,
      confidence: interpretation.confidence,
      vision_labels: clarifaiResult.labels.slice(0, 5),
      processing_time_ms: Date.now() - startTime,
      services: {
        vision: 'clarifai',
        interpreter: aiService
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in identify endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to analyze image',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        processing_time_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// Helper function to detect material from labels
function detectMaterial(labels: Array<{ name: string; value: number }>): string {
  const labelText = labels.map(l => l.name.toLowerCase()).join(' ');

  if (labelText.includes('plastic')) return 'Plastic';
  if (labelText.includes('glass')) return 'Glass';
  if (labelText.includes('metal') || labelText.includes('aluminum')) return 'Metal';
  if (labelText.includes('paper') || labelText.includes('cardboard')) return 'Paper';
  if (labelText.includes('organic') || labelText.includes('food')) return 'Organic';
  if (labelText.includes('electronic')) return 'Electronics';

  return 'Mixed/Unknown';
}

// Health check endpoint
export async function GET(request: NextRequest) {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasClarifai = !!process.env.CLARIFAI_PAT;

  return NextResponse.json({
    status: 'healthy',
    services: {
      vision: 'clarifai',
      ai_interpreter: hasOpenAI ? 'openai' : hasClarifai ? 'clarifai' : 'rules-based'
    },
    endpoints: {
      identify: 'POST /api/identify',
      test: 'POST /api/identify/test',
    },
    configured: {
      openai: hasOpenAI,
      clarifai: hasClarifai,
      fallback: 'always available'
    }
  });
}