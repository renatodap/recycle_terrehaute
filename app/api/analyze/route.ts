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
      // Demo response for testing
      analysis = `This appears to be organic waste (food item).

**DEMO MODE RESPONSE**

Organic waste like food items are NOT recyclable through traditional recycling programs.

**Disposal Options:**
1. **Composting (Best)**: If you have home composting or community composting access
2. **Regular Trash**: Place in regular household trash

**Note**: Food waste contaminates recyclable materials. Never put food in recycling bins.

For Terre Haute: Check with Vigo County Solid Waste Management (3150 S 3rd St) about composting programs.`;
    } else {
      analysis = await analyzeImageWithOpenAI(image)
    }

    // Parse the analysis to extract item and instructions
    // The AI response will be a natural language description
    const lines = analysis.split('\n').filter(line => line.trim())
    const itemMatch = analysis.match(/This (?:is|appears to be) (?:a |an )?([^.]+)/i)
    const item = itemMatch ? itemMatch[1] : 'Unknown Item'

    return NextResponse.json({
      item: item,
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