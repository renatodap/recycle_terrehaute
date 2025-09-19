'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LeafIcon, RecycleIcon, CameraIcon, SearchIcon, LocationIcon,
  CheckCircleIcon, ArrowRightIcon, TrashIcon
} from '@/components/icons/EcoIcons';

// Common tricky items database
const trickyItems = [
  {
    name: 'Batteries',
    icon: '🔋',
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
    icon: '💻',
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
    icon: '💡',
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
    icon: '🛢️',
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
    icon: '💊',
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
    icon: '🎄',
    category: 'organic',
    recyclable: true,
    disposal: 'Curbside pickup in January',
    location: 'Curbside',
    instructions: 'Remove all decorations, lights, and tinsel. Will be turned into mulch.',
    tags: ['christmas', 'tree', 'holiday', 'pine', 'evergreen']
  },
  {
    name: 'Styrofoam',
    icon: '📦',
    category: 'trash',
    recyclable: false,
    disposal: 'Regular trash only',
    instructions: 'Not recyclable in Terre Haute. Consider reusing for packaging.',
    tags: ['styrofoam', 'polystyrene', 'foam', 'packing', 'takeout']
  },
  {
    name: 'Plastic Bags',
    icon: '🛍️',
    category: 'special',
    recyclable: false,
    disposal: 'Store drop-off only',
    location: 'Walmart, Kroger, or other grocery stores',
    instructions: 'Never put plastic bags in recycling bin. Return to store collection bins.',
    tags: ['plastic', 'bag', 'grocery', 'shopping', 'film']
  },
  {
    name: 'Paint Cans',
    icon: '🎨',
    category: 'hazardous',
    recyclable: false,
    disposal: 'Hazardous waste disposal',
    location: 'Vigo County Household Hazardous Waste Center',
    address: '3025 S 4 1/2 St, Terre Haute, IN 47802',
    phone: '(812) 462-3370',
    instructions: 'Latex paint can be dried out and thrown away. Oil-based paint needs special disposal.',
    tags: ['paint', 'paint can', 'latex', 'oil-based', 'primer']
  }
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(trickyItems);

  // Suppress hydration warnings from browser extensions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-gr-ext-installed],
      [data-grammarly-part],
      grammarly-desktop-integration {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hazardous': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'electronics': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'organic': return 'bg-leaf-50 text-leaf-700 border-leaf-200';
      case 'special': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-earth-100 text-earth-700 border-earth-200';
    }
  };

  return (
    <div className="min-h-screen bg-paper relative">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-30 bg-paper-texture pointer-events-none"></div>

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-4 py-6 border-b border-earth-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Link
                href="/"
                className="p-2 hover:bg-earth-100 rounded-xl transition-colors text-earth-600"
              >
                <ArrowRightIcon className="w-4 h-4 rotate-180" />
              </Link>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-2">
                  <SearchIcon className="w-10 h-10 text-leaf-600" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-earth-900">
                  Disposal Guide
                </h1>
                <p className="font-body text-xs sm:text-sm text-earth-600 mt-1">
                  Find where to recycle tricky items
                </p>
              </div>
              <div className="w-9"></div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-11 pr-4 py-3 bg-paper-light border border-earth-200 rounded-full focus:outline-none focus:border-leaf-400 font-body text-sm text-earth-800 placeholder-earth-500 transition-colors"
                data-gr-ext-disabled="true"
              />
            </div>
          </div>
        </header>

        {/* Items Grid */}
        <main className="flex-grow px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="paper-card hover:shadow-paper transition-all duration-200 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-4 sm:p-5">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-display text-base sm:text-lg font-bold text-earth-900">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.recyclable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-leaf-100 text-leaf-700 text-xs font-semibold rounded-full">
                              <CheckCircleIcon className="w-3 h-3" />
                              Recyclable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              <TrashIcon className="w-3 h-3" />
                              Not Recyclable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getCategoryColor(item.category)}`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </div>

                    {/* Instructions */}
                    <p className="font-body text-xs sm:text-sm text-earth-700 leading-relaxed mb-3">
                      {item.instructions}
                    </p>

                    {/* Location Info */}
                    {item.location && item.location !== 'Curbside' && (
                      <div className="p-3 bg-earth-50 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <LocationIcon className="w-3 h-3 text-earth-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-earth-800">
                              {item.location}
                            </p>
                            {item.address && item.address !== 'Various locations' && (
                              <p className="text-xs text-earth-600 mt-0.5">
                                {item.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {item.address && item.address !== 'Various locations' && (
                          <button
                            onClick={() => {
                              const addr = encodeURIComponent(item.address!);
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, '_blank');
                            }}
                            className="w-full py-1.5 px-2 bg-leaf-500 hover:bg-leaf-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <LocationIcon className="w-3 h-3" />
                            Get Directions
                          </button>
                        )}
                      </div>
                    )}

                    {/* Warning for hazardous */}
                    {item.category === 'hazardous' && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-xs font-semibold text-amber-700">
                          ⚠️ Hazardous - Handle with Care
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-earth-100 rounded-2xl mb-4">
                  <SearchIcon className="w-8 h-8 text-earth-400" />
                </div>
                <p className="font-display text-lg font-medium text-earth-600">
                  No items found
                </p>
                <p className="font-body text-sm text-earth-500 mt-1">
                  Try searching for something else
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 py-3 px-6 bg-leaf-500 hover:bg-leaf-600 text-white font-semibold rounded-full transition-all duration-200"
              >
                <CameraIcon className="w-4 h-4" />
                <span>Scan an Item</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="py-4 text-center border-t border-earth-100">
          <p className="text-xs text-earth-500 font-body">
            Keeping Terre Haute clean 🌿
          </p>
        </div>
      </div>
    </div>
  );
}