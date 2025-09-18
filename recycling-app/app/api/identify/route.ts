import { NextRequest, NextResponse } from 'next/server';
import { readRecyclableItemsEnhanced } from '@/lib/csv-utils';
import {
  analyzeImageWithVision,
  trackApiUsage,
  VisionAnalysisResult
} from '@/lib/vision-service';
import {
  findMatches,
  getUnidentifiedObjects,
  RecyclableItemEnhanced
} from '@/lib/matching-algorithm';
import {
  generateCacheKey,
  getCachedResult,
  setCachedResult,
  checkRateLimit,
  checkDailyLimit,
} from '@/lib/cache-service';

// Get client ID from request
function getClientId(request: NextRequest): string {
  // In production, use authenticated user ID
  // For now, use IP address or a default
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'default-client';
  return ip;
}

// Main identify endpoint
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientId = getClientId(request);

  try {
    // Check rate limits
    const rateLimit = checkRateLimit(clientId, {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${rateLimit.resetTime.toISOString()}`,
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toISOString(),
          }
        }
      );
    }

    // Check daily limits
    const dailyLimit = checkDailyLimit(clientId,
      parseInt(process.env.DAILY_API_LIMIT || '1000')
    );

    if (!dailyLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Daily limit exceeded',
          message: `Daily API limit reached. Resets at ${dailyLimit.resetTime.toISOString()}`,
          used: dailyLimit.used,
          limit: 1000,
          resetTime: dailyLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // Parse request
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate image size (max 4MB)
    if (image.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'Image too large',
          message: 'Image size must be less than 4MB'
        },
        { status: 400 }
      );
    }

    // Validate image type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        {
          error: 'Invalid image type',
          message: 'Image must be JPEG, PNG, or WebP format'
        },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Check cache
    const cacheKey = generateCacheKey(base64);
    const cachedResult = getCachedResult(cacheKey);

    if (cachedResult) {
      console.log('Returning cached result');
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        processing_time_ms: Date.now() - startTime,
      });
    }

    // Analyze image with Vision API
    console.log('Analyzing image with Vision API...');
    const visionResult = await analyzeImageWithVision(base64);

    // Check if Vision API returned an error
    if (visionResult.error) {
      console.warn('Vision API error, using fallback:', visionResult.error);
    }

    // Load recyclable items from enhanced CSV
    const recyclableItems = await readRecyclableItemsEnhanced();

    // Find matches using intelligent algorithm
    console.log('Running matching algorithm...');
    const matches = findMatches(visionResult, recyclableItems);

    // Get unidentified objects
    const unidentifiedObjects = getUnidentifiedObjects(visionResult, matches);

    // Track API usage
    const apiUsage = trackApiUsage();

    // Prepare response
    const response = {
      success: true,
      identified_items: matches.map(match => ({
        name: match.name,
        confidence: Math.round(match.confidence),
        is_recyclable: match.is_recyclable,
        bin_type: match.bin_type,
        category: match.category,
        special_instructions: match.special_instructions,
        contamination_notes: match.contamination_notes,
        alternative_disposal: match.alternative_disposal,
        vision_labels: match.vision_labels.slice(0, 10), // Limit to 10 labels
        matching_method: match.matching_method,
      })),
      unidentified_objects: unidentifiedObjects,
      api_credits_remaining: apiUsage.remaining,
      processing_time_ms: Date.now() - startTime,
      vision_api_used: !visionResult.error,
      rate_limit: {
        remaining: rateLimit.remaining - 1,
        reset: rateLimit.resetTime,
      },
      daily_limit: {
        used: dailyLimit.used,
        remaining: dailyLimit.remaining - 1,
        reset: dailyLimit.resetTime,
      },
    };

    // Cache the result
    setCachedResult(cacheKey, response);

    // Add helpful message if no matches found
    if (matches.length === 0) {
      response.identified_items = [{
        name: 'Unknown Item',
        confidence: 0,
        is_recyclable: false,
        bin_type: 'trash',
        category: 'Unknown',
        special_instructions: 'Could not identify this item. Please try manual search or take a clearer photo.',
        contamination_notes: '',
        alternative_disposal: 'When in doubt, throw it out to avoid contaminating recycling.',
        vision_labels: visionResult.labels.map(l => l.description).slice(0, 5),
        matching_method: 'none' as any,
      }];
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in identify endpoint:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        message: (error as Error).message,
        processing_time_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    endpoints: {
      identify: 'POST /api/identify',
      test: 'POST /api/identify/test',
    },
    vision_configured: !!(
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_VISION_API_KEY
    ),
    cache_enabled: true,
    rate_limiting: true,
  });
}