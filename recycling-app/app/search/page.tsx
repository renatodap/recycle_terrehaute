'use client';

import { useState } from 'react';
import { Search, Battery, Monitor, Lightbulb, Droplet, Pill, TreePine, Package, AlertTriangle, Check, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

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
  const [filteredItems, setFilteredItems] = useState(trickyItems);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredItems(trickyItems);
    } else {
      const filtered = trickyItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'hazardous': return 'from-amber-400 to-orange-600';
      case 'electronics': return 'from-blue-400 to-indigo-600';
      case 'organic': return 'from-green-400 to-emerald-600';
      case 'special': return 'from-purple-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen relative pb-20">
      {/* Beautiful gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-float blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-20 animate-float blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-20 animate-float blur-3xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl mb-3 shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tricky Items Guide
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Find out how to dispose of difficult items</p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative sticky top-[108px] z-30 glass border-b border-white/20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for batteries, electronics, styrofoam..."
              className="w-full pl-12 pr-4 py-3 bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Category gradient header */}
                <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(item.category)}`} />

                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${getCategoryGradient(item.category)} rounded-2xl shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        {item.recyclable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                            <Check className="w-3 h-3" />
                            Recyclable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
                            <X className="w-3 h-3" />
                            Not Recyclable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Disposal Method */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {item.disposal}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.instructions}
                    </p>
                  </div>

                  {/* Location Info */}
                  {item.location && item.location !== 'Curbside' && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {item.location}
                      </p>
                      {item.address && item.address !== 'Various locations' && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.address}
                        </p>
                      )}
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {item.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Warning for hazardous */}
                  {item.category === 'hazardous' && (
                    <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Hazardous - Handle with care
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl mb-4">
              <Search className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
              No items found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try searching for something else
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}