import fs from 'fs'
import path from 'path'

export interface Location {
  name: string
  address: string
  lat: number
  lng: number
  accepts: string[]
  hours: string
}

export function loadLocations(): Location[] {
  const csvPath = path.join(process.cwd(), 'data', 'drop-off-locations.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',')

  const locations: Location[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length >= 6) {
      locations.push({
        name: values[0],
        address: values[1],
        lat: parseFloat(values[2]),
        lng: parseFloat(values[3]),
        accepts: values[4].split(';'),
        hours: values[5]
      })
    }
  }

  return locations
}