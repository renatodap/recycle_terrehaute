'use client';

import { useState } from 'react';
import { Search, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type SearchItem = {
  name: string;
  category: string;
  is_recyclable: boolean;
  disposal_method: string;
  preparation?: string;
  bin_color?: string;
  drop_off_required?: boolean;
  drop_off_location?: string;
};

// Popular search categories
const categories = [
  { label: 'Plastic', icon: '♻️', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { label: 'Paper', icon: '📄', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { label: 'Electronics', icon: '💻', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { label: 'Glass', icon: '🍾', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { label: 'Metal', icon: '🥫', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { label: 'Hazardous', icon: '⚠️', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
];

// Common searches
const commonSearches = [
  'Pizza box',
  'Batteries',
  'Plastic bags',
  'Styrofoam',
  'Light bulbs',
  'Paint cans',
  'Coffee cups',
  'Electronics',
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery(category);
    handleSearch(category);
  };

  const handleCommonSearch = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setSelectedCategory(null);
  };

  const getRecyclabilityColor = (isRecyclable: boolean) => {
    return isRecyclable ? 'bg-green-500' : 'bg-red-500';
  };

  const getRecyclabilityIcon = (isRecyclable: boolean) => {
    return isRecyclable ? (
      <CheckCircle className="w-5 h-5 text-white" />
    ) : (
      <XCircle className="w-5 h-5 text-white" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header with Search Bar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Show categories and common searches when no results */}
        {results.length === 0 && !loading && (
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h2 className="font-semibold mb-3">Browse by Category</h2>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.label}
                    onClick={() => handleCategoryClick(category.label)}
                    className={`p-3 rounded-xl ${category.color} font-medium transition-transform hover:scale-105`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-sm">{category.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Common Searches */}
            <div>
              <h2 className="font-semibold mb-3">Common Searches</h2>
              <div className="flex flex-wrap gap-2">
                {commonSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleCommonSearch(term)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && !loading && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>

            {results.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.category}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${getRecyclabilityColor(item.is_recyclable)}`}>
                      {getRecyclabilityIcon(item.is_recyclable)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.disposal_method}
                    </p>

                    {item.bin_color && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${
                          item.bin_color === 'Blue' ? 'bg-blue-500' :
                          item.bin_color === 'Green' ? 'bg-green-500' :
                          item.bin_color === 'Brown' ? 'bg-amber-700' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium">{item.bin_color} Bin</span>
                      </div>
                    )}

                    {item.preparation && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          <strong>Preparation:</strong> {item.preparation}
                        </p>
                      </div>
                    )}

                    {item.drop_off_required && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          <AlertCircle className="inline w-3 h-3 mr-1" />
                          Drop-off required: {item.drop_off_location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {results.length === 0 && searchQuery && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No results found for &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try searching for a different item or browse categories
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}