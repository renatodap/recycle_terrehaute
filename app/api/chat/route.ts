import { NextRequest, NextResponse } from 'next/server'
import { chatWithOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      console.error('No API key configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY')
      return NextResponse.json(
        { error: 'API key not configured. Please contact administrator.' },
        { status: 503 }
      )
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      )
    }

    const response = await chatWithOpenRouter(messages)

    return NextResponse.json({
      message: response
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    )
  }
}