import { NextRequest, NextResponse } from 'next/server'
import { chatWithOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
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