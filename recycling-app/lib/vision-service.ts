import { ImageAnnotatorClient } from '@google-cloud/vision';

// Vision API client configuration
let visionClient: ImageAnnotatorClient | null = null;

// Initialize Vision API client
export function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    // Check for credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account JSON file
      visionClient = new ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    } else if (process.env.GOOGLE_VISION_API_KEY) {
      // For API key usage, we'll make direct HTTP requests instead
      // The Google Cloud client library doesn't directly support API keys
      console.log('Google Vision API Key detected, using HTTP mode');
      return null as any; // We'll handle this in analyzeImageWithVision
    } else {
      // Fallback to mock mode
      console.warn('No Google Vision credentials found. Using mock mode.');
      return null as any;
    }
  }
  return visionClient;
}

export interface VisionAnalysisResult {
  labels: Array<{
    description: string;
    score: number;
  }>;
  objects: Array<{
    name: string;
    score: number;
    boundingBox?: {
      normalizedVertices: Array<{ x: number; y: number }>;
    };
  }>;
  texts: string[];
  webEntities: Array<{
    description: string;
    score: number;
  }>;
  error?: string;
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const errorMessage = lastError.message.toLowerCase();
      if (
        errorMessage.includes('rate limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('timeout')
      ) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Use Vision API with API Key via HTTP
async function analyzeWithApiKey(imageBase64: string): Promise<VisionAnalysisResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    throw new Error('Google Vision API key not found');
  }

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        image: {
          content: imageBase64
        },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          { type: 'TEXT_DETECTION', maxResults: 50 },
          { type: 'WEB_DETECTION', maxResults: 10 }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vision API error: ${error}`);
    }

    const data = await response.json();
    const result = data.responses[0];

    // Process the response into our format
    const processedResult: VisionAnalysisResult = {
      labels: [],
      objects: [],
      texts: [],
      webEntities: [],
    };

    // Extract labels
    if (result.labelAnnotations) {
      processedResult.labels = result.labelAnnotations
        .filter((label: any) => label.score > 0.5)
        .map((label: any) => ({
          description: label.description || '',
          score: label.score || 0,
        }));
    }

    // Extract objects
    if (result.localizedObjectAnnotations) {
      processedResult.objects = result.localizedObjectAnnotations
        .filter((obj: any) => obj.score > 0.5)
        .map((obj: any) => ({
          name: obj.name || '',
          score: obj.score || 0,
        }));
    }

    // Extract text
    if (result.textAnnotations && result.textAnnotations.length > 0) {
      const fullText = result.textAnnotations[0].description || '';
      processedResult.texts = fullText
        .split(/\s+/)
        .filter((text: string) => text.length > 2)
        .slice(0, 50);
    }

    // Extract web entities
    if (result.webDetection?.webEntities) {
      processedResult.webEntities = result.webDetection.webEntities
        .filter((entity: any) => entity.score && entity.score > 0.5)
        .map((entity: any) => ({
          description: entity.description || '',
          score: entity.score || 0,
        }));
    }

    return processedResult;
  } catch (error) {
    console.error('Vision API HTTP request failed:', error);
    throw error;
  }
}

// Main Vision API analysis function
export async function analyzeImageWithVision(
  imageBase64: string,
  features?: string[]
): Promise<VisionAnalysisResult> {
  const startTime = Date.now();

  try {
    // Check if we should use API key method
    if (process.env.GOOGLE_VISION_API_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Using Vision API with API key');
      const result = await analyzeWithApiKey(imageBase64);
      console.log(`Vision API analysis completed in ${Date.now() - startTime}ms`);
      return result;
    }

    const client = getVisionClient();

    // Use mock data if no client
    if (!client) {
      console.log('Using mock data - no Vision API configured');
      return getMockVisionResult();
    }

    // Validate image size (max 4MB after base64 encoding)
    const imageSizeBytes = Buffer.from(imageBase64, 'base64').length;
    if (imageSizeBytes > 4 * 1024 * 1024) {
      throw new Error('Image size exceeds 4MB limit');
    }

    // Prepare the request
    const request = {
      image: {
        content: imageBase64,
      },
      features: features || [
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'TEXT_DETECTION', maxResults: 50 },
        { type: 'WEB_DETECTION', maxResults: 10 },
      ],
    };

    // Call Vision API with retry logic
    const [result] = await retryWithBackoff(
      () => client.annotateImage(request as any),
      3,
      1000
    );

    // Process results
    const processedResult: VisionAnalysisResult = {
      labels: [],
      objects: [],
      texts: [],
      webEntities: [],
    };

    // Extract labels
    if (result.labelAnnotations) {
      processedResult.labels = result.labelAnnotations
        .filter(label => label.score && label.score > 0.5)
        .map(label => ({
          description: label.description || '',
          score: label.score || 0,
        }));
    }

    // Extract objects
    if (result.localizedObjectAnnotations) {
      processedResult.objects = result.localizedObjectAnnotations
        .filter(obj => obj.score && obj.score > 0.5)
        .map(obj => ({
          name: obj.name || '',
          score: obj.score || 0,
          boundingBox: obj.boundingPoly ? {
            normalizedVertices: (obj.boundingPoly.normalizedVertices || []).map(v => ({
              x: v.x || 0,
              y: v.y || 0,
            })),
          } : undefined,
        }));
    }

    // Extract text
    if (result.textAnnotations && result.textAnnotations.length > 0) {
      // First element is the full text, rest are individual words
      const fullText = result.textAnnotations[0].description || '';
      processedResult.texts = fullText
        .split(/\s+/)
        .filter(text => text.length > 2)
        .slice(0, 50); // Limit to 50 words
    }

    // Extract web entities
    if (result.webDetection?.webEntities) {
      processedResult.webEntities = result.webDetection.webEntities
        .filter(entity => entity.score && entity.score > 0.5)
        .map(entity => ({
          description: entity.description || '',
          score: entity.score || 0,
        }));
    }

    console.log(`Vision API analysis completed in ${Date.now() - startTime}ms`);
    return processedResult;

  } catch (error) {
    console.error('Vision API error:', error);

    // Return mock data as fallback
    const mockResult = getMockVisionResult();
    mockResult.error = (error as Error).message;
    return mockResult;
  }
}

// Mock Vision API results for testing
export function getMockVisionResult(): VisionAnalysisResult {
  // Randomly select a mock scenario
  const scenarios = [
    // Plastic bottle scenario
    {
      labels: [
        { description: 'plastic bottle', score: 0.95 },
        { description: 'bottle', score: 0.92 },
        { description: 'water bottle', score: 0.88 },
        { description: 'beverage container', score: 0.85 },
        { description: 'plastic', score: 0.82 },
        { description: 'recyclable material', score: 0.75 },
      ],
      objects: [
        { name: 'Bottle', score: 0.93 },
        { name: 'Packaged goods', score: 0.78 },
      ],
      texts: ['DASANI', 'WATER', 'PETE', '1', 'RECYCLE'],
      webEntities: [
        { description: 'Dasani water', score: 0.90 },
        { description: 'Plastic bottle recycling', score: 0.82 },
        { description: 'PET bottle', score: 0.78 },
      ],
    },
    // Cardboard box scenario
    {
      labels: [
        { description: 'cardboard', score: 0.91 },
        { description: 'box', score: 0.89 },
        { description: 'shipping box', score: 0.86 },
        { description: 'package', score: 0.83 },
        { description: 'corrugated fiberboard', score: 0.79 },
      ],
      objects: [
        { name: 'Box', score: 0.88 },
        { name: 'Package', score: 0.82 },
      ],
      texts: ['AMAZON', 'PRIME', 'FRAGILE', 'THIS', 'SIDE', 'UP'],
      webEntities: [
        { description: 'Amazon box', score: 0.85 },
        { description: 'Cardboard recycling', score: 0.80 },
        { description: 'Shipping package', score: 0.75 },
      ],
    },
    // Aluminum can scenario
    {
      labels: [
        { description: 'aluminum can', score: 0.94 },
        { description: 'soda can', score: 0.91 },
        { description: 'beverage can', score: 0.88 },
        { description: 'metal', score: 0.85 },
        { description: 'coca cola', score: 0.82 },
      ],
      objects: [
        { name: 'Can', score: 0.92 },
        { name: 'Beverage', score: 0.79 },
      ],
      texts: ['Coca-Cola', 'Classic', '12', 'FL', 'OZ', 'ALUMINUM'],
      webEntities: [
        { description: 'Coca-Cola can', score: 0.88 },
        { description: 'Aluminum recycling', score: 0.83 },
        { description: 'Soda can', score: 0.80 },
      ],
    },
    // Battery scenario
    {
      labels: [
        { description: 'battery', score: 0.96 },
        { description: 'alkaline battery', score: 0.90 },
        { description: 'AA battery', score: 0.87 },
        { description: 'electronic device', score: 0.72 },
      ],
      objects: [
        { name: 'Battery', score: 0.94 },
      ],
      texts: ['DURACELL', 'AA', 'ALKALINE', '1.5V'],
      webEntities: [
        { description: 'Duracell battery', score: 0.91 },
        { description: 'AA battery', score: 0.86 },
        { description: 'Battery recycling', score: 0.78 },
      ],
    },
  ];

  // Return a random scenario
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

// Extract material codes from text
export function extractMaterialCodes(texts: string[]): string[] {
  const materialCodes: string[] = [];
  const codePatterns = [
    /PETE?\s*[#]?\s*1/i,
    /HDPE\s*[#]?\s*2/i,
    /PVC\s*[#]?\s*3/i,
    /LDPE\s*[#]?\s*4/i,
    /PP\s*[#]?\s*5/i,
    /PS\s*[#]?\s*6/i,
    /OTHER\s*[#]?\s*7/i,
    /[#]\s*[1-7]/,
  ];

  for (const text of texts) {
    for (const pattern of codePatterns) {
      if (pattern.test(text)) {
        materialCodes.push(text);
      }
    }
  }

  return [...new Set(materialCodes)]; // Remove duplicates
}

// Check API usage and limits
export interface ApiUsageInfo {
  dailyLimit: number;
  dailyUsed: number;
  remaining: number;
  resetTime: Date;
}

// Simple in-memory usage tracking (replace with database in production)
const apiUsage = {
  count: 0,
  resetDate: new Date().toDateString(),
};

export function trackApiUsage(): ApiUsageInfo {
  const today = new Date().toDateString();

  // Reset counter if it's a new day
  if (apiUsage.resetDate !== today) {
    apiUsage.count = 0;
    apiUsage.resetDate = today;
  }

  apiUsage.count++;

  const dailyLimit = parseInt(process.env.VISION_API_DAILY_LIMIT || '1000');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    dailyLimit,
    dailyUsed: apiUsage.count,
    remaining: Math.max(0, dailyLimit - apiUsage.count),
    resetTime: tomorrow,
  };
}