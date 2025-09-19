import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithGoogleVision, isGoogleVisionConfigured } from '@/lib/google-vision-service';
import { analyzeImageWithVision } from '@/lib/vision-service';
import { analyzeImageWithOpenAI, isOpenAIVisionConfigured } from '@/lib/openai-vision-service';
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

    // Step 1: Try vision APIs in order of preference
    let visionResult;
    let visionService = 'none';

    try {
      // Try OpenAI Vision first (best for general object recognition)
      if (isOpenAIVisionConfigured()) {
        console.log('Attempting OpenAI Vision API...');
        visionResult = await analyzeImageWithOpenAI(image);
        if (!visionResult.error && visionResult.labels.length > 0) {
          visionService = 'openai-vision';
        } else {
          throw new Error(visionResult.error || 'OpenAI Vision returned no results');
        }
      }
      // Try Google Cloud Vision with service account
      else if (isGoogleVisionConfigured()) {
        console.log('Attempting Google Cloud Vision API with service account...');
        visionResult = await analyzeImageWithGoogleVision(image);
        if (visionResult.success) {
          visionService = 'google-vision-cloud';
        } else {
          throw new Error(visionResult.error || 'Google Vision failed');
        }
      }
      // Try Google Vision with API key
      else if (process.env.GOOGLE_VISION_API_KEY) {
        console.log('Attempting Google Vision API with API key...');
        visionResult = await analyzeImageWithVision(image);
        visionService = 'google-vision-apikey';
      } else {
        throw new Error('No vision API configured');
      }
    } catch (visionError) {
      console.error('Primary vision API failed:', visionError);

      // Try fallback options
      try {
        if (!visionService.startsWith('openai') && isOpenAIVisionConfigured()) {
          console.log('Falling back to OpenAI Vision...');
          visionResult = await analyzeImageWithOpenAI(image);
          if (!visionResult.error && visionResult.labels.length > 0) {
            visionService = 'openai-vision-fallback';
          } else {
            throw new Error('OpenAI Vision fallback failed');
          }
        } else if (process.env.CLARIFAI_PAT) {
          console.log('Falling back to Clarifai...');
          visionResult = await analyzeImageWithClarifai(image);
          visionService = 'clarifai';
        } else {
          throw new Error('All vision services failed');
        }
      } catch (fallbackError) {
        console.error('All vision APIs failed:', fallbackError);
        throw new Error('Unable to analyze image with any vision service');
      }
    }

    if (!visionResult?.labels || visionResult.labels.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not identify item in image',
        processing_time_ms: Date.now() - startTime
      });
    }

    // Normalize labels to consistent format { name, value }
    const normalizedLabels = visionResult.labels.map(label => ({
      name: 'name' in label ? label.name : (label as any).description || '',
      value: 'value' in label ? label.value : (label as any).score || 0
    }));

    // Step 2: Use AI to interpret the results for recycling
    let interpretation;
    let aiService = 'rules'; // Track which service we used

    try {
      // Try OpenAI first if available
      if (process.env.OPENAI_API_KEY) {
        interpretation = await interpretWithOpenAI(
          normalizedLabels,
          process.env.OPENAI_API_KEY
        );
        aiService = 'openai';
      }
      // Try Clarifai LLM if available
      else if (process.env.CLARIFAI_PAT) {
        interpretation = await interpretWithClarifai(
          normalizedLabels,
          process.env.CLARIFAI_PAT
        );
        aiService = 'clarifai-llm';
      }
      // Fallback to rule-based interpretation
      else {
        interpretation = interpretWithRules(normalizedLabels);
        aiService = 'rules';
      }
    } catch (aiError) {
      console.error('AI interpretation failed, using rules:', aiError);
      // Fallback to rule-based if AI fails
      interpretation = interpretWithRules(normalizedLabels);
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
        material: detectMaterial(normalizedLabels)
      },
      recyclable: interpretation.is_recyclable,
      confidence: interpretation.confidence,
      vision_labels: normalizedLabels.slice(0, 5),
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
  const hasOpenAIVision = isOpenAIVisionConfigured();
  const hasGoogleVisionCloud = isGoogleVisionConfigured();
  const hasGoogleVisionKey = !!process.env.GOOGLE_VISION_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasClarifai = !!process.env.CLARIFAI_PAT;

  return NextResponse.json({
    status: 'healthy',
    services: {
      vision_primary: hasOpenAIVision ? 'openai-vision' : hasGoogleVisionCloud ? 'google-vision-cloud' : hasGoogleVisionKey ? 'google-vision-apikey' : 'none',
      vision_fallback: hasClarifai ? 'clarifai' : 'none',
      ai_interpreter: hasOpenAI ? 'openai' : hasClarifai ? 'clarifai' : 'rules-based'
    },
    endpoints: {
      identify: 'POST /api/identify',
      test: 'POST /api/identify/test',
      search: 'GET /api/search'
    },
    configured: {
      openai_vision: hasOpenAIVision,
      google_vision_cloud: hasGoogleVisionCloud,
      google_vision_apikey: hasGoogleVisionKey,
      openai_interpreter: hasOpenAI,
      clarifai: hasClarifai,
      fallback: 'always available'
    }
  });
}