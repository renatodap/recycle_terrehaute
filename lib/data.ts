import fs from 'fs'
import path from 'path'

export interface Location {
  name: string
  type: string
  address: string
  lat: number
  lng: number
  phone: string
  hours: string
  accepts: string[]
  fees: string
  requirements: string
  notes: string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export function loadLocations(): Location[] {
  const csvPath = path.join(process.cwd(), 'data', 'drop-off-locations.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())

  const locations: Location[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length >= 10) {
      locations.push({
        name: values[0],
        type: values[1],
        address: values[2],
        lat: parseFloat(values[3]),
        lng: parseFloat(values[4]),
        phone: values[5],
        hours: values[6],
        accepts: values[7].split(',').map(s => s.trim()),
        fees: values[8],
        requirements: values[9],
        notes: values[10] || ''
      })
    }
  }

  return locations
}