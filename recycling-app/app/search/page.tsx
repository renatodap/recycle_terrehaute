'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Battery, Monitor, Lightbulb, Droplet, Pill, TreePine, Package, AlertTriangle, ChevronLeft, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';

// Common tricky items database
const trickyItems = [
  {
    name: 'Batteries',
    icon: Battery,
    category: 'hazardous',
    recyclable: false,
    disposal: 'Special disposal required',
    location: 'Vigo County Household Hazardous Waste Center',
    address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
    phone: '(812) 462-3370',
    instructions: 'Never put batteries in regular recycling or trash. They can cause fires.',
    tags: ['battery', 'batteries', 'alkaline', 'lithium', 'rechargeable', 'AA', 'AAA']
  },
  {
    name: 'Electronics',
    icon: Monitor,
    category: 'electronics',
    recyclable: false,
    disposal: 'E-waste recycling required',
    location: 'Best Buy',
    address: '3401 US-41, Terre Haute, IN 47802',
    phone: '(812) 234-2617',
    instructions: 'TVs, computers, phones contain valuable materials that can be recovered.',
    tags: ['computer', 'tv', 'television', 'phone', 'laptop', 'tablet', 'electronics', 'cables']
  },
  {
    name: 'Light Bulbs',
    icon: Lightbulb,
    category: 'hazardous',
    recyclable: false,
    disposal: 'Special disposal for CFLs and fluorescent',
    location: 'Vigo County Household Hazardous Waste Center',
    address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
    phone: '(812) 462-3370',
    instructions: 'LED bulbs can go in trash. CFLs contain mercury and need special disposal.',
    tags: ['light', 'bulb', 'cfl', 'fluorescent', 'led', 'lamp']
  },
  {
    name: 'Motor Oil',
    icon: Droplet,
    category: 'hazardous',
    recyclable: false,
    disposal: 'Hazardous waste center',
    location: 'Vigo County Household Hazardous Waste Center',
    address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
    phone: '(812) 462-3370',
    instructions: 'Never pour oil down drains or in yard. Can be recycled into new oil.',
    tags: ['oil', 'motor oil', 'engine oil', 'automotive', 'car']
  },
  {
    name: 'Medications',
    icon: Pill,
    category: 'hazardous',
    recyclable: false,
    disposal: 'Drug take-back program',
    location: 'Local pharmacies or police stations',
    address: 'Various locations',
    instructions: 'Never flush medications. Use take-back programs to prevent water contamination.',
    tags: ['medicine', 'medication', 'pills', 'drugs', 'prescription', 'pharmacy']
  },
  {
    name: 'Christmas Trees',
    icon: TreePine,
    category: 'organic',
    recyclable: true,
    disposal: 'Curbside pickup in January',
    location: 'Curbside',
    instructions: 'Remove all decorations, lights, and tinsel. Will be turned into mulch.',
    tags: ['christmas', 'tree', 'holiday', 'pine', 'evergreen']
  },
  {
    name: 'Styrofoam',
    icon: Package,
    category: 'trash',
    recyclable: false,
    disposal: 'Regular trash only',
    instructions: 'Not recyclable in Terre Haute. Consider reusing for packaging.',
    tags: ['styrofoam', 'polystyrene', 'foam', 'packing', 'takeout']
  },
  {
    name: 'Plastic Bags',
    icon: Package,
    category: 'special',
    recyclable: false,
    disposal: 'Store drop-off only',
    location: 'Walmart, Kroger, or other grocery stores',
    instructions: 'Never put plastic bags in recycling bin. Return to store collection bins.',
    tags: ['plastic', 'bag', 'grocery', 'shopping', 'film']
  }
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredItems = trickyItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query) ||
           item.tags.some(tag => tag.includes(query));
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hazardous':
        return 'bg-red-100 text-red-600';
      case 'electronics':
        return 'bg-blue-100 text-blue-600';
      case 'organic':
        return 'bg-green-100 text-green-600';
      case 'special':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="content-wrapper min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Disposal Guide</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSearchQuery('')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !searchQuery ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSearchQuery('hazardous')}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium whitespace-nowrap hover:bg-red-200 transition-colors"
          >
            Hazardous
          </button>
          <button
            onClick={() => setSearchQuery('electronics')}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium whitespace-nowrap hover:bg-blue-200 transition-colors"
          >
            Electronics
          </button>
          <button
            onClick={() => setSearchQuery('plastic')}
            className="px-4 py-2 bg-amber-100 text-amber-600 rounded-full text-sm font-medium whitespace-nowrap hover:bg-amber-200 transition-colors"
          >
            Plastics
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedItem(item)}
              className="card p-4 w-full text-left hover:no-underline group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(item.category)}`}>
                  <item.icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.recyclable ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.disposal}</p>
                  {item.location && item.location !== 'Curbside' && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No items found</p>
            <p className="text-sm text-gray-500 mt-1">Try searching for something else</p>
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedItem(null)} />

          <div className="relative bg-white rounded-t-3xl w-full max-w-lg animate-slideUp">
            <div className="p-6">
              {/* Handle bar */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

              {/* Item Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getCategoryColor(selectedItem.category)}`}>
                  <selectedItem.icon className="w-7 h-7" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedItem.name}</h2>
                  <p className={`inline-flex items-center gap-1 text-sm font-medium ${
                    selectedItem.recyclable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedItem.recyclable ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Recyclable
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Not Recyclable
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm font-medium text-amber-900 mb-1">Important</p>
                  <p className="text-sm text-amber-700">{selectedItem.instructions}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Disposal Method</p>
                  <p className="text-gray-700">{selectedItem.disposal}</p>
                </div>

                {selectedItem.location && (
                  <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Location</p>
                      <p className="text-sm text-gray-700">{selectedItem.location}</p>
                    </div>

                    {selectedItem.address && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
                        <p className="text-sm text-gray-700">{selectedItem.address}</p>
                      </div>
                    )}

                    {selectedItem.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${selectedItem.phone}`} className="text-sm text-green-600 font-medium">
                          {selectedItem.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-secondary w-full mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}