import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
}

export interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

/**
 * Compress and optimize an image for upload
 * Intelligently reduces size while maintaining quality for AI analysis
 */
export async function compressImage(
  imageUri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1024,  // Good balance for AI analysis
    maxHeight = 1024,
    quality = 0.65,   // 65% quality optimized for AI analysis
    format = ImageManipulator.SaveFormat.JPEG,
  } = options;

  try {
    // Get original image info
    const originalInfo = await getImageInfo(imageUri);

    // Calculate optimal dimensions while maintaining aspect ratio
    const { width, height } = calculateOptimalDimensions(
      originalInfo.width,
      originalInfo.height,
      maxWidth,
      maxHeight
    );

    // Prepare manipulation actions
    const actions: ImageManipulator.Action[] = [];

    // Only resize if the image is larger than max dimensions
    if (originalInfo.width > width || originalInfo.height > height) {
      actions.push({
        resize: { width, height },
      });
    }

    // Compress the image
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      actions,
      {
        compress: quality,
        format,
        base64: true, // Include base64 for direct upload
      }
    );

    // Estimate compression ratio (approximate)
    const originalSizeEstimate = originalInfo.width * originalInfo.height * 3; // RGB bytes
    const compressedSizeEstimate = result.base64 ? result.base64.length * 0.75 : 0; // Base64 to bytes
    const compressionRatio = originalSizeEstimate > 0
      ? (1 - (compressedSizeEstimate / originalSizeEstimate)) * 100
      : 0;

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
      originalSize: originalSizeEstimate,
      compressedSize: compressedSizeEstimate,
      compressionRatio: Math.round(compressionRatio),
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image. Please try again.');
  }
}

/**
 * Get image dimensions and metadata
 */
async function getImageInfo(imageUri: string): Promise<{ width: number; height: number }> {
  try {
    // For web platform, we need to load the image to get dimensions
    if (Platform.OS === 'web') {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = imageUri;
      });
    }

    // For native platforms, manipulate with no actions to get info
    const info = await ImageManipulator.manipulateAsync(imageUri, [], {});
    return { width: info.width, height: info.height };
  } catch (error) {
    console.error('Failed to get image info:', error);
    // Return default dimensions if we can't get info
    return { width: 2048, height: 2048 };
  }
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // If image is already smaller than max dimensions, keep original
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  // Calculate scale factors
  const scaleX = maxWidth / originalWidth;
  const scaleY = maxHeight / originalHeight;

  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

/**
 * Progressive compression strategy based on network speed
 */
export async function adaptiveCompress(
  imageUri: string,
  networkSpeed?: 'slow' | 'medium' | 'fast'
): Promise<CompressionResult> {
  // Adjust compression based on network speed
  const compressionProfiles = {
    slow: { maxWidth: 512, maxHeight: 512, quality: 0.4 },    // Aggressive for slow connections
    medium: { maxWidth: 768, maxHeight: 768, quality: 0.6 },  // Balanced
    fast: { maxWidth: 1024, maxHeight: 1024, quality: 0.75 }, // Higher quality for fast connections
  };

  const profile = compressionProfiles[networkSpeed || 'medium'];

  return compressImage(imageUri, profile);
}

/**
 * Batch compress multiple images
 */
export async function batchCompressImages(
  imageUris: string[],
  options?: CompressionOptions
): Promise<CompressionResult[]> {
  const compressionPromises = imageUris.map(uri =>
    compressImage(uri, options).catch(error => {
      console.error(`Failed to compress image ${uri}:`, error);
      return null;
    })
  );

  const results = await Promise.all(compressionPromises);
  return results.filter((result): result is CompressionResult => result !== null);
}

/**
 * Estimate upload time based on file size and network speed
 */
export function estimateUploadTime(
  fileSizeBytes: number,
  networkSpeedKbps: number = 1000 // Default 1 Mbps
): number {
  const fileSizeKb = fileSizeBytes / 1024;
  const uploadTimeSeconds = fileSizeKb / networkSpeedKbps;
  return Math.ceil(uploadTimeSeconds);
}

/**
 * Smart compression that balances quality and size
 */
export async function smartCompress(imageUri: string): Promise<CompressionResult> {
  try {
    // Get original size for better compression decisions
    const originalInfo = await getImageInfo(imageUri);
    const pixelCount = originalInfo.width * originalInfo.height;

    // Dynamic compression based on original size
    let result: CompressionResult;

    if (pixelCount > 4000000) { // > 4MP, needs aggressive compression
      result = await compressImage(imageUri, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.6,
      });
    } else if (pixelCount > 2000000) { // > 2MP, moderate compression
      result = await compressImage(imageUri, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.7,
      });
    } else { // <= 2MP, light compression
      result = await compressImage(imageUri, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8,
      });
    }

    // If still too large (>400KB), compress more aggressively
    if (result.compressedSize && result.compressedSize > 400 * 1024) {
      result = await compressImage(imageUri, {
        maxWidth: 768,
        maxHeight: 768,
        quality: 0.55,
      });
    }

    // If still too large (>250KB), maximum compression
    if (result.compressedSize && result.compressedSize > 250 * 1024) {
      result = await compressImage(imageUri, {
        maxWidth: 640,
        maxHeight: 640,
        quality: 0.45,
      });
    }

    console.log(`Image compressed: ${result.compressionRatio}% reduction`);
    return result;
  } catch (error) {
    console.error('Smart compression failed:', error);
    throw error;
  }
}