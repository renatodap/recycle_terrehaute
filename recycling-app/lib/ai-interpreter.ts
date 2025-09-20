// AI-powered interpretation of image recognition results
// Uses OpenAI or Clarifai LLM to provide intelligent recycling guidance

interface RecyclingInterpretation {
  item_name: string;
  is_recyclable: boolean;
  bin_color: string;
  disposal_method: string;
  preparation: string;
  special_instructions?: string;
  disposal_location?: string;
  disposal_address?: string;
  disposal_phone?: string;
  confidence: number;
}

// Use OpenAI to interpret image labels for recycling
export async function interpretWithOpenAI(
  labels: Array<{ name: string; value: number }>,
  openaiApiKey: string
): Promise<RecyclingInterpretation> {
  const topLabels = labels.slice(0, 10).map(l => `${l.name} (${(l.value * 100).toFixed(0)}%)`).join(', ');

  const prompt = `You are a recycling and waste disposal expert for Terre Haute, Indiana (Vigo County). Based on these image recognition labels, provide the BEST disposal method for maximum environmental benefit.

Image contains: ${topLabels}

CRITICAL TERRE HAUTE GUIDELINES:

RECYCLING (Blue Bin or Curbside):
✓ ACCEPTED: Paper, cardboard (flatten), plastic #1/#2/#5 (bottles, containers), aluminum cans, steel cans
✓ PREPARATION: Clean, dry, remove food debris, rinse containers, flatten cardboard
✗ NOT IN CURBSIDE: Glass (take to ISU Recycling Center), plastic bags (grocery store bins)

COMPOSTING & YARD WASTE:
✓ Food scraps, grass clippings, leaves, branches → Vigo County SWMD Composting Site, 10970 S Sullivan Place
✓ Home composting strongly encouraged to reduce methane emissions
✗ NO plastic bags or trash at compost site

HAZARDOUS & E-WASTE:
✓ Batteries, paints, chemicals, pesticides, fluorescent bulbs → Vigo County Household Hazardous Waste or "Tox Away" events
✓ Electronics → Vigo County SWMD E-waste (Haythorne location) or Best Buy
✗ NEVER in trash or recycling - causes serious pollution

LARGE ITEMS & SPECIAL:
✓ Metal scraps, appliances → Goodman & Wolfe Scrap (may pay for clean metal)
✓ Textiles, clothing → Goodwill or reTHink Terre Haute for reuse/upcycling
✓ Glass bottles/jars → Indiana State University Recycling Center (separate by color if possible)
✓ Construction debris → Specialized disposal services

BEST PRACTICES:
1. REDUCE first (buy minimal packaging)
2. REUSE second (donate, repurpose)
3. RECYCLE third (clean & sorted)
4. COMPOST organic waste
5. PROPER DISPOSAL last resort

WARNING: Indiana contamination rates reach 70% due to improper sorting. Help reduce this!

Respond with JSON containing:
- item_name: specific item name
- is_recyclable: true/false
- bin_color: "Blue" (recycling), "Green" (compost), "Black" (trash), "Special" (hazardous/drop-off)
- disposal_method: specific action with maximum environmental benefit
- preparation: detailed prep instructions
- special_instructions: additional guidance for best disposal (optional)
- disposal_location: facility name if special disposal
- disposal_address: full address if special disposal
- disposal_phone: phone if special disposal
- confidence: 0.0-1.0

KEY LOCATIONS:
- Glass/Special Recycling: ISU Recycling Center, Indiana State University
- Composting: Vigo County SWMD, 10970 S Sullivan Place, (812) 462-3370
- Hazardous Waste: Vigo County Household Hazardous Waste Center, 3025 S 4 1/2 St, Terre Haute, IN 47802
- E-Waste: Vigo County SWMD (Haythorne), or Best Buy, 3401 US-41
- Metal Scrap: Goodman & Wolfe, various locations
- Textiles/Reuse: reTHink, 720 Wabash Ave, Terre Haute, IN 47807
- Plastic Bags: Grocery stores (Walmart, Kroger) have special bins

Example: {"item_name":"Aluminum Can","is_recyclable":true,"bin_color":"Blue","disposal_method":"Curbside recycling or ISU Recycling Center","preparation":"Rinse clean, can leave tabs on","special_instructions":"Aluminum is infinitely recyclable - always recycle!","confidence":0.95}`;

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
            content: 'You are a Terre Haute waste management expert focused on maximum environmental benefit. Indiana has only 19.5% recycling rate (goal: 50%). Help improve this! Always respond with valid JSON only, no additional text.'
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

  // Recyclable patterns - Updated for Terre Haute
  const recyclablePatterns = [
    { pattern: /plastic bottle|water bottle|soda bottle/, name: 'Plastic Bottle (#1 or #2)', bin: 'Blue', prep: 'Rinse clean, check for #1, #2, or #5 on bottom' },
    { pattern: /aluminum can|soda can|beer can/, name: 'Aluminum Can', bin: 'Blue', prep: 'Rinse clean - aluminum is infinitely recyclable!' },
    { pattern: /cardboard|box|corrugated/, name: 'Cardboard', bin: 'Blue', prep: 'Flatten completely, remove all tape and labels' },
    { pattern: /paper|newspaper|magazine|office paper/, name: 'Paper', bin: 'Blue', prep: 'Keep dry and clean, no shredded paper in bags' },
    { pattern: /steel can|tin can|food can/, name: 'Steel/Tin Can', bin: 'Blue', prep: 'Rinse clean, labels can stay on' },
    { pattern: /plastic container|yogurt|takeout container/, name: 'Plastic Container', bin: 'Blue', prep: 'Check for #1, #2, or #5 only - rinse clean' },
    { pattern: /glass bottle|jar|glass container/, name: 'Glass', bin: 'Special', prep: 'NOT in curbside! Take to ISU Recycling Center, separate by color if possible' }
  ];

  // Non-recyclable patterns - with better alternatives
  const trashPatterns = [
    { pattern: /wrapper|packaging|packet|pouch|film|candy wrapper/, name: 'Plastic Wrapper/Film', bin: 'Black', prep: 'Not recyclable - choose products with less packaging next time' },
    { pattern: /chip bag|snack bag/, name: 'Snack Bag', bin: 'Black', prep: 'Multi-layer material - consider buying bulk snacks with reusable containers' },
    { pattern: /styrofoam|polystyrene|foam/, name: 'Styrofoam', bin: 'Black', prep: 'Never recyclable - ask restaurants for non-foam containers' },
    { pattern: /plastic bag|grocery bag/, name: 'Plastic Bag', bin: 'Special', prep: 'Return to grocery store recycling bins (Walmart, Kroger) - use reusable bags!' },
    { pattern: /diaper/, name: 'Diaper', bin: 'Black', prep: 'Always trash - consider cloth diapers for less waste' },
    { pattern: /tissue|napkin|paper towel/, name: 'Used Paper Product', bin: 'Black', prep: 'Contaminated paper cannot be recycled' },
    { pattern: /ceramic|pottery|dishes/, name: 'Ceramic/Pottery', bin: 'Black', prep: 'Not recyclable - donate if unbroken' }
  ];

  // Compostable patterns
  const compostPatterns = [
    { pattern: /food waste|food scrap|organic|banana|apple|vegetable|fruit/, name: 'Food Waste', bin: 'Green', prep: 'Compost at home or take to Vigo County SWMD Composting Site, 10970 S Sullivan Place' },
    { pattern: /leaves|grass|yard waste|branches/, name: 'Yard Waste', bin: 'Green', prep: 'Vigo County Composting Site - NO plastic bags allowed' }
  ];

  // Special disposal patterns with addresses
  const specialPatterns = [
    {
      pattern: /battery/,
      name: 'Battery',
      bin: 'Special',
      prep: 'Take to hazardous waste center',
      location: 'Vigo County Household Hazardous Waste or "Tox Away" Events',
      address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
      phone: '(812) 462-3370'
    },
    {
      pattern: /electronics|computer|phone|television|monitor/,
      name: 'Electronics',
      bin: 'Special',
      prep: 'Take to e-waste recycling',
      location: 'Vigo County SWMD E-waste (Haythorne) or Best Buy',
      address: 'Best Buy: 3401 US-41, Terre Haute, IN 47802',
      phone: '(812) 234-2617'
    },
    {
      pattern: /paint|chemical|oil|pesticide/,
      name: 'Hazardous Material',
      bin: 'Special',
      prep: 'Take to hazardous waste center',
      location: 'Vigo County Household Hazardous Waste or "Tox Away" Events',
      address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
      phone: '(812) 462-3370'
    },
    {
      pattern: /light bulb|fluorescent|cfl/,
      name: 'Light Bulb',
      bin: 'Special',
      prep: 'Take to hazardous waste center',
      location: 'Vigo County Household Hazardous Waste or "Tox Away" Events',
      address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
      phone: '(812) 462-3370'
    }
  ];

  // Check patterns - prioritize best environmental option
  for (const { pattern, name, bin, prep } of compostPatterns) {
    if (pattern.test(labelNames)) {
      return {
        item_name: name,
        is_recyclable: false,
        bin_color: bin,
        disposal_method: 'Compost to reduce methane emissions',
        preparation: prep,
        special_instructions: 'Composting prevents methane in landfills and creates useful soil!',
        confidence: 0.85
      };
    }
  }

  for (const { pattern, name, bin, prep } of recyclablePatterns) {
    if (pattern.test(labelNames)) {
      const method = bin === 'Special' ? prep : 'Place in curbside recycling bin';
      return {
        item_name: name,
        is_recyclable: true,
        bin_color: bin,
        disposal_method: method,
        preparation: prep,
        special_instructions: bin === 'Special' ? 'Glass must go to ISU Recycling Center - NOT curbside!' : 'Help Terre Haute reach 50% recycling goal!',
        confidence: 0.85
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

  for (const { pattern, name, bin, prep, location, address, phone } of specialPatterns) {
    if (pattern.test(labelNames)) {
      return {
        item_name: name,
        is_recyclable: false,
        bin_color: bin,
        disposal_method: prep,
        preparation: '',
        special_instructions: 'Do not put in regular trash or recycling',
        disposal_location: location,
        disposal_address: address,
        disposal_phone: phone,
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