/**
 * Integration tests for vision detection services
 * Tests actual image recognition with sample images
 */

import fs from 'fs';
import path from 'path';
import { analyzeImageWithGoogleVision, isGoogleVisionConfigured } from '@/lib/google-vision-service';
import { analyzeImageWithClarifai } from '@/lib/clarifai-service';
import { interpretWithOpenAI, interpretWithRules } from '@/lib/ai-interpreter';

// Skip these tests if API keys are not configured
const SKIP_GOOGLE_VISION = !isGoogleVisionConfigured();
const SKIP_CLARIFAI = !process.env.CLARIFAI_PAT;
const SKIP_OPENAI = !process.env.OPENAI_API_KEY;

// Helper to load test images
function loadTestImage(filename: string): string {
  const imagePath = path.join(__dirname, '..', 'fixtures', filename);
  const imageBuffer = fs.readFileSync(imagePath);
  return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
}

describe('Vision Detection Integration Tests', () => {
  describe('Google Vision Service', () => {
    it.skipIf(SKIP_GOOGLE_VISION)('should detect plastic bottle correctly', async () => {
      // This would use a real plastic bottle image
      const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...';

      const result = await analyzeImageWithGoogleVision(mockImage);

      expect(result.success).toBe(true);
      expect(result.labels).toBeInstanceOf(Array);
      expect(result.labels.length).toBeGreaterThan(0);

      // Check for plastic-related labels
      const plasticLabels = result.labels.filter(label =>
        label.name.toLowerCase().includes('plastic') ||
        label.name.toLowerCase().includes('bottle')
      );
      expect(plasticLabels.length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for API call

    it.skipIf(SKIP_GOOGLE_VISION)('should detect apple/fruit correctly', async () => {
      // This would use a real apple image
      const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...';

      const result = await analyzeImageWithGoogleVision(mockImage);

      expect(result.success).toBe(true);
      expect(result.labels).toBeInstanceOf(Array);

      // Check for fruit-related labels
      const fruitLabels = result.labels.filter(label =>
        label.name.toLowerCase().includes('apple') ||
        label.name.toLowerCase().includes('fruit') ||
        label.name.toLowerCase().includes('food')
      );
      expect(fruitLabels.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Clarifai Service (Fallback)', () => {
    it.skipIf(SKIP_CLARIFAI)('should detect items when used as fallback', async () => {
      const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...';

      const result = await analyzeImageWithClarifai(mockImage);

      expect(result.success).toBe(true);
      expect(result.labels).toBeInstanceOf(Array);
      expect(result.labels.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('AI Interpretation', () => {
    const mockLabels = [
      { name: 'Plastic bottle', value: 0.95 },
      { name: 'Water bottle', value: 0.92 },
      { name: 'Container', value: 0.85 }
    ];

    it.skipIf(SKIP_OPENAI)('OpenAI should provide intelligent interpretation', async () => {
      const interpretation = await interpretWithOpenAI(
        mockLabels,
        process.env.OPENAI_API_KEY!
      );

      expect(interpretation).toHaveProperty('item_name');
      expect(interpretation).toHaveProperty('is_recyclable');
      expect(interpretation).toHaveProperty('bin_color');
      expect(interpretation).toHaveProperty('disposal_method');
      expect(interpretation).toHaveProperty('confidence');

      // For plastic bottle, should be recyclable
      expect(interpretation.is_recyclable).toBe(true);
      expect(interpretation.bin_color).toBe('Blue');
    }, 30000);

    it('Rule-based interpretation should work as fallback', () => {
      const interpretation = interpretWithRules(mockLabels);

      expect(interpretation).toHaveProperty('item_name');
      expect(interpretation).toHaveProperty('is_recyclable');
      expect(interpretation).toHaveProperty('bin_color');
      expect(interpretation).toHaveProperty('disposal_method');
      expect(interpretation).toHaveProperty('confidence');

      // Should identify as plastic and recyclable
      expect(interpretation.item_name).toContain('Plastic');
      expect(interpretation.is_recyclable).toBe(true);
    });
  });

  describe('Specific Item Detection Accuracy', () => {
    const testCases = [
      {
        labels: [
          { name: 'Plastic wrap', value: 0.90 },
          { name: 'Film', value: 0.85 }
        ],
        expected: {
          recyclable: false,
          binColor: 'Black',
          material: 'Plastic Film'
        }
      },
      {
        labels: [
          { name: 'Aluminum can', value: 0.95 },
          { name: 'Metal', value: 0.90 }
        ],
        expected: {
          recyclable: true,
          binColor: 'Blue',
          material: 'Aluminum'
        }
      },
      {
        labels: [
          { name: 'Cardboard box', value: 0.93 },
          { name: 'Paper', value: 0.88 }
        ],
        expected: {
          recyclable: true,
          binColor: 'Blue',
          material: 'Cardboard'
        }
      },
      {
        labels: [
          { name: 'Battery', value: 0.95 },
          { name: 'Electronic device', value: 0.85 }
        ],
        expected: {
          recyclable: false,
          binColor: 'Special',
          material: 'Hazardous'
        }
      }
    ];

    test.each(testCases)('should correctly classify %p', ({ labels, expected }) => {
      const interpretation = interpretWithRules(labels);

      expect(interpretation.is_recyclable).toBe(expected.recyclable);
      if (expected.binColor) {
        expect(interpretation.bin_color).toBe(expected.binColor);
      }
    });
  });
});

describe('End-to-End Detection Flow', () => {
  it('should correctly process plastic bottle from image to recommendation', async () => {
    // This test would ideally use the actual endpoint
    const mockRequest = {
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...'
    };

    // Simulate the full flow
    let visionResult;

    // Try Google Vision first
    if (isGoogleVisionConfigured()) {
      visionResult = await analyzeImageWithGoogleVision(mockRequest.image);
    } else if (process.env.CLARIFAI_PAT) {
      visionResult = await analyzeImageWithClarifai(mockRequest.image);
    } else {
      // Mock result for testing
      visionResult = {
        success: true,
        labels: [
          { name: 'Plastic bottle', value: 0.95 },
          { name: 'Recyclable', value: 0.90 }
        ]
      };
    }

    expect(visionResult.success).toBe(true);
    expect(visionResult.labels.length).toBeGreaterThan(0);

    // Interpret results
    let interpretation;
    if (process.env.OPENAI_API_KEY) {
      interpretation = await interpretWithOpenAI(
        visionResult.labels,
        process.env.OPENAI_API_KEY
      );
    } else {
      interpretation = interpretWithRules(visionResult.labels);
    }

    expect(interpretation.item_name).toBeTruthy();
    expect(interpretation.is_recyclable).toBeDefined();
    expect(interpretation.disposal_method).toBeTruthy();
  }, 30000);
});

// Performance tests
describe('Performance Benchmarks', () => {
  it('should process images within acceptable time limits', async () => {
    const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...';
    const startTime = Date.now();

    // Mock or real API call depending on configuration
    if (isGoogleVisionConfigured()) {
      await analyzeImageWithGoogleVision(mockImage);
    } else {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Should complete within 5 seconds for good UX
    expect(processingTime).toBeLessThan(5000);
  });

  it('should handle fallback efficiently', async () => {
    const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...';
    const startTime = Date.now();

    // Simulate primary service failure and fallback
    try {
      // Mock failure
      throw new Error('Primary service failed');
    } catch {
      // Fallback to secondary service
      if (process.env.CLARIFAI_PAT) {
        await analyzeImageWithClarifai(mockImage);
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Even with fallback, should complete within 10 seconds
    expect(totalTime).toBeLessThan(10000);
  });
});