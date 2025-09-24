import { AnalysisResult } from '../types/navigation';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export async function analyzeImage(imageUri: string): Promise<AnalysisResult> {
  // Convert image to base64
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  // In demo mode, return mock data
  if (!OPENAI_API_KEY) {
    return {
      item: 'Plastic Bottle',
      recyclable: 'Yes',
      instructions: 'Clean and remove cap. Place in recycling bin.',
      confidence: 0.95,
      materials: ['PET Plastic', 'Plastic Cap'],
      localFacilities: ['Vigo County Recycling Center', 'ISU Recycling Drop-off'],
    };
  }

  // Call OpenAI API
  try {
    const apiResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64 }),
    });

    if (!apiResponse.ok) {
      throw new Error('Analysis failed');
    }

    const data = await apiResponse.json();
    return {
      item: data.item,
      recyclable: data.recyclable,
      instructions: data.instructions,
      confidence: data.confidence || 0.8,
      materials: data.materials || [],
      localFacilities: data.facilities || [],
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
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
  // Mock implementation - in production, would call OpenAI chat API
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  const responses = {
    plastic: 'Plastic items with recycling codes 1-7 can be recycled in Terre Haute. Clean containers and remove caps before recycling.',
    glass: 'Glass recycling is limited in Terre Haute. Check with Vigo County Solid Waste for current glass recycling options.',
    electronics: 'Electronics should be taken to specialized e-waste facilities like Best Buy or the Vigo County facility. Never put electronics in regular recycling.',
    nearest: 'The nearest recycling center is ISU Recycling Center at 855 Chestnut St, open 24/7 for drop-offs.',
  };

  for (const key in responses) {
    if (message.toLowerCase().includes(key)) {
      return responses[key as keyof typeof responses];
    }
  }

  return 'I can help you with recycling questions in Terre Haute. What would you like to know about recycling specific materials or finding drop-off locations?';
}