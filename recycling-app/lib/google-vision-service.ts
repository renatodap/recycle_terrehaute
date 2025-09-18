// Google Cloud Vision API Service using Service Account Credentials
import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

// Initialize the client
let visionClient: vision.ImageAnnotatorClient | null = null;

/**
 * Setup Google Vision credentials from environment variables
 * Handles both file path and JSON string formats
 */
function setupCredentials() {
  // Check if we have the Vercel-style env var (with S at the end)
  if (process.env.GOOGLE_APPLICATIONS_CREDENTIALS && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credentials = process.env.GOOGLE_APPLICATIONS_CREDENTIALS;

    // If it looks like JSON content (starts with {), write it to a temp file
    if (credentials.trim().startsWith('{')) {
      try {
        // Parse to validate it's valid JSON
        JSON.parse(credentials);

        // In serverless environment, write to /tmp
        const tempPath = '/tmp/google-credentials.json';
        fs.writeFileSync(tempPath, credentials);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
        console.log('Google Vision credentials configured from JSON content');
      } catch (error) {
        console.error('Failed to parse Google credentials JSON:', error);
      }
    } else {
      // It's a file path, just use it
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;
    }
  }
}

function getVisionClient() {
  if (!visionClient) {
    setupCredentials();

    // Check if credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('Google Vision credentials not configured');
    }

    // The client will automatically use GOOGLE_APPLICATION_CREDENTIALS env var
    visionClient = new vision.ImageAnnotatorClient();
  }
  return visionClient;
}

export interface VisionLabel {
  name: string;
  value: number;
}

export interface VisionResult {
  success: boolean;
  labels: VisionLabel[];
  error?: string;
}

/**
 * Analyze image using Google Cloud Vision API with Service Account
 */
export async function analyzeImageWithGoogleVision(imageBase64: string): Promise<VisionResult> {
  try {
    const client = getVisionClient();

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Prepare the request
    const request = {
      image: {
        content: base64Data
      },
      features: [
        {
          type: 'LABEL_DETECTION' as const,
          maxResults: 10
        },
        {
          type: 'OBJECT_LOCALIZATION' as const,
          maxResults: 5
        }
      ]
    };

    // Make the API call
    const [result] = await client.annotateImage(request);

    // Process labels
    const labels: VisionLabel[] = [];

    // Add label detection results
    if (result.labelAnnotations) {
      result.labelAnnotations.forEach(label => {
        if (label.description && label.score) {
          labels.push({
            name: label.description,
            value: label.score
          });
        }
      });
    }

    // Add object detection results
    if (result.localizedObjectAnnotations) {
      result.localizedObjectAnnotations.forEach(obj => {
        if (obj.name && obj.score) {
          // Add object names with slightly lower confidence to prioritize labels
          labels.push({
            name: obj.name,
            value: obj.score * 0.9
          });
        }
      });
    }

    // Sort by confidence and deduplicate
    const uniqueLabels = Array.from(
      new Map(labels.map(item => [item.name.toLowerCase(), item])).values()
    ).sort((a, b) => b.value - a.value);

    return {
      success: true,
      labels: uniqueLabels
    };

  } catch (error) {
    console.error('Google Vision API Error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('PERMISSION_DENIED')) {
        return {
          success: false,
          labels: [],
          error: 'Google Vision API permission denied. Please check your credentials.'
        };
      }
      if (error.message.includes('API not enabled')) {
        return {
          success: false,
          labels: [],
          error: 'Google Vision API is not enabled for this project.'
        };
      }
      if (error.message.includes('UNAUTHENTICATED')) {
        return {
          success: false,
          labels: [],
          error: 'Authentication failed. Please check your service account credentials.'
        };
      }
    }

    return {
      success: false,
      labels: [],
      error: 'Failed to analyze image with Google Vision API'
    };
  }
}

/**
 * Check if Google Vision is properly configured
 */
export function isGoogleVisionConfigured(): boolean {
  // Check for standard service account credentials env var
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return true;
  }

  // Check for Vercel-style env var (with S at the end)
  if (process.env.GOOGLE_APPLICATIONS_CREDENTIALS) {
    return true;
  }

  return false;
}