// AI-powered interpretation of image recognition results
// Uses OpenAI or Clarifai LLM to provide intelligent recycling guidance

interface RecyclingInterpretation {
  item_name: string;
  is_recyclable: boolean;
  bin_color: string;
  disposal_method: string;
  preparation: string;
  special_instructions?: string;
  confidence: number;
}

// Use OpenAI to interpret image labels for recycling
export async function interpretWithOpenAI(
  labels: Array<{ name: string; value: number }>,
  openaiApiKey: string
): Promise<RecyclingInterpretation> {
  const topLabels = labels.slice(0, 10).map(l => `${l.name} (${(l.value * 100).toFixed(0)}%)`).join(', ');

  const prompt = `You are a recycling expert for Terre Haute, Indiana. Based on these image recognition labels, provide recycling instructions.

Image contains: ${topLabels}

Respond with a JSON object containing:
- item_name: specific name of the item
- is_recyclable: true/false
- bin_color: "Blue" for recycling, "Black" for trash, "Special" for hazardous
- disposal_method: brief instruction
- preparation: how to prepare item (empty string if none)
- special_instructions: only if needed (optional)
- confidence: 0.0-1.0 how confident you are

Terre Haute accepts: plastic bottles #1-7, aluminum cans, glass bottles, paper, cardboard.
Does NOT accept: plastic bags, styrofoam, electronics (need special disposal), batteries (hazardous waste).

Example response:
{"item_name":"Plastic Water Bottle","is_recyclable":true,"bin_color":"Blue","disposal_method":"Place in recycling bin","preparation":"Rinse clean and remove cap","confidence":0.95}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Using GPT-4o-mini for better accuracy and cost-efficiency
        messages: [
          {
            role: 'system',
            content: 'You are a recycling expert. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" }  // Ensures JSON response
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    try {
      return JSON.parse(content);
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('OpenAI interpretation error:', error);
    throw error;
  }
}

// Use Clarifai's LLM for interpretation (alternative to OpenAI)
export async function interpretWithClarifai(
  labels: Array<{ name: string; value: number }>,
  clarifaiPat: string
): Promise<RecyclingInterpretation> {
  const topLabels = labels.slice(0, 10).map(l => `${l.name} (${(l.value * 100).toFixed(0)}%)`).join(', ');

  const prompt = `Based on these image labels: ${topLabels}

Determine if this item is recyclable in Terre Haute, Indiana and provide disposal instructions.
Respond with JSON only: item_name, is_recyclable, bin_color, disposal_method, preparation, confidence.`;

  try {
    // Using Clarifai's GPT model
    const response = await fetch('https://api.clarifai.com/v2/models/gpt-4/versions/latest/outputs', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${clarifaiPat}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          data: {
            text: {
              raw: prompt
            }
          }
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Clarifai LLM error: ${response.statusText}`);
    }

    const data = await response.json();
    const textOutput = data.outputs?.[0]?.data?.text?.raw || '';

    try {
      return JSON.parse(textOutput);
    } catch (e) {
      console.error('Failed to parse Clarifai LLM response:', textOutput);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('Clarifai LLM interpretation error:', error);
    throw error;
  }
}

// Smart fallback interpretation without LLM
export function interpretWithRules(labels: Array<{ name: string; value: number }>): RecyclingInterpretation {
  const labelNames = labels.map(l => l.name.toLowerCase()).join(' ');

  // Recyclable patterns
  const recyclablePatterns = [
    { pattern: /plastic bottle|water bottle/, name: 'Plastic Bottle', bin: 'Blue', prep: 'Rinse clean and remove cap' },
    { pattern: /aluminum can|soda can|beer can/, name: 'Aluminum Can', bin: 'Blue', prep: 'Rinse clean' },
    { pattern: /cardboard|box/, name: 'Cardboard Box', bin: 'Blue', prep: 'Flatten and remove tape' },
    { pattern: /paper|newspaper|magazine/, name: 'Paper', bin: 'Blue', prep: 'Keep dry and clean' },
    { pattern: /glass bottle|jar/, name: 'Glass Container', bin: 'Blue', prep: 'Rinse clean and remove lid' }
  ];

  // Non-recyclable patterns
  const trashPatterns = [
    { pattern: /styrofoam|polystyrene/, name: 'Styrofoam', bin: 'Black', prep: '' },
    { pattern: /plastic bag/, name: 'Plastic Bag', bin: 'Black', prep: 'Return to store drop-off' },
    { pattern: /food waste|organic/, name: 'Food Waste', bin: 'Black', prep: 'Consider composting' },
    { pattern: /diaper/, name: 'Diaper', bin: 'Black', prep: '' },
    { pattern: /tissue|napkin|paper towel/, name: 'Used Paper Product', bin: 'Black', prep: '' }
  ];

  // Special disposal patterns
  const specialPatterns = [
    { pattern: /battery/, name: 'Battery', bin: 'Special', prep: 'Take to hazardous waste center' },
    { pattern: /electronics|computer|phone/, name: 'Electronics', bin: 'Special', prep: 'Take to e-waste recycling' },
    { pattern: /paint|chemical/, name: 'Hazardous Material', bin: 'Special', prep: 'Take to hazardous waste center' },
    { pattern: /light bulb|fluorescent/, name: 'Light Bulb', bin: 'Special', prep: 'Take to special recycling' }
  ];

  // Check patterns
  for (const { pattern, name, bin, prep } of recyclablePatterns) {
    if (pattern.test(labelNames)) {
      return {
        item_name: name,
        is_recyclable: true,
        bin_color: bin,
        disposal_method: 'Place in recycling bin',
        preparation: prep,
        confidence: 0.8
      };
    }
  }

  for (const { pattern, name, bin, prep } of trashPatterns) {
    if (pattern.test(labelNames)) {
      return {
        item_name: name,
        is_recyclable: false,
        bin_color: bin,
        disposal_method: 'Place in regular trash',
        preparation: prep,
        confidence: 0.8
      };
    }
  }

  for (const { pattern, name, bin, prep } of specialPatterns) {
    if (pattern.test(labelNames)) {
      return {
        item_name: name,
        is_recyclable: false,
        bin_color: bin,
        disposal_method: prep,
        preparation: '',
        special_instructions: 'Do not put in regular trash or recycling',
        confidence: 0.8
      };
    }
  }

  // Default unknown item
  return {
    item_name: labels[0]?.name || 'Unknown Item',
    is_recyclable: false,
    bin_color: 'Black',
    disposal_method: 'When in doubt, throw it out (regular trash)',
    preparation: '',
    confidence: 0.5
  };
}