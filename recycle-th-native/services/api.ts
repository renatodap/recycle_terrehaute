import { AnalysisResult } from '../types/navigation';
import { supabase } from './supabase';
import { retryWithBackoff, getErrorMessage, networkManager } from '../utils/network';
import { smartCompress, compressImage } from '../utils/imageCompression';
import { getSettings } from './storage';
import { performanceMonitor } from '../utils/performanceMonitor';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function analyzeImage(imageUri: string): Promise<AnalysisResult> {
  try {
    // Check network connectivity first
    if (!networkManager.isOnline()) {
      throw {
        code: 'NETWORK_ERROR',
        message: 'No internet connection available',
      };
    }

    // Get user settings for compression
    const settings = await getSettings();

    // Compress the image before upload
    console.log('Compressing image for upload...');
    performanceMonitor.startUploadTimer(); // Start timing

    const compressedImage = settings.dataSaver
      ? await compressImage(imageUri, {
          maxWidth: 640,
          maxHeight: 640,
          quality: 0.5,
        })
      : await smartCompress(imageUri);

    // Log compression results and track metrics
    if (compressedImage.compressionRatio) {
      console.log(`Image compressed by ${compressedImage.compressionRatio}%`);
      if (compressedImage.originalSize && compressedImage.compressedSize) {
        const originalKB = Math.round(compressedImage.originalSize / 1024);
        const compressedKB = Math.round(compressedImage.compressedSize / 1024);
        console.log(`Size reduced from ~${originalKB}KB to ${compressedKB}KB`);

        // Record performance metrics
        await performanceMonitor.recordCompressionMetrics(
          compressedImage.originalSize,
          compressedImage.compressedSize,
          compressedImage.compressionRatio
        );
      }
    }

    // Use the base64 from compression result
    const base64 = compressedImage.base64;
    if (!base64) {
      throw new Error('Failed to get base64 from compressed image');
    }

    // Call Supabase Edge Function with retry logic
    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase.functions.invoke('analyze-image', {
          body: { imageBase64: base64 }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }

        if (!data || !data.analysis) {
          throw new Error('Invalid response from analysis service');
        }

        return data.analysis;
      },
      {
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt} for image analysis:`, error.message);
        },
      }
    );

    return result;
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    const errorMessage = getErrorMessage(error);

    // Return a more informative fallback
    return {
      item: 'Unable to identify',
      recyclable: 'Special',
      instructions: errorMessage || 'Unable to analyze image. Please ensure you have an internet connection and try again.',
      confidence: 0.0,
      materials: ['Unknown'],
      localFacilities: ['Vigo County Solid Waste Management - (812) 462-3363'],
    };
  }
}

export async function analyzeBarcode(barcode: string): Promise<AnalysisResult> {
  // Mock implementation - in production, would call barcode API
  return {
    item: `Product (Barcode: ${barcode})`,
    recyclable: 'Yes',
    instructions: 'Check packaging for recycling symbols. Clean before recycling.',
    confidence: 0.9,
    materials: ['Mixed Materials'],
    localFacilities: ['Vigo County Recycling Center'],
  };
}

export async function getLocations() {
  // Mock data - in production, would fetch from API
  return [
    {
      id: '1',
      name: 'Vigo County Solid Waste Management',
      address: '3230 E Haythorne Ave, Terre Haute, IN 47803',
      distance: 2.5,
      accepts: ['Electronics', 'Batteries', 'Paint', 'Oil'],
      hours: 'Mon-Fri: 8AM-4PM, Sat: 8AM-12PM',
      phone: '(812) 462-3363',
    },
    {
      id: '2',
      name: 'ISU Recycling Center',
      address: '855 Chestnut St, Terre Haute, IN 47809',
      distance: 1.2,
      accepts: ['Paper', 'Cardboard', 'Plastic', 'Glass', 'Aluminum'],
      hours: '24/7 Drop-off',
      phone: '(812) 237-3088',
    },
    {
      id: '3',
      name: 'Best Buy Electronics Recycling',
      address: '3401 S US Highway 41, Terre Haute, IN 47802',
      distance: 3.8,
      accepts: ['Electronics', 'Batteries', 'Cables', 'Cell Phones'],
      hours: 'Mon-Sat: 10AM-9PM, Sun: 11AM-7PM',
      phone: '(812) 298-3100',
    },
  ];
}

export async function sendChatMessage(message: string, history: any[]): Promise<string> {
  try {
    // Check network connectivity first
    if (!networkManager.isOnline()) {
      throw {
        code: 'NETWORK_ERROR',
        message: 'No internet connection available',
      };
    }

    // Call Supabase Edge Function with retry logic
    const reply = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { message, history }
        });

        if (error) {
          console.error('Chat edge function error:', error);
          throw error;
        }

        if (!data || !data.reply) {
          throw new Error('Invalid response from chat service');
        }

        return data.reply;
      },
      {
        maxRetries: 2,
        initialDelay: 500,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt} for chat:`, error.message);
        },
      }
    );

    return reply;
  } catch (error: any) {
    console.error('Error with chat service:', error);
    const errorMessage = getErrorMessage(error);

    // Fallback to basic responses if Edge Function fails
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate thinking

    const responses = {
      plastic: 'Plastic items with recycling codes 1-7 can be recycled in Terre Haute. Clean containers and remove caps before recycling.',
      glass: 'Glass recycling is limited in Terre Haute. Check with Vigo County Solid Waste for current glass recycling options.',
      electronics: 'Electronics should be taken to specialized e-waste facilities like Best Buy or the Vigo County facility. Never put electronics in regular recycling.',
      nearest: 'The nearest recycling center is ISU Recycling Center at 855 Chestnut St, open 24/7 for drop-offs.',
      battery: 'Batteries require special handling. Take them to Best Buy or Vigo County Solid Waste Management at 3230 E Haythorne Ave.',
      paper: 'Paper and cardboard can be recycled if clean and dry. Remove any plastic windows from envelopes.',
      compost: 'Terre Haute doesn\'t have city-wide composting, but you can start your own compost bin for organic waste.',
    };

    const messageLower = message.toLowerCase();
    for (const key in responses) {
      if (messageLower.includes(key)) {
        return responses[key as keyof typeof responses];
      }
    }

    return 'I can help you with recycling questions in Terre Haute. What would you like to know about recycling specific materials or finding drop-off locations? For immediate assistance, call Vigo County Solid Waste at (812) 462-3363.';
  }
}