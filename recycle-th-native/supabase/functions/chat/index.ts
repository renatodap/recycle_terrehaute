import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history } = await req.json()

    if (!message) {
      throw new Error('No message provided')
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are a helpful recycling assistant for Terre Haute, Indiana. Provide accurate, concise information about recycling guidelines, locations, and best practices specific to Terre Haute and Vigo County.

        Key information about Terre Haute recycling:
        - Vigo County Solid Waste Management: 3230 E Haythorne Ave, (812) 462-3363
        - ISU Recycling Center: 855 Chestnut St, 24/7 drop-off
        - Plastics #1-7 are accepted
        - Glass recycling is limited
        - Electronics require special disposal at designated facilities
        - Best Buy accepts electronics for recycling
        - Keep responses concise and helpful`
      },
      ...(history || []).map((h: any) => ({
        role: h.role,
        content: h.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ]

    // Call OpenAI Chat API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error('Failed to get response')
    }

    const data = await openaiResponse.json()
    const reply = data.choices[0].message.content

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({
        reply: 'I apologize, but I\'m having trouble connecting to the chat service. Please try again later or contact Vigo County Solid Waste Management at (812) 462-3363 for recycling information.'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})