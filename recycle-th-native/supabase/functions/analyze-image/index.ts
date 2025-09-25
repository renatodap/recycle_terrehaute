import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      throw new Error('No image provided')
    }

    // Get OpenAI API key from environment (set in Supabase dashboard)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Call OpenAI Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a recycling expert AI assistant for Terre Haute, Indiana. Analyze images and provide recycling guidance.

            Your response must be in this exact JSON format:
            {
              "item": "specific item name",
              "recyclable": "Yes" | "No" | "Special",
              "instructions": "Clear recycling instructions",
              "confidence": 0.0-1.0,
              "materials": ["material1", "material2"],
              "localFacilities": ["facility1", "facility2"]
            }

            Guidelines:
            - "recyclable": Use "Yes" for curbside recyclable, "No" for trash, "Special" for items needing special handling
            - Be specific about preparation (rinse, remove labels, flatten, etc.)
            - Include local Terre Haute facilities when relevant
            - Keep instructions concise but complete`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What is this item and how should I recycle it in Terre Haute, Indiana?'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error('Failed to analyze image')
    }

    const data = await openaiResponse.json()

    // Extract the JSON from the response
    let analysis
    try {
      const content = data.choices[0].message.content
      // Try to parse the content as JSON
      analysis = JSON.parse(content)
    } catch (parseError) {
      // Fallback if response isn't proper JSON
      console.error('Failed to parse OpenAI response:', parseError)
      analysis = {
        item: 'Unknown item',
        recyclable: 'No',
        instructions: 'Unable to identify this item. Please check with your local recycling center.',
        confidence: 0.5,
        materials: [],
        localFacilities: []
      }
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        analysis: {
          item: 'Unknown item',
          recyclable: 'No',
          instructions: 'Unable to analyze image. Please try again or check with local recycling center.',
          confidence: 0,
          materials: [],
          localFacilities: []
        }
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