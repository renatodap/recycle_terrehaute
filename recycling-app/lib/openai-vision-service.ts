import OpenAI from 'openai';

// OpenAI Vision API interface matching our VisionAnalysisResult
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

let openaiClient: OpenAI | null = null;

// Initialize OpenAI client
export function getOpenAIClient(): OpenAI | null {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Analyze image using OpenAI Vision API
export async function analyzeImageWithOpenAI(
  imageBase64: string
): Promise<VisionAnalysisResult> {
  const startTime = Date.now();

  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    // Create the prompt for structured output
    const prompt = `Analyze this image and identify what objects are present. For recycling purposes, identify:
1. The main object(s) in the image
2. Material type (plastic, glass, metal, paper, organic, electronics, etc.)
3. Any text visible on the object
4. Brand or product information if visible

Please provide a detailed analysis in the following JSON format:
{
  "main_objects": [{"name": "object name", "confidence": 0.0-1.0}],
  "materials": [{"type": "material type", "confidence": 0.0-1.0}],
  "text_found": ["text1", "text2"],
  "brands": ["brand1", "brand2"],
  "recycling_relevant": true/false,
  "description": "brief description"
}`;

    // Call OpenAI Vision API
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI Vision API');
    }

    // Parse the JSON response
    let analysisData: any;
    try {
      // Extract JSON from the response (sometimes wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      // Fallback: extract information from text response
      analysisData = {
        main_objects: [{ name: "unidentified object", confidence: 0.5 }],
        materials: [],
        text_found: [],
        brands: [],
        description: content
      };
    }

    // Convert to our standard format
    const result: VisionAnalysisResult = {
      labels: [],
      objects: [],
      texts: analysisData.text_found || [],
      webEntities: []
    };

    // Add main objects as both labels and objects
    if (analysisData.main_objects) {
      for (const obj of analysisData.main_objects) {
        result.labels.push({
          description: obj.name,
          score: obj.confidence || 0.8
        });
        result.objects.push({
          name: obj.name,
          score: obj.confidence || 0.8
        });
      }
    }

    // Add materials as labels
    if (analysisData.materials) {
      for (const material of analysisData.materials) {
        result.labels.push({
          description: material.type,
          score: material.confidence || 0.7
        });
      }
    }

    // Add brands as web entities
    if (analysisData.brands) {
      for (const brand of analysisData.brands) {
        result.webEntities.push({
          description: brand,
          score: 0.8
        });
      }
    }

    // Add recycling-relevant items
    if (analysisData.recycling_relevant) {
      result.labels.push({
        description: 'recyclable material',
        score: 0.9
      });
    }

    // If we have a description but no specific objects, parse it
    if (result.labels.length === 0 && analysisData.description) {
      // Common recyclable items to look for in description
      const items = ['bottle', 'can', 'paper', 'cardboard', 'plastic', 'glass', 'metal', 'apple', 'food', 'fruit', 'organic'];
      const desc = analysisData.description.toLowerCase();

      for (const item of items) {
        if (desc.includes(item)) {
          result.labels.push({
            description: item,
            score: 0.7
          });
          if (['bottle', 'can', 'apple'].includes(item)) {
            result.objects.push({
              name: item,
              score: 0.7
            });
          }
        }
      }
    }

    console.log(`OpenAI Vision API analysis completed in ${Date.now() - startTime}ms`);
    return result;

  } catch (error) {
    console.error('OpenAI Vision API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Return a result with error
    return {
      labels: [],
      objects: [],
      texts: [],
      webEntities: [],
      error: `OpenAI Vision API failed: ${errorMessage}`
    };
  }
}

// Check if OpenAI Vision is configured
export function isOpenAIVisionConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// Simple fallback detection for common items
export function getFallbackDetection(imageBase64: string): VisionAnalysisResult {
  // This is a simple fallback - in production you'd want more sophisticated logic
  return {
    labels: [
      { description: 'object', score: 0.5 },
      { description: 'item', score: 0.4 }
    ],
    objects: [
      { name: 'unidentified item', score: 0.5 }
    ],
    texts: [],
    webEntities: [],
    error: 'Using fallback detection'
  };
}