'use client'
import { useState, useEffect } from 'react'
import { MapPin, Recycle, Clock, Package, Search } from 'lucide-react'

interface Location {
  id: number
  name: string
  address: string
  accepts: string
  acceptsArray: string[]
  hours: string
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Fetch real locations data
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLocations(data.map((loc: any, idx: number) => {
            const formattedAccepts = loc.accepts ? loc.accepts.map((item: string) =>
              item.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
            ) : []
            return {
              id: idx + 1,
              name: loc.name || 'Location ' + (idx + 1),
              address: loc.address || '',
              accepts: formattedAccepts.join(', '),
              acceptsArray: formattedAccepts,
              hours: loc.hours || ''
            }
          }))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load locations:', err)
        setLoading(false)
      })
  }, [])

  const filteredLocations = searchQuery.trim()
    ? locations.filter(loc =>
        loc.acceptsArray.some(item =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        ) || loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locations

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? `**${part}**`
        : part
    ).join('')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white border-b-2 border-gray-300 p-3 flex-shrink-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2 text-black">
          <Recycle className="text-green-600" size={20} />
          Recycle Terre Haute
        </h1>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 p-3 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-black">
          <MapPin className="text-green-600" size={18} />
          Recycling Locations
        </h2>

        {/* Search Bar */}
        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by material (e.g., batteries, glass)..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading locations...
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No locations found for "{searchQuery}"</p>
            <p className="text-sm mt-2">Try searching for: batteries, glass, electronics, plastic, etc.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLocations.map((location, index) => (
              <div
                key={location.id}
                className="border border-gray-300 rounded-lg p-3 bg-white"
              >
                {/* Location Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm text-black pr-2">
                    {location.name}
                  </h3>
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                    #{index + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-gray-700">{location.address || 'No address available'}</p>
                  </div>

                  {/* Accepts */}
                  <div className="flex items-start gap-2">
                    <Package className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-gray-700">
                      {searchQuery.trim() ? (
                        location.acceptsArray.map((item, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            {item.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                              <span className="bg-yellow-200 font-semibold">{item}</span>
                            ) : (
                              item
                            )}
                          </span>
                        ))
                      ) : (
                        location.accepts || 'Contact for details'
                      )}
                    </p>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-2">
                    <Clock className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-gray-700">{location.hours || 'Check website for hours'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}