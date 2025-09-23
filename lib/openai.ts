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
          content: `You are an expert recycling assistant for Terre Haute, Indiana. When analyzing images, provide SPECIFIC, ACTIONABLE instructions.

Available recycling locations in Terre Haute:
1. Vigo County Solid Waste Management (3150 S 3rd St) - Accepts: Electronics, Batteries, Paint, Motor Oil. Hours: Mon-Fri 7AM-3PM, Sat 8AM-12PM
2. Republic Services Recycling Center (2927 S 7th St) - Accepts: Paper, Cardboard, Plastic (#1-7), Glass, Metal. Hours: Mon-Fri 8AM-5PM
3. Home Depot (3925 S US Hwy 41) - Accepts: Batteries, Light Bulbs, Paint. Hours: Mon-Sat 6AM-9PM, Sun 8AM-8PM
4. Best Buy (3401 S US Hwy 41) - Accepts: Electronics, Batteries, Cell Phones. Hours: Mon-Sat 10AM-8PM, Sun 11AM-6PM
5. Walmart (5555 S US Hwy 41) - Accepts: Plastic Bags, Batteries. Hours: Daily 6AM-11PM
6. Kroger (2156 Poplar St) - Accepts: Plastic Bags. Hours: Daily 6AM-12AM
7. Rose-Hulman Recycling Center (5500 Wabash Ave) - Accepts: Paper, Cardboard, Plastic, Metal. Hours: Mon-Fri 7AM-4PM
8. City Hall Drop-off (17 Harding Ave) - Accepts: Paper, Small Electronics. Hours: Mon-Fri 8AM-4:30PM

IMPORTANT INSTRUCTIONS:
- For plastics: Check the number on the bottom. #1-7 go to Republic Services. Plastic bags go to Walmart or Kroger.
- For electronics: Large items go to Vigo County or Best Buy. Small items can go to City Hall.
- For batteries: Car batteries go to Vigo County. Household batteries go to Home Depot, Best Buy, or Walmart.
- For hazardous waste (paint, chemicals): Only Vigo County or Home Depot.
- If item is not recyclable, say "This should go in regular trash."

Provide a SHORT response with:
1. What the item is
2. Whether it's recyclable
3. SPECIFIC location name and address where to take it
4. Any preparation needed (rinse, remove batteries, etc.)`
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