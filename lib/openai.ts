import { IMAGE_ANALYSIS_INSTRUCTIONS, CHAT_INSTRUCTIONS } from './locations-data'

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
          content: IMAGE_ANALYSIS_INSTRUCTIONS
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
          content: CHAT_INSTRUCTIONS
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