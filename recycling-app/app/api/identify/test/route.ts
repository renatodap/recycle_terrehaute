import { NextRequest, NextResponse } from 'next/server';
import { getMockVisionResult } from '@/lib/vision-service';
import { findMatches, getUnidentifiedObjects } from '@/lib/matching-algorithm';
import { readRecyclableItemsEnhanced } from '@/lib/csv-utils';

// Test scenarios for different types of items
const TEST_SCENARIOS = {
  'plastic-bottle': {
    description: 'Clear plastic water bottle',
    mockResult: {
      labels: [
        { description: 'plastic bottle', score: 0.95 },
        { description: 'water bottle', score: 0.92 },
        { description: 'bottle', score: 0.90 },
        { description: 'plastic', score: 0.85 },
        { description: 'recyclable', score: 0.75 },
      ],
      objects: [
        { name: 'Bottle', score: 0.93 },
      ],
      texts: ['DASANI', 'PURE', 'WATER', 'PETE', '1'],
      webEntities: [
        { description: 'Dasani water bottle', score: 0.88 },
        { description: 'PET plastic recycling', score: 0.82 },
      ],
    }
  },
  'pizza-box': {
    description: 'Used pizza box with grease stains',
    mockResult: {
      labels: [
        { description: 'pizza box', score: 0.91 },
        { description: 'cardboard', score: 0.88 },
        { description: 'food container', score: 0.82 },
        { description: 'box', score: 0.80 },
      ],
      objects: [
        { name: 'Box', score: 0.85 },
        { name: 'Food', score: 0.65 },
      ],
      texts: ['DOMINOS', 'PIZZA', 'LARGE'],
      webEntities: [
        { description: 'Pizza delivery box', score: 0.84 },
        { description: 'Cardboard food packaging', score: 0.76 },
      ],
    }
  },
  'battery': {
    description: 'AA alkaline battery',
    mockResult: {
      labels: [
        { description: 'battery', score: 0.96 },
        { description: 'AA battery', score: 0.92 },
        { description: 'alkaline battery', score: 0.88 },
        { description: 'electronic component', score: 0.72 },
      ],
      objects: [
        { name: 'Battery', score: 0.94 },
      ],
      texts: ['DURACELL', 'AA', '1.5V', 'ALKALINE'],
      webEntities: [
        { description: 'Duracell AA battery', score: 0.90 },
        { description: 'Alkaline battery disposal', score: 0.78 },
      ],
    }
  },
  'styrofoam': {
    description: 'Styrofoam takeout container',
    mockResult: {
      labels: [
        { description: 'styrofoam', score: 0.89 },
        { description: 'foam container', score: 0.86 },
        { description: 'takeout container', score: 0.83 },
        { description: 'polystyrene', score: 0.78 },
      ],
      objects: [
        { name: 'Container', score: 0.82 },
      ],
      texts: ['6', 'PS'],
      webEntities: [
        { description: 'Polystyrene foam container', score: 0.81 },
        { description: 'Styrofoam recycling', score: 0.65 },
      ],
    }
  },
  'multiple-items': {
    description: 'Multiple items in one image',
    mockResult: {
      labels: [
        { description: 'plastic bottle', score: 0.88 },
        { description: 'aluminum can', score: 0.85 },
        { description: 'cardboard', score: 0.82 },
        { description: 'recyclables', score: 0.78 },
      ],
      objects: [
        { name: 'Bottle', score: 0.86 },
        { name: 'Can', score: 0.84 },
        { name: 'Box', score: 0.80 },
      ],
      texts: ['COKE', 'DASANI', 'AMAZON'],
      webEntities: [
        { description: 'Mixed recyclables', score: 0.75 },
        { description: 'Recycling bin contents', score: 0.70 },
      ],
    }
  },
  'unknown-item': {
    description: 'Unrecognizable or blurry item',
    mockResult: {
      labels: [
        { description: 'object', score: 0.52 },
        { description: 'material', score: 0.48 },
      ],
      objects: [],
      texts: [],
      webEntities: [],
    }
  },
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { scenario = 'plastic-bottle' } = await request.json();

    // Validate scenario
    if (!TEST_SCENARIOS[scenario as keyof typeof TEST_SCENARIOS]) {
      return NextResponse.json(
        {
          error: 'Invalid test scenario',
          available_scenarios: Object.keys(TEST_SCENARIOS),
        },
        { status: 400 }
      );
    }

    // Get mock vision result for scenario
    const testData = TEST_SCENARIOS[scenario as keyof typeof TEST_SCENARIOS];
    const visionResult = testData.mockResult;

    // Load recyclable items
    const recyclableItems = await readRecyclableItemsEnhanced();

    // Run matching algorithm
    const matches = findMatches(visionResult, recyclableItems);
    const unidentifiedObjects = getUnidentifiedObjects(visionResult, matches);

    // Prepare test response
    const response = {
      success: true,
      test_mode: true,
      scenario: scenario,
      scenario_description: testData.description,
      identified_items: matches.map(match => ({
        name: match.name,
        confidence: Math.round(match.confidence),
        is_recyclable: match.is_recyclable,
        bin_type: match.bin_type,
        category: match.category,
        special_instructions: match.special_instructions,
        contamination_notes: match.contamination_notes,
        alternative_disposal: match.alternative_disposal,
        vision_labels: match.vision_labels.slice(0, 10),
        matching_method: match.matching_method,
      })),
      unidentified_objects: unidentifiedObjects,
      vision_result_summary: {
        labels_count: visionResult.labels.length,
        objects_count: visionResult.objects.length,
        texts_found: visionResult.texts.length > 0,
        web_entities_count: visionResult.webEntities.length,
      },
      processing_time_ms: Date.now() - startTime,
    };

    // Add message if no matches
    if (matches.length === 0) {
      response.identified_items = [{
        name: 'Unknown Item',
        confidence: 0,
        is_recyclable: false,
        bin_type: 'trash',
        category: 'Unknown',
        special_instructions: 'Could not identify this item in test mode.',
        contamination_notes: '',
        alternative_disposal: 'When in doubt, throw it out.',
        vision_labels: visionResult.labels.map(l => l.description),
        matching_method: 'none' as any,
      }];
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      {
        error: 'Test endpoint error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show available test scenarios
export async function GET() {
  const scenarios = Object.entries(TEST_SCENARIOS).map(([key, value]) => ({
    scenario: key,
    description: value.description,
    example_request: {
      method: 'POST',
      body: { scenario: key },
    },
  }));

  return NextResponse.json({
    test_endpoint: '/api/identify/test',
    description: 'Test the recycling identification system without using Google Vision API',
    available_scenarios: scenarios,
    usage: 'POST to this endpoint with { "scenario": "scenario-name" }',
  });
}