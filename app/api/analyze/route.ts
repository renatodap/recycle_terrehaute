import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageWithOpenAI } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Demo mode when no API key is configured
    const DEMO_MODE = !process.env.OPENAI_API_KEY;

    if (DEMO_MODE) {
      console.log('Running in DEMO mode - no OpenAI API key configured')
    }

    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    let analysis: string;

    if (DEMO_MODE) {
      // Demo response for testing - formatted like real API would respond
      analysis = `1. Item: Apple
2. Recyclable: No
3. Location: Regular trash or home composting
4. Preparation: None needed

Food waste like apples should NEVER go in recycling bins as they contaminate other recyclable materials. Best option is home composting if available, otherwise place in regular trash where it will decompose naturally.`;
    } else {
      analysis = await analyzeImageWithOpenAI(image)
    }

    // Parse the formatted response
    let parsedItem = 'Unknown Item'
    let parsedRecyclable = 'Unknown'
    let parsedLocation = 'Check with local authorities'
    let parsedPrep = 'None specified'

    // Try to extract structured data from the response
    const itemMatch = analysis.match(/1\.\s*Item:\s*(.+?)(?:\n|$)/i)
    const recyclableMatch = analysis.match(/2\.\s*Recyclable:\s*(.+?)(?:\n|$)/i)
    const locationMatch = analysis.match(/3\.\s*Location:\s*(.+?)(?:\n|$)/i)
    const prepMatch = analysis.match(/4\.\s*Preparation:\s*(.+?)(?:\n|$)/i)

    if (itemMatch) parsedItem = itemMatch[1].trim()
    if (recyclableMatch) parsedRecyclable = recyclableMatch[1].trim()
    if (locationMatch) parsedLocation = locationMatch[1].trim()
    if (prepMatch) parsedPrep = prepMatch[1].trim()

    return NextResponse.json({
      item: parsedItem,
      recyclable: parsedRecyclable,
      location: parsedLocation,
      preparation: parsedPrep,
      instructions: analysis,
      fullAnalysis: analysis,
      demoMode: DEMO_MODE
    })
  } catch (error) {
    console.error('Error analyzing image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: errorMessage,
        hint: 'Check server logs for more information'
      },
      { status: 500 }
    )
  }
}