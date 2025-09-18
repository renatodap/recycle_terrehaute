import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithVision } from '@/lib/vision-service';
import { analyzeImageWithClarifai } from '@/lib/clarifai-service';
import { interpretWithOpenAI, interpretWithClarifai, interpretWithRules } from '@/lib/ai-interpreter';

// Main identify endpoint - Google Vision API primary, Clarifai fallback
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

    // Step 1: Try Google Vision API first, fall back to Clarifai
    let visionResult;
    let visionService = 'google-vision';

    try {
      if (process.env.GOOGLE_VISION_API_KEY) {
        console.log('Attempting Google Vision API...');
        visionResult = await analyzeImageWithVision(image, process.env.GOOGLE_VISION_API_KEY);
        visionService = 'google-vision';
      } else {
        throw new Error('Google Vision API key not configured');
      }
    } catch (visionError) {
      console.error('Google Vision API failed, trying Clarifai:', visionError);

      // Fallback to Clarifai
      if (process.env.CLARIFAI_PAT) {
        try {
          visionResult = await analyzeImageWithClarifai(image);
          visionService = 'clarifai';
        } catch (clarifaiError) {
          console.error('Clarifai also failed:', clarifaiError);
          throw new Error('Both vision services failed');
        }
      } else {
        throw new Error('No vision API keys configured');
      }
    }

    if (!visionResult?.labels || visionResult.labels.length === 0) {
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
          visionResult.labels,
          process.env.OPENAI_API_KEY
        );
        aiService = 'openai';
      }
      // Try Clarifai LLM if available
      else if (process.env.CLARIFAI_PAT) {
        interpretation = await interpretWithClarifai(
          visionResult.labels,
          process.env.CLARIFAI_PAT
        );
        aiService = 'clarifai-llm';
      }
      // Fallback to rule-based interpretation
      else {
        interpretation = interpretWithRules(visionResult.labels);
        aiService = 'rules';
      }
    } catch (aiError) {
      console.error('AI interpretation failed, using rules:', aiError);
      // Fallback to rule-based if AI fails
      interpretation = interpretWithRules(visionResult.labels);
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
        disposal_location: interpretation.disposal_location,
        disposal_address: interpretation.disposal_address,
        disposal_phone: interpretation.disposal_phone,
        category: interpretation.is_recyclable ? 'recyclable' :
                  interpretation.bin_color === 'Special' ? 'hazardous' : 'trash',
        material: detectMaterial(visionResult.labels)
      },
      recyclable: interpretation.is_recyclable,
      confidence: interpretation.confidence,
      vision_labels: visionResult.labels.slice(0, 5),
      processing_time_ms: Date.now() - startTime,
      services: {
        vision: visionService,
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
  const hasGoogleVision = !!process.env.GOOGLE_VISION_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasClarifai = !!process.env.CLARIFAI_PAT;

  return NextResponse.json({
    status: 'healthy',
    services: {
      vision_primary: hasGoogleVision ? 'google-vision' : 'none',
      vision_fallback: hasClarifai ? 'clarifai' : 'none',
      ai_interpreter: hasOpenAI ? 'openai' : hasClarifai ? 'clarifai' : 'rules-based'
    },
    endpoints: {
      identify: 'POST /api/identify',
      test: 'POST /api/identify/test',
      search: 'GET /api/search'
    },
    configured: {
      google_vision: hasGoogleVision,
      openai: hasOpenAI,
      clarifai: hasClarifai,
      fallback: 'always available'
    }
  });
}