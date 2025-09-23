import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageWithOpenRouter } from '@/lib/openrouter'

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

    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    const analysis = await analyzeImageWithOpenRouter(image)

    // Parse the analysis to extract item and instructions
    // The AI response will be a natural language description
    const lines = analysis.split('\n').filter(line => line.trim())
    const itemMatch = analysis.match(/This (?:is|appears to be) (?:a |an )?([^.]+)/i)
    const item = itemMatch ? itemMatch[1] : 'Unknown Item'

    return NextResponse.json({
      item: item,
      instructions: analysis,
      fullAnalysis: analysis
    })
  } catch (error) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}