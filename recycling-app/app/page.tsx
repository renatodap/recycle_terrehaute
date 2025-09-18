'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import SearchBar from '@/components/SearchBar';
import RecyclingInfoCard from '@/components/RecyclingInfoCard';

export default function Home() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [identifyResult, setIdentifyResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'identify' | 'search'>('identify');

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    setIdentifyResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setIdentifyResult(data.match);
      } else {
        console.error('Failed to identify item');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">♻️</span>
            <div>
              <h1 className="text-2xl font-bold">Terre Haute Recycling Assistant</h1>
              <p className="text-primary-100 text-sm">Know what's recyclable in Vigo County</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('identify')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'identify'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Identify Item
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Items
          </button>
        </div>

        {/* Identify Tab */}
        {activeTab === 'identify' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Take or upload a photo to identify recyclable items
              </h2>
              <ImageUploader onImageSelect={handleImageSelect} />
            </div>

            {isLoading && (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            )}

            {identifyResult && !isLoading && (
              <RecyclingInfoCard
                item={identifyResult.item}
                category={identifyResult.category}
                recyclable={identifyResult.recyclable}
                instructions={identifyResult.special_instructions}
                confidence={identifyResult.confidence}
              />
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Search for items by name
              </h2>
              <SearchBar onSearch={handleSearch} placeholder="Try 'plastic bottle' or 'battery'..." />
            </div>

            {isLoading && (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            )}

            {searchResults.length > 0 && !isLoading && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Search Results:</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {searchResults.map((result, index) => (
                    <RecyclingInfoCard
                      key={index}
                      item={result.item}
                      category={result.category}
                      recyclable={result.recyclable}
                      instructions={result.special_instructions}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Placeholder Sections */}
        <div className="mt-12 space-y-8">
          {/* Nearby Drop-off Locations */}
          <section className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📍</span>
              Nearby Drop-off Locations
            </h2>
            <p className="text-gray-600">
              Find recycling centers and special disposal locations near you.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-center text-gray-500">Map integration coming soon...</p>
            </div>
          </section>

          {/* Next Pickup Day */}
          <section className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📅</span>
              Next Pickup Day
            </h2>
            <p className="text-gray-600">
              Check your recycling collection schedule.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-center text-gray-500">Enter your address to see pickup schedule...</p>
            </div>
          </section>

          {/* What Can I Recycle */}
          <section className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>♻️</span>
              What Can I Recycle?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <span className="text-2xl">📦</span>
                <p className="text-sm font-medium text-gray-700 mt-2">Paper & Cardboard</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <span className="text-2xl">🥤</span>
                <p className="text-sm font-medium text-gray-700 mt-2">Plastics #1-7</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <span className="text-2xl">🥫</span>
                <p className="text-sm font-medium text-gray-700 mt-2">Metal Cans</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <span className="text-2xl">🍾</span>
                <p className="text-sm font-medium text-gray-700 mt-2">Glass Bottles</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Terre Haute Recycling Assistant</p>
          <p className="text-sm mt-2">Helping keep Vigo County clean and green 🌱</p>
        </div>
      </footer>
    </div>
  );
}