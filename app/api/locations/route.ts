import { NextResponse } from 'next/server'
import { loadLocations } from '@/lib/data'

export async function GET() {
  try {
    const locations = loadLocations()
    // Return all locations
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error loading locations:', error)
    return NextResponse.json({ error: 'Failed to load locations' }, { status: 500 })
  }
}