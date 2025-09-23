const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function analyzeImageWithOpenRouter(imageBase64: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3004',
      'X-Title': 'RecycleIt Terre Haute'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a recycling assistant for Terre Haute, Indiana. Analyze images of items and provide clear, specific recycling instructions. Be concise and helpful.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What is this item and how should I recycle or dispose of it in Terre Haute? Please be specific about which recycling center or location would accept this item.'
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
      max_tokens: 200,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('OpenRouter API error:', error)
    throw new Error('Failed to analyze image')
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Unable to identify item'
}

export async function chatWithOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3004',
      'X-Title': 'RecycleIt Terre Haute'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful recycling assistant for Terre Haute, Indiana. Answer questions about recycling, waste disposal, and environmental topics. Be friendly, concise, and provide specific local information when possible. Reference local facilities like Vigo County Solid Waste Management, Republic Services, and other Terre Haute recycling centers when appropriate.'
        },
        ...messages
      ],
      max_tokens: 300,
      temperature: 0.8
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('OpenRouter API error:', error)
    throw new Error('Failed to get response')
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
}