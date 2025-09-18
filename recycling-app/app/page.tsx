'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import SearchBar from '@/components/SearchBar';
import RecyclingInfoCard from '@/components/RecyclingInfoCard';
import EnhancedRecyclingCard from '@/components/EnhancedRecyclingCard';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Stats from '@/components/Stats';
import Footer from '@/components/Footer';

export default function Home() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [identifyResult, setIdentifyResult] = useState<any>(null);
  const [identifyResponse, setIdentifyResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'identify' | 'search'>('identify');
  const [showDetails, setShowDetails] = useState(false);

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    setIdentifyResult(null);
    setIdentifyResponse(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.identified_items) {
        // New enhanced response format
        setIdentifyResponse(data);
        setIdentifyResult(data.identified_items[0]); // Primary match
      } else if (data.success && data.match) {
        // Legacy response format
        setIdentifyResult(data.match);
      } else {
        console.error('Failed to identify item:', data.error);
        setIdentifyResult({
          name: 'Unknown Item',
          confidence: 0,
          is_recyclable: false,
          bin_type: 'trash',
          category: 'Unknown',
          special_instructions: data.message || 'Could not identify this item. Try taking a clearer photo.',
          contamination_notes: '',
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setIdentifyResult({
        name: 'Error',
        confidence: 0,
        is_recyclable: false,
        bin_type: 'trash',
        category: 'Error',
        special_instructions: 'Failed to process image. Please try again.',
        contamination_notes: '',
      });
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* How It Works */}
      <HowItWorks />

      {/* Main App Section */}
      <section id="identify-section" className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Identify Your Items
            </h2>
            <p className="text-xl text-gray-600">
              Use AI to instantly know if something is recyclable in Terre Haute
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full shadow-lg p-1 inline-flex">
              <button
                onClick={() => setActiveTab('identify')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === 'identify'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Photo Identify
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Manual Search
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-4xl mx-auto">
            {/* Identify Tab */}
            {activeTab === 'identify' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <ImageUploader onImageSelect={handleImageSelect} />
                </div>

                {isLoading && (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mb-4"></div>
                    <p className="text-gray-600">Analyzing image...</p>
                  </div>
                )}

                {identifyResult && !isLoading && (
                  <div className="space-y-4">
                    {identifyResult.bin_type ? (
                      <>
                        <EnhancedRecyclingCard item={identifyResult} showDetails={showDetails} />

                        {/* Additional matches */}
                        {identifyResponse?.identified_items?.length > 1 && (
                          <div className="mt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                              Alternative Matches
                            </h3>
                            <div className="space-y-4">
                              {identifyResponse.identified_items.slice(1).map((item: any, index: number) => (
                                <div key={index} className="opacity-80 hover:opacity-100 transition-opacity">
                                  <EnhancedRecyclingCard item={item} showDetails={false} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technical Details */}
                        {identifyResponse && (
                          <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-700">Analysis Details</h4>
                              <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                              >
                                {showDetails ? 'Hide' : 'Show'} Details
                                <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Processing Time:</span>
                                <span className="ml-2 font-medium">{identifyResponse.processing_time_ms}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Cache Status:</span>
                                <span className="ml-2 font-medium">
                                  {identifyResponse.cached ? '✓ Cached' : 'Fresh'}
                                </span>
                              </div>
                              {identifyResponse.rate_limit && (
                                <>
                                  <div>
                                    <span className="text-gray-500">API Calls Remaining:</span>
                                    <span className="ml-2 font-medium">{identifyResponse.rate_limit.remaining}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Daily Limit:</span>
                                    <span className="ml-2 font-medium">
                                      {identifyResponse.daily_limit?.used || 0} / {identifyResponse.daily_limit?.used + identifyResponse.daily_limit?.remaining || 1000}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <RecyclingInfoCard
                        item={identifyResult.item || identifyResult.name}
                        category={identifyResult.category}
                        recyclable={identifyResult.recyclable || (identifyResult.is_recyclable ? 'Yes' : 'No')}
                        instructions={identifyResult.special_instructions}
                        confidence={identifyResult.confidence}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Search for Items
                  </h3>
                  <SearchBar onSearch={handleSearch} placeholder="Try 'plastic bottle' or 'battery'..." />
                </div>

                {isLoading && (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mb-4"></div>
                    <p className="text-gray-600">Searching database...</p>
                  </div>
                )}

                {searchResults.length > 0 && !isLoading && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Found {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
                    </h3>
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Stats Section */}
      <Stats />

      {/* Additional Info Sections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Drop-off Locations */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Drop-off Locations</h3>
              <p className="text-gray-600 mb-4">
                Find the nearest recycling centers and special disposal facilities.
              </p>
              <button className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2">
                View Locations
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Pickup Schedule */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-secondary-100 text-secondary-600 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pickup Schedule</h3>
              <p className="text-gray-600 mb-4">
                Check your recycling collection dates and holiday schedules.
              </p>
              <button className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2">
                View Schedule
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Recycling Guide */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recycling Guide</h3>
              <p className="text-gray-600 mb-4">
                Learn best practices and tips for effective recycling.
              </p>
              <button className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2">
                Read Guide
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}