/**
 * Test suite for the /api/identify endpoint
 * Tests image detection for various recyclable and non-recyclable items
 */

import { NextRequest } from 'next/server';
import { POST as identifyRoute, GET as healthCheckRoute } from '@/app/api/identify/route';

// Mock environment variables
process.env.GOOGLE_APPLICATIONS_CREDENTIALS = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'test-key-id',
  private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
  client_email: 'test@test.iam.gserviceaccount.com',
  client_id: '123456789',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test%40test.iam.gserviceaccount.com'
});
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.CLARIFAI_PAT = 'test-clarifai-pat';

// Mock the vision services
jest.mock('@/lib/google-vision-service', () => ({
  analyzeImageWithGoogleVision: jest.fn(),
  isGoogleVisionConfigured: jest.fn(() => true)
}));

jest.mock('@/lib/vision-service', () => ({
  analyzeImageWithVision: jest.fn()
}));

jest.mock('@/lib/clarifai-service', () => ({
  analyzeImageWithClarifai: jest.fn()
}));

jest.mock('@/lib/ai-interpreter', () => ({
  interpretWithOpenAI: jest.fn(),
  interpretWithClarifai: jest.fn(),
  interpretWithRules: jest.fn()
}));

import { analyzeImageWithGoogleVision } from '@/lib/google-vision-service';
import { interpretWithOpenAI, interpretWithRules } from '@/lib/ai-interpreter';

describe('/api/identify endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status with configured services', async () => {
      const request = new NextRequest('http://localhost:3000/api/identify');
      const response = await healthCheckRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.services.vision_primary).toBe('google-vision-cloud');
      expect(data.services.ai_interpreter).toBe('openai');
    });
  });

  describe('Plastic Bottle Detection', () => {
    it('should correctly identify a plastic water bottle as recyclable', async () => {
      // Mock Google Vision response for plastic bottle
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: true,
        labels: [
          { name: 'Plastic bottle', value: 0.95 },
          { name: 'Water bottle', value: 0.92 },
          { name: 'Bottle', value: 0.90 },
          { name: 'Plastic', value: 0.88 },
          { name: 'Container', value: 0.85 },
          { name: 'Recyclable material', value: 0.82 }
        ]
      });

      // Mock OpenAI interpretation for plastic bottle
      (interpretWithOpenAI as jest.Mock).mockResolvedValue({
        item_name: 'Plastic Water Bottle',
        is_recyclable: true,
        bin_color: 'Blue',
        disposal_method: 'Place in blue recycling bin',
        preparation: 'Rinse bottle, remove cap, crush if possible',
        special_instructions: 'Caps can be recycled separately',
        disposal_location: 'Curbside recycling',
        disposal_address: 'Your regular curbside pickup',
        disposal_phone: '812-232-2627',
        confidence: 0.95
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...' // Mock base64
        })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.item.name).toBe('Plastic Water Bottle');
      expect(data.item.is_recyclable).toBe(true);
      expect(data.item.bin_color).toBe('Blue');
      expect(data.item.category).toBe('recyclable');
      expect(data.item.material).toBe('Plastic');
      expect(data.recyclable).toBe(true);
      expect(data.confidence).toBeGreaterThan(0.9);
    });

    it('should NOT misidentify plastic wrapper as plastic bottle', async () => {
      // Mock Google Vision response for plastic wrapper
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: true,
        labels: [
          { name: 'Plastic wrap', value: 0.93 },
          { name: 'Plastic film', value: 0.90 },
          { name: 'Wrapper', value: 0.88 },
          { name: 'Packaging material', value: 0.85 },
          { name: 'Plastic', value: 0.83 }
        ]
      });

      // Mock OpenAI interpretation for plastic wrapper
      (interpretWithOpenAI as jest.Mock).mockResolvedValue({
        item_name: 'Plastic Wrapper/Film',
        is_recyclable: false,
        bin_color: 'Black',
        disposal_method: 'Place in regular trash bin',
        preparation: 'Gather with other plastic films for special recycling if available',
        special_instructions: 'Check for plastic film recycling at local grocery stores',
        disposal_location: 'Regular trash or store drop-off',
        disposal_address: 'Grocery store collection bins',
        disposal_phone: null,
        confidence: 0.88
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...' // Mock base64
        })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.item.name).not.toContain('Bottle');
      expect(data.item.name).toContain('Wrapper');
      expect(data.item.is_recyclable).toBe(false);
      expect(data.item.bin_color).toBe('Black');
    });
  });

  describe('Apple Detection', () => {
    it('should correctly identify an apple as compostable/organic', async () => {
      // Mock Google Vision response for apple
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: true,
        labels: [
          { name: 'Apple', value: 0.98 },
          { name: 'Fruit', value: 0.95 },
          { name: 'Food', value: 0.93 },
          { name: 'Natural foods', value: 0.90 },
          { name: 'Produce', value: 0.88 },
          { name: 'Red apple', value: 0.85 }
        ]
      });

      // Mock OpenAI interpretation for apple
      (interpretWithOpenAI as jest.Mock).mockResolvedValue({
        item_name: 'Apple (Food Waste)',
        is_recyclable: false,
        bin_color: 'Green',
        disposal_method: 'Compost bin or organic waste',
        preparation: 'Remove any stickers',
        special_instructions: 'Can be composted at home or in municipal compost program',
        disposal_location: 'Compost bin or organic waste collection',
        disposal_address: 'Backyard compost or curbside organics',
        disposal_phone: null,
        confidence: 0.98
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...' // Mock base64
        })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.item.name).toContain('Apple');
      expect(data.item.is_recyclable).toBe(false);
      expect(data.item.bin_color).toBe('Green');
      expect(data.item.disposal_method).toContain('Compost');
      expect(data.item.material).toBe('Organic');
      expect(data.confidence).toBeGreaterThan(0.95);
    });
  });

  describe('Error Handling', () => {
    it('should return error when no image is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No image data provided');
    });

    it('should fallback to Clarifai when Google Vision fails', async () => {
      // Mock Google Vision failure
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: false,
        labels: [],
        error: 'Google Vision API failed'
      });

      // Import Clarifai mock
      const { analyzeImageWithClarifai } = require('@/lib/clarifai-service');

      // Mock Clarifai success
      analyzeImageWithClarifai.mockResolvedValue({
        success: true,
        labels: [
          { name: 'plastic bottle', value: 0.90 },
          { name: 'recyclable', value: 0.85 }
        ]
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,test'
        })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(analyzeImageWithGoogleVision).toHaveBeenCalled();
      expect(analyzeImageWithClarifai).toHaveBeenCalled();
      expect(data.services.vision).toContain('clarifai');
    });

    it('should fallback to rule-based interpretation when AI fails', async () => {
      // Mock vision success
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: true,
        labels: [
          { name: 'Plastic bottle', value: 0.95 }
        ]
      });

      // Mock OpenAI failure
      (interpretWithOpenAI as jest.Mock).mockRejectedValue(new Error('OpenAI API error'));

      // Mock rule-based interpretation
      (interpretWithRules as jest.Mock).mockReturnValue({
        item_name: 'Plastic Bottle',
        is_recyclable: true,
        bin_color: 'Blue',
        disposal_method: 'Recycling bin',
        preparation: 'Rinse and remove cap',
        special_instructions: null,
        disposal_location: 'Curbside recycling',
        disposal_address: null,
        disposal_phone: null,
        confidence: 0.75
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,test'
        })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(interpretWithOpenAI).toHaveBeenCalled();
      expect(interpretWithRules).toHaveBeenCalled();
      expect(data.services.interpreter).toBe('rules-fallback');
      expect(data.success).toBe(true);
    });
  });

  describe('Material Detection', () => {
    it('should correctly detect plastic material', async () => {
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: true,
        labels: [
          { name: 'Plastic container', value: 0.90 },
          { name: 'Container', value: 0.85 }
        ]
      });

      (interpretWithRules as jest.Mock).mockReturnValue({
        item_name: 'Plastic Container',
        is_recyclable: true,
        bin_color: 'Blue',
        disposal_method: 'Recycling bin',
        preparation: 'Clean and dry',
        confidence: 0.80
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,test' })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(data.item.material).toBe('Plastic');
    });

    it('should correctly detect glass material', async () => {
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: true,
        labels: [
          { name: 'Glass bottle', value: 0.92 },
          { name: 'Bottle', value: 0.88 }
        ]
      });

      (interpretWithRules as jest.Mock).mockReturnValue({
        item_name: 'Glass Bottle',
        is_recyclable: true,
        bin_color: 'Blue',
        disposal_method: 'Recycling bin',
        preparation: 'Rinse clean',
        confidence: 0.85
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,test' })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(data.item.material).toBe('Glass');
    });

    it('should correctly detect organic material', async () => {
      (analyzeImageWithGoogleVision as jest.Mock).mockResolvedValue({
        success: true,
        labels: [
          { name: 'Food waste', value: 0.88 },
          { name: 'Organic matter', value: 0.85 }
        ]
      });

      (interpretWithRules as jest.Mock).mockReturnValue({
        item_name: 'Food Waste',
        is_recyclable: false,
        bin_color: 'Green',
        disposal_method: 'Compost',
        preparation: 'Remove non-organic materials',
        confidence: 0.75
      });

      const request = new NextRequest('http://localhost:3000/api/identify', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,test' })
      });

      const response = await identifyRoute(request);
      const data = await response.json();

      expect(data.item.material).toBe('Organic');
    });
  });
});