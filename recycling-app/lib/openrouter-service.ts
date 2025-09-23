interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function analyzeImageWithOpenRouter(base64Image: string): Promise<{
  labels: Array<{ name: string; value: number }>;
  error?: string;
}> {
  const apiKey = process.env.OPENROUTER_API_KEY || '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';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'RecycleIt Terre Haute'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify the objects in this image. List the main items you can see, focusing on materials and recyclable items. Format your response as a JSON array of objects with "name" and "confidence" (0-1) fields.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const content = data.choices[0]?.message?.content || '';

    // Parse the JSON response
    try {
      const parsed = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      const labels = Array.isArray(parsed) ? parsed : [parsed];

      return {
        labels: labels.map(item => ({
          name: item.name || item.label || 'Unknown',
          value: item.confidence || item.score || 0.5
        }))
      };
    } catch (parseError) {
      // Fallback: extract items from text
      const items = content.match(/[A-Za-z\s]+/g) || [];
      return {
        labels: items.slice(0, 5).map(item => ({
          name: item.trim(),
          value: 0.7
        }))
      };
    }
  } catch (error) {
    console.error('OpenRouter service error:', error);
    return {
      labels: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function interpretWithOpenRouter(
  labels: Array<{ name: string; value: number }>
): Promise<any> {
  const apiKey = process.env.OPENROUTER_API_KEY || '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';

  const labelText = labels.map(l => `${l.name} (${(l.value * 100).toFixed(0)}%)`).join(', ');

  const prompt = `Based on these detected items: ${labelText}

Provide recycling information for Terre Haute, Indiana. Return a JSON object with:
- item_name: string (main item identified)
- is_recyclable: boolean
- bin_color: "Blue" | "Green" | "Black" | "Special"
- disposal_method: string (specific instructions)
- preparation: string (how to prepare item)
- special_instructions?: string (if needed)
- disposal_location?: string (for special items)
- disposal_address?: string (if applicable)
- disposal_phone?: string (if applicable)
- confidence: number (0-1)

Follow Terre Haute recycling rules:
- Blue bin: Clean paper, cardboard, metal cans, plastic bottles #1-7
- Green bin: Yard waste, food scraps (if composting program active)
- Black bin: Non-recyclable waste
- Special: Electronics, batteries, hazardous materials (need special drop-off)`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'RecycleIt Terre Haute'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a recycling expert for Terre Haute, Indiana. Provide accurate recycling guidance in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const content = data.choices[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      return parsed;
    } catch {
      // Fallback to rule-based interpretation
      return interpretWithRules(labels);
    }
  } catch (error) {
    console.error('OpenRouter interpretation error:', error);
    // Fallback to rule-based interpretation
    return interpretWithRules(labels);
  }
}

export function isOpenRouterConfigured(): boolean {
  return true; // We're using the provided key for testing
}

// Fallback rule-based interpretation
function interpretWithRules(labels: Array<{ name: string; value: number }>): any {
  const labelText = labels.map(l => l.name.toLowerCase()).join(' ');

  // Default response
  let result = {
    item_name: labels[0]?.name || 'Unknown Item',
    is_recyclable: false,
    bin_color: 'Black' as const,
    disposal_method: 'Place in regular trash bin',
    preparation: 'No special preparation needed',
    confidence: 0.5
  };

  // Check for recyclables
  if (labelText.includes('plastic') || labelText.includes('bottle')) {
    result = {
      item_name: 'Plastic Bottle',
      is_recyclable: true,
      bin_color: 'Blue' as const,
      disposal_method: 'Place in blue recycling bin',
      preparation: 'Rinse clean, remove cap, and crush if possible',
      confidence: 0.8
    };
  } else if (labelText.includes('paper') || labelText.includes('cardboard')) {
    result = {
      item_name: 'Paper/Cardboard',
      is_recyclable: true,
      bin_color: 'Blue' as const,
      disposal_method: 'Place in blue recycling bin',
      preparation: 'Keep dry, flatten boxes, remove tape and staples',
      confidence: 0.8
    };
  } else if (labelText.includes('glass')) {
    result = {
      item_name: 'Glass Container',
      is_recyclable: true,
      bin_color: 'Blue' as const,
      disposal_method: 'Place in blue recycling bin',
      preparation: 'Rinse clean, remove lids',
      confidence: 0.8
    };
  } else if (labelText.includes('metal') || labelText.includes('can') || labelText.includes('aluminum')) {
    result = {
      item_name: 'Metal Can',
      is_recyclable: true,
      bin_color: 'Blue' as const,
      disposal_method: 'Place in blue recycling bin',
      preparation: 'Rinse clean, labels can stay on',
      confidence: 0.8
    };
  } else if (labelText.includes('food') || labelText.includes('organic') || labelText.includes('apple') || labelText.includes('banana')) {
    result = {
      item_name: 'Food Waste',
      is_recyclable: false,
      bin_color: 'Green' as const,
      disposal_method: 'Compost if available, otherwise regular trash',
      preparation: 'Remove any packaging',
      confidence: 0.7
    };
  } else if (labelText.includes('electronic') || labelText.includes('battery')) {
    result = {
      item_name: 'Electronic Waste',
      is_recyclable: false,
      bin_color: 'Special' as const,
      disposal_method: 'Take to e-waste recycling center',
      preparation: 'Remove batteries if possible',
      special_instructions: 'Do not put in regular trash',
      disposal_location: 'Terre Haute Recycling Center',
      confidence: 0.7
    };
  }

  return result;
}