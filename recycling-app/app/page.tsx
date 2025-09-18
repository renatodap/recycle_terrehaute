'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
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
        // Convert to base64 and send to API
        const base64Image = imageData.split(',')[1];
        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await response.json();

        // Handle response format
        if (data.success) {
          if (data.identified_items) {
            // Enhanced response format
            const primaryMatch = data.identified_items[0];
            setResult({
              item: primaryMatch.item,
              recyclable: primaryMatch.item?.is_recyclable,
              confidence: primaryMatch.confidence,
              ...primaryMatch
            });
          } else if (data.match) {
            // Legacy response format
            setResult({
              item: data.match,
              recyclable: data.match?.is_recyclable,
              confidence: data.confidence,
              ...data.match
            });
          }
        } else {
          setResult({
            error: data.error || 'Failed to identify item',
            recyclable: undefined
          });
        }
      } catch (error) {
        console.error('Error identifying item:', error);
        setResult({
          error: 'Failed to identify item. Please try again.',
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
    if (recyclable === true) return 'bg-green-500';
    if (recyclable === false) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusIcon = (recyclable: boolean | undefined) => {
    if (recyclable === true) return <CheckCircle className="w-8 h-8" />;
    if (recyclable === false) return <XCircle className="w-8 h-8" />;
    return <HelpCircle className="w-8 h-8" />;
  };

  const getStatusText = (recyclable: boolean | undefined) => {
    if (recyclable === true) return 'Recyclable';
    if (recyclable === false) return 'Not Recyclable';
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Simple Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">Terre Haute Recycling</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {!image ? (
          // Camera/Upload View
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Is it recyclable?</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Take a photo or upload an image to find out
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="flex flex-col items-center space-y-6">
                {/* Camera Icon */}
                <div className="w-32 h-32 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Camera className="w-16 h-16 text-green-600 dark:text-green-400" />
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                  <label className="block">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Take Photo</span>
                    </div>
                  </label>

                  <label className="block">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-full py-4 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Upload Image</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Quick Tips
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Make sure the item is clearly visible</li>
                <li>• Good lighting helps with identification</li>
                <li>• Include recycling symbols if visible</li>
              </ul>
            </div>
          </div>
        ) : (
          // Results View
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={image}
                alt="Uploaded item"
                className="w-full h-64 object-cover"
              />
              <button
                onClick={reset}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              // Loading State
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600"></div>
                  <p className="text-gray-600 dark:text-gray-400">Analyzing image...</p>
                </div>
              </div>
            ) : result ? (
              // Result Card
              <div className="space-y-4">
                {/* Main Result */}
                <div className={`${getStatusColor(result.recyclable)} text-white rounded-2xl p-6 shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {result.item?.name || result.error || 'Unknown Item'}
                      </h3>
                      {result.confidence && (
                        <p className="text-white/80 text-sm">
                          {(result.confidence * 100).toFixed(0)}% confidence
                        </p>
                      )}
                    </div>
                    {getStatusIcon(result.recyclable)}
                  </div>
                  <p className="text-xl font-semibold">
                    {getStatusText(result.recyclable)}
                  </p>
                </div>

                {/* Disposal Instructions */}
                {result.item && !result.error && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h4 className="font-semibold mb-3">How to Dispose</h4>

                    {result.item.bin_color && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`w-8 h-8 rounded ${
                          result.item.bin_color === 'Blue' ? 'bg-blue-500' :
                          result.item.bin_color === 'Green' ? 'bg-green-500' :
                          result.item.bin_color === 'Brown' ? 'bg-amber-700' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="font-medium">{result.item.bin_color} Bin</span>
                      </div>
                    )}

                    {result.item.disposal_method && (
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {result.item.disposal_method}
                      </p>
                    )}

                    {result.item.preparation && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          <strong>Preparation:</strong> {result.item.preparation}
                        </p>
                      </div>
                    )}

                    {result.item.drop_off_required && (
                      <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <AlertCircle className="inline w-4 h-4 mr-1" />
                          Special drop-off required at: {result.item.drop_off_location}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Try Again Button */}
                <button
                  onClick={reset}
                  className="w-full py-4 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-colors"
                >
                  Scan Another Item
                </button>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}