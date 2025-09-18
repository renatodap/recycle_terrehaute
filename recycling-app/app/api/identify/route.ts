import { NextRequest, NextResponse } from 'next/server';
import { readRecyclableItems } from '@/lib/csv-utils';

// TODO: Integrate with Google Vision API
// 1. Install @google-cloud/vision package
// 2. Set up authentication with GOOGLE_VISION_API_KEY
// 3. Process image with Vision API
// 4. Match detected labels against recyclable items database

// Mock function for Google Vision API integration
async function analyzeImageWithVisionAPI(imageBase64: string): Promise<string[]> {
  // This is where Google Vision API integration will go
  // For now, return mock labels for testing

  // const vision = new ImageAnnotatorClient({
  //   apiKey: process.env.GOOGLE_VISION_API_KEY,
  // });
  //
  // const [result] = await vision.labelDetection({
  //   image: { content: imageBase64 },
  // });
  //
  // const labels = result.labelAnnotations?.map(label => label.description) || [];
  // return labels;

  // Mock response for demonstration
  const mockLabels = ['Plastic Bottle', 'Bottle', 'Plastic', 'Container'];
  return mockLabels;
}

// Match detected labels with recyclable items
function findBestMatch(labels: string[], items: any[]): any {
  let bestMatch = null;
  let highestScore = 0;

  for (const item of items) {
    let score = 0;
    const itemName = item.item.toLowerCase();
    const itemCategory = item.category.toLowerCase();

    for (const label of labels) {
      const lowerLabel = label.toLowerCase();

      // Exact match
      if (itemName === lowerLabel) {
        score += 10;
      }
      // Partial match in name
      else if (itemName.includes(lowerLabel) || lowerLabel.includes(itemName)) {
        score += 5;
      }
      // Category match
      else if (itemCategory === lowerLabel || lowerLabel.includes(itemCategory)) {
        score += 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { ...item, confidence: Math.min(score / 10, 1) };
    }
  }

  return bestMatch || {
    item: 'Unknown Item',
    category: 'Unknown',
    recyclable: 'Unknown',
    special_instructions: 'Could not identify this item. Try searching manually.',
    confidence: 0
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Analyze image with Vision API (mock for now)
    const detectedLabels = await analyzeImageWithVisionAPI(base64);

    // Load recyclable items from CSV
    const recyclableItems = await readRecyclableItems();

    // Find best matching item
    const match = findBestMatch(detectedLabels, recyclableItems);

    return NextResponse.json({
      success: true,
      detectedLabels,
      match,
      message: 'Image analyzed successfully'
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}