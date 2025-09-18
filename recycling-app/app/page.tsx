'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, XCircle, AlertTriangle, MapPin, Phone, ArrowRight, Sparkles } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setImage(imageData);
      setLoading(true);

      try {
        const base64Image = imageData.split(',')[1];
        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await response.json();

        if (data.success) {
          setResult({
            item: data.item,
            recyclable: data.item?.is_recyclable,
            confidence: data.confidence,
            ...data
          });
        } else {
          setResult({
            error: data.error || 'Unable to identify item',
            recyclable: undefined
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setResult({
          error: 'Something went wrong. Please try again.',
          recyclable: undefined
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getStatusColor = (recyclable: boolean | undefined) => {
    if (recyclable === true) return 'from-green-400 to-emerald-600';
    if (recyclable === false) return 'from-red-400 to-rose-600';
    return 'from-gray-400 to-gray-600';
  };

  const getStatusIcon = (recyclable: boolean | undefined) => {
    if (recyclable === true) return <CheckCircle className="w-12 h-12 md:w-16 md:h-16" />;
    if (recyclable === false) return <XCircle className="w-12 h-12 md:w-16 md:h-16" />;
    return <AlertTriangle className="w-12 h-12 md:w-16 md:h-16" />;
  };

  const getStatusText = (recyclable: boolean | undefined) => {
    if (recyclable === true) return 'Recyclable';
    if (recyclable === false) return 'Not Recyclable';
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 dark:bg-green-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="relative z-10">
        {!image ? (
          // Initial View - Camera/Upload
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-md mx-auto">
              {/* Logo and Title */}
              <div className="text-center mb-8 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl mb-4 shadow-xl">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Terre Haute Recycles
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Snap. Check. Recycle.
                </p>
              </div>

              {/* Action Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-slide-up">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full mb-4">
                    <Camera className="w-16 h-16 md:w-20 md:h-20 text-green-600 dark:text-green-400 animate-pulse-soft" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">
                    Is it recyclable?
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Take a photo to find out instantly
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <label className="block">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-3">
                      <Camera className="w-5 h-5" />
                      <span>Take Photo</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </label>

                  <label className="block">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button className="w-full py-4 px-6 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-3">
                      <Upload className="w-5 h-5" />
                      <span>Upload Image</span>
                    </button>
                  </label>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI-powered • Instant results • Local rules
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Results View
          <div className="min-h-screen">
            {/* Header with close button */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Results</h1>
                <button
                  onClick={reset}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
              {/* Image Preview */}
              <div className="mb-6 animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={image}
                    alt="Scanned item"
                    className="w-full h-64 md:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

              {loading ? (
                // Loading State
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 animate-fade-in">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full"></div>
                      <div className="absolute inset-0 w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium">Analyzing image...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Using AI to identify recyclables</p>
                    </div>
                  </div>
                </div>
              ) : result ? (
                // Result Display
                <div className="space-y-4 animate-slide-up">
                  {/* Main Result Card */}
                  <div className={`bg-gradient-to-br ${getStatusColor(result.recyclable)} rounded-3xl shadow-xl p-8 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">
                          {result.item?.name || result.error || 'Unknown Item'}
                        </h2>
                        <p className="text-2xl md:text-3xl font-medium opacity-90">
                          {getStatusText(result.recyclable)}
                        </p>
                        {result.confidence && (
                          <div className="mt-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-white rounded-full h-2 transition-all duration-1000"
                                  style={{ width: `${result.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {(result.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {getStatusIcon(result.recyclable)}
                      </div>
                    </div>
                  </div>

                  {/* Disposal Instructions */}
                  {result.item && !result.error && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-6">
                      {/* Disposal Method */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                            📦
                          </span>
                          How to Dispose
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-lg pl-11">
                          {result.item.disposal_method}
                        </p>
                      </div>

                      {/* Bin Color */}
                      {result.item.bin_color && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                              🗑️
                            </span>
                            Which Bin?
                          </h3>
                          <div className="pl-11">
                            <div className="inline-flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg ${
                                result.item.bin_color === 'Blue' ? 'bg-blue-500' :
                                result.item.bin_color === 'Green' ? 'bg-green-500' :
                                result.item.bin_color === 'Black' ? 'bg-gray-800' :
                                result.item.bin_color === 'Special' ? 'bg-amber-500' :
                                'bg-gray-500'
                              }`}></div>
                              <span className="text-lg font-medium">{result.item.bin_color} Bin</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Preparation */}
                      {result.item.preparation && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <span className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                              ✨
                            </span>
                            Preparation
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 text-lg pl-11">
                            {result.item.preparation}
                          </p>
                        </div>
                      )}

                      {/* Special Disposal Location */}
                      {(result.item.disposal_location || result.item.disposal_address) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-600 dark:text-blue-400">
                            <MapPin className="w-5 h-5 mr-2" />
                            Special Disposal Required
                          </h3>

                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 space-y-4">
                            {result.item.disposal_location && (
                              <div>
                                <p className="font-semibold text-lg text-blue-900 dark:text-blue-200">
                                  {result.item.disposal_location}
                                </p>
                              </div>
                            )}

                            {result.item.disposal_address && (
                              <div className="flex items-start space-x-2">
                                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-blue-800 dark:text-blue-300">
                                  {result.item.disposal_address}
                                </p>
                              </div>
                            )}

                            {result.item.disposal_phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <a
                                  href={`tel:${result.item.disposal_phone}`}
                                  className="text-blue-800 dark:text-blue-300 hover:underline"
                                >
                                  {result.item.disposal_phone}
                                </a>
                              </div>
                            )}

                            {result.item.disposal_address && (
                              <button
                                onClick={() => {
                                  const encodedAddress = encodeURIComponent(result.item.disposal_address);
                                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
                                }}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                              >
                                <MapPin className="w-5 h-5" />
                                <span>Get Directions</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scan Another Button */}
                  <button
                    onClick={reset}
                    className="w-full py-4 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Scan Another Item
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Only show on results page */}
      {image && <BottomNav />}
    </div>
  );
}