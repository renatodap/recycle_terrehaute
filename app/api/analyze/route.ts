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
      // Demo response for testing - natural format
      analysis = `Apple
No
**WHERE TO TAKE IT:**
• Regular trash bin or home compost

**HOW TO PREPARE:**
• No preparation needed

**IMPORTANT:**
• Never put food in recycling - it contaminates other materials
• For composting programs, check with Vigo County Solid Waste at 3230 E Haythorne Ave`;
    } else {
      analysis = await analyzeImageWithOpenAI(image)
    }

    // Parse the natural response format
    const lines = analysis.split('\n').map(line => line.trim()).filter(line => line)

    let parsedItem = lines[0] || 'Unknown Item'
    let parsedRecyclable = lines[1] || 'Unknown'
    let instructions = lines.slice(2).join('\n') || 'Please check with local authorities'

    // Clean up the recyclable status
    if (parsedRecyclable.toLowerCase().includes('yes')) {
      parsedRecyclable = 'Yes'
    } else if (parsedRecyclable.toLowerCase().includes('no')) {
      parsedRecyclable = 'No'
    } else if (parsedRecyclable.toLowerCase().includes('special')) {
      parsedRecyclable = 'Special'
    }

    return NextResponse.json({
      item: parsedItem,
      recyclable: parsedRecyclable,
      instructions: instructions,
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