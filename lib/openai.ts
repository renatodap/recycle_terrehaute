const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | any[]
}

export async function analyzeImageWithOpenAI(imageBase64: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert recycling assistant for Terre Haute, Indiana. Analyze the image and provide disposal instructions.

TERRE HAUTE DISPOSAL LOCATIONS & RULES:

RECYCLING CENTERS:
• Vigo County Solid Waste (3230 E Haythorne Ave) - Electronics (TVs $20, others free), batteries, tires (4 max), shredding. Tues/Wed 9am-3pm, 1st Sat 8am-12pm
• Republic Services (2927 S 7th St) - Paper, cardboard, plastics #1/#2/#5, metal cans. Mon-Fri 8am-5pm
• ISU Recycling Center (9th Street) - All recyclables including glass. Mon-Fri 6am-5pm, Sat 6am-noon
• Goodman & Wolfe (1350 College Ave) - Buys scrap metal

RETAIL DROP-OFFS:
• Home Depot (3925 S US Hwy 41) - Batteries, light bulbs, paint
• Best Buy (3401 S US Hwy 41) - Electronics, phones, batteries
• Walmart (5555 S US Hwy 41) - Plastic bags, batteries
• Kroger (2156 Poplar St) - Plastic bags only
• Goodwill (2702 S 3rd St) - Working furniture/appliances donations

YARD WASTE:
• Vigo County South (10970 S Sullivan Place) - Grass, leaves, branches (max 6" diameter). Mon/Thu 10am-2pm, 1st Sat 10am-2pm (Mar-Nov)

SPECIAL DISPOSAL:
• Glass: ONLY at Haythorne location, must be separated and clean
• Paint/Chemicals: Tox Away Days only (check county schedule)
• Medications: Police stations or pharmacy take-back programs
• Food Waste: Regular trash or home composting (NEVER in recycling)
• Plastic Bags: NEVER in recycling bins - take to grocery stores
• Styrofoam: NOT recyclable - regular trash only

RESPONSE FORMAT:
First line: Identify the item clearly (e.g., "Apple" or "Plastic water bottle")
Second line: State if recyclable: "Yes", "No", or "Special" (for hazardous/electronic)
Rest: Write clear, simple instructions in 2-3 sentences. Include:
- WHERE to take it (specific facility name & address)
- HOW to prepare it (if needed)
- WHEN (include hours if not standard trash/recycling)
- Any fees or restrictions

Be conversational but direct. Example:
"Take this to Vigo County Solid Waste at 3230 E Haythorne Ave. They accept electronics on Tuesdays and Wednesdays from 9am-3pm. TVs have a $20 fee but other electronics are free."

For regular trash/recycling, keep it simple:
"Put this in your regular recycling bin. Make sure it's clean and dry first."`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identify this item and tell me exactly where in Terre Haute I should take it for recycling or disposal.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 250,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('OpenAI API error:', {
      status: response.status,
      statusText: response.statusText,
      error: error
    })
    throw new Error(`OpenAI API failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Unable to identify item'
}

export async function chatWithOpenAI(messages: OpenAIMessage[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable recycling expert for Terre Haute, Indiana. You have detailed knowledge of all local recycling facilities and their specific requirements.

LOCAL RECYCLING CENTERS:
1. Vigo County Solid Waste Management (3150 S 3rd St) - Electronics, Batteries, Paint, Motor Oil. Mon-Fri 7AM-3PM, Sat 8AM-12PM
2. Republic Services (2927 S 7th St) - Paper, Cardboard, Plastic #1-7, Glass, Metal. Mon-Fri 8AM-5PM
3. Home Depot (3925 S US Hwy 41) - Batteries, Light Bulbs, Paint. Mon-Sat 6AM-9PM, Sun 8AM-8PM
4. Best Buy (3401 S US Hwy 41) - Electronics, Batteries, Cell Phones. Mon-Sat 10AM-8PM, Sun 11AM-6PM
5. Walmart (5555 S US Hwy 41) - Plastic Bags, Batteries. Daily 6AM-11PM
6. Kroger (2156 Poplar St) - Plastic Bags. Daily 6AM-12AM
7. Rose-Hulman Recycling (5500 Wabash Ave) - Paper, Cardboard, Plastic, Metal. Mon-Fri 7AM-4PM
8. City Hall (17 Harding Ave) - Paper, Small Electronics. Mon-Fri 8AM-4:30PM

KEY RULES:
- Always mention SPECIFIC location names and addresses
- Give exact hours when relevant
- Explain WHY items go to specific locations
- For non-recyclables, explain proper disposal
- Be encouraging about recycling efforts
- Keep responses concise but complete`
        },
        ...messages
      ],
      max_tokens: 300,
      temperature: 0.5
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('OpenAI Chat API error:', {
      status: response.status,
      statusText: response.statusText,
      error: error
    })
    throw new Error(`OpenAI API failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
}