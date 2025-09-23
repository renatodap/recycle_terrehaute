// Clarifai Vision Service for Recycling Identification
// Much simpler than Google Vision API - just needs an API key!

export interface ClarifaiResult {
  labels: Array<{
    name: string;
    value: number; // confidence score 0-1
  }>;
  error?: string;
}

// Clarifai API configuration
const CLARIFAI_API_BASE = 'https://api.clarifai.com/v2';
const GENERAL_MODEL_ID = 'general-image-recognition'; // Clarifai's general model

// Main analysis function using Clarifai
export async function analyzeImageWithClarifai(
  imageBase64: string
): Promise<ClarifaiResult> {
  const apiKey = process.env.CLARIFAI_PAT || process.env.CLARIFAI_API_KEY;

  if (!apiKey) {
    console.log('No Clarifai API key found, using mock data');
    return getMockClarifaiResult();
  }

  try {
    // Clarifai API endpoint for predictions
    const response = await fetch(`${CLARIFAI_API_BASE}/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [
          {
            data: {
              image: {
                base64: imageBase64
              }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Clarifai API error:', error);

      // Return mock data as fallback
      return getMockClarifaiResult();
    }

    const data = await response.json();

    // Extract concepts (labels) from Clarifai response
    const concepts = data.outputs?.[0]?.data?.concepts || [];

    const result: ClarifaiResult = {
      labels: concepts.map((concept: any) => ({
        name: concept.name,
        value: concept.value
      }))
    };

    return result;

  } catch (error) {
    console.error('Clarifai API error:', error);
    const mockResult = getMockClarifaiResult();
    mockResult.error = (error as Error).message;
    return mockResult;
  }
}

// Convert Clarifai labels to recycling categories
export function interpretClarifaiLabels(labels: ClarifaiResult['labels']) {
  const labelNames = labels.map(l => l.name.toLowerCase());
  const highConfidenceLabels = labels.filter(l => l.value > 0.7);

  // Check for specific recyclable items
  const recyclableKeywords = [
    'bottle', 'plastic', 'glass', 'can', 'aluminum', 'paper',
    'cardboard', 'newspaper', 'magazine', 'metal', 'container',
    'jar', 'tin', 'steel', 'package', 'box', 'carton'
  ];

  const nonRecyclableKeywords = [
    'styrofoam', 'plastic bag', 'food', 'organic', 'trash',
    'waste', 'battery', 'electronics', 'hazardous', 'chemical',
    'oil', 'paint', 'diaper', 'tissue', 'napkin'
  ];

  const specialKeywords = [
    'battery', 'electronics', 'computer', 'phone', 'monitor',
    'television', 'appliance', 'lightbulb', 'fluorescent'
  ];

  // Determine category
  let category = 'unknown';
  let isRecyclable = false;
  let confidence = 0;
  let itemName = 'Unknown Item';

  // Check for recyclable items
  for (const keyword of recyclableKeywords) {
    const match = labels.find(l => l.name.toLowerCase().includes(keyword));
    if (match && match.value > 0.5) {
      category = 'recyclable';
      isRecyclable = true;
      confidence = match.value;
      itemName = match.name;
      break;
    }
  }

  // Check for non-recyclable items (overrides recyclable if found with higher confidence)
  for (const keyword of nonRecyclableKeywords) {
    const match = labels.find(l => l.name.toLowerCase().includes(keyword));
    if (match && match.value > confidence) {
      category = 'trash';
      isRecyclable = false;
      confidence = match.value;
      itemName = match.name;
      break;
    }
  }

  // Check for special disposal items
  for (const keyword of specialKeywords) {
    const match = labels.find(l => l.name.toLowerCase().includes(keyword));
    if (match && match.value > 0.6) {
      category = 'special';
      isRecyclable = false;
      confidence = match.value;
      itemName = match.name;
      break;
    }
  }

  // Material detection
  let material = 'Unknown';
  if (labelNames.some(l => l.includes('plastic'))) material = 'Plastic';
  else if (labelNames.some(l => l.includes('glass'))) material = 'Glass';
  else if (labelNames.some(l => l.includes('metal') || l.includes('aluminum'))) material = 'Metal';
  else if (labelNames.some(l => l.includes('paper') || l.includes('cardboard'))) material = 'Paper';
  else if (labelNames.some(l => l.includes('organic') || l.includes('food'))) material = 'Organic';

  return {
    itemName,
    category,
    isRecyclable,
    material,
    confidence,
    allLabels: labels
  };
}

// Mock results for testing
export function getMockClarifaiResult(): ClarifaiResult {
  const scenarios = [
    {
      labels: [
        { name: 'plastic bottle', value: 0.95 },
        { name: 'bottle', value: 0.92 },
        { name: 'container', value: 0.88 },
        { name: 'recyclable', value: 0.85 },
        { name: 'plastic', value: 0.83 }
      ]
    },
    {
      labels: [
        { name: 'aluminum can', value: 0.93 },
        { name: 'beverage', value: 0.90 },
        { name: 'metal', value: 0.87 },
        { name: 'container', value: 0.84 },
        { name: 'recyclable', value: 0.82 }
      ]
    },
    {
      labels: [
        { name: 'cardboard box', value: 0.91 },
        { name: 'package', value: 0.88 },
        { name: 'shipping', value: 0.85 },
        { name: 'paper', value: 0.83 },
        { name: 'recyclable', value: 0.80 }
      ]
    }
  ];

  return scenarios[Math.floor(Math.random() * scenarios.length)];
}