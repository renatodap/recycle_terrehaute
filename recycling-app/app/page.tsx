'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Leaf, Recycle, CheckCircle, XCircle, Info, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="content-wrapper min-h-screen">
      {!image ? (
        // Upload Screen
        <div className="min-h-screen flex flex-col">
          <header className="pt-8 pb-6 px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
                <Recycle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Terre Haute Recycles</h1>
              <p className="text-gray-600 text-sm">Snap a photo to check if it&apos;s recyclable</p>
            </div>
          </header>

          <main className="flex-1 px-4 pb-8">
            <div className="max-w-md mx-auto space-y-4">
              {/* Upload Card */}
              <div
                className={`card p-8 text-center transition-all ${
                  dragActive ? 'scale-[1.02] border-green-500 shadow-xl' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center">
                      <Camera className="w-10 h-10 text-green-600" />
                    </div>
                    {dragActive && (
                      <div className="absolute inset-0 w-24 h-24 border-4 border-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {dragActive ? 'Drop your image here' : 'Upload an image'}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Drag and drop or select from your device
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Camera</span>
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Gallery</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <Link href="/search" className="card p-4 flex items-center justify-between hover:no-underline group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search Items</p>
                    <p className="text-xs text-gray-500">Browse disposal guide</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </Link>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">75%</p>
                  <p className="text-xs text-gray-500">Recyclable waste</p>
                </div>

                <div className="card p-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                    <Info className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                  <p className="text-xs text-gray-500">Available help</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        // Results Screen
        <div className="min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-10 glass border-b border-gray-200">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">Analysis Results</h1>
              <button
                onClick={reset}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          <main className="pb-8">
            <div className="max-w-2xl mx-auto p-4 space-y-4">
              {/* Image Preview */}
              <div className="card overflow-hidden">
                <div className="aspect-video bg-gray-50">
                  <img
                    src={image}
                    alt="Analyzed item"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {loading ? (
                // Loading State
                <div className="card p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600">Analyzing image...</p>
                  </div>
                </div>
              ) : result ? (
                <>
                  {/* Main Result Card */}
                  <div className={`card p-6 border-2 ${
                    result.recyclable === true ? 'border-green-500 bg-green-50' :
                    result.recyclable === false ? 'border-red-500 bg-red-50' :
                    'border-gray-300'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        result.recyclable === true ? 'bg-green-500' :
                        result.recyclable === false ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}>
                        {result.recyclable === true ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : result.recyclable === false ? (
                          <XCircle className="w-6 h-6 text-white" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {result.item?.name || result.error || 'Unknown Item'}
                        </h2>
                        <p className={`text-lg font-medium mb-3 ${
                          result.recyclable === true ? 'text-green-600' :
                          result.recyclable === false ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {result.recyclable === true ? 'Recyclable' :
                           result.recyclable === false ? 'Not Recyclable' :
                           'Unknown'}
                        </p>

                        {result.confidence && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Confidence</span>
                              <span className="font-medium">{Math.round(result.confidence)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Disposal Instructions */}
                  {result.item && (
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Disposal Instructions</h3>

                      {result.item.bin_color && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600">Place in</p>
                          <p className="font-semibold text-gray-900">{result.item.bin_color} Bin</p>
                        </div>
                      )}

                      {result.item.disposal_method && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Method</p>
                          <p className="text-gray-900">{result.item.disposal_method}</p>
                        </div>
                      )}

                      {result.item.preparation && result.item.preparation.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Preparation</p>
                          <ul className="space-y-1">
                            {result.item.preparation.map((step: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span className="text-gray-900 text-sm">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.item.special_instructions && (
                        <div className="p-3 bg-amber-50 rounded-xl">
                          <p className="text-sm font-medium text-amber-900">Special Instructions</p>
                          <p className="text-sm text-amber-700 mt-1">{result.item.special_instructions}</p>
                        </div>
                      )}

                      {result.item.disposal_location && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600">Disposal Location</p>
                          <p className="font-medium text-gray-900">{result.item.disposal_location}</p>
                          {result.item.disposal_address && (
                            <p className="text-sm text-gray-600 mt-1">{result.item.disposal_address}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Try Again Button */}
                  <button
                    onClick={reset}
                    className="btn-primary w-full"
                  >
                    Analyze Another Item
                  </button>
                </>
              ) : null}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}