'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LeafIcon, RecycleIcon, CameraIcon, SearchIcon, UploadIcon } from '@/components/icons/EcoIcons';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen bg-paper relative">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-30 bg-paper-texture pointer-events-none"></div>

      {!image ? (
        // Upload Page
        <div className="relative min-h-screen flex flex-col">
          {/* Header Section */}
          <div className="flex-grow flex flex-col justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-md mx-auto space-y-8">
              {/* Logo and Title */}
              <div className="text-center space-y-4 animate-fadeIn">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
                  <RecycleIcon className="w-full h-full text-leaf-600 animate-float" />
                </div>
                <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl font-bold text-earth-900">
                  Recycle Smart
                </h1>
                <p className="font-body text-sm sm:text-base text-earth-600 max-w-xs mx-auto">
                  Snap a photo and instantly know how to recycle in Terre Haute
                </p>
              </div>

              {/* Upload Card */}
              <div
                className={`
                  paper-card p-6 sm:p-8 transition-all duration-300
                  ${dragActive ? 'scale-[1.02] shadow-lifted border-2 border-leaf-400' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center space-y-6">
                  {/* Upload Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-leaf-200 rounded-full blur-2xl opacity-20 animate-pulse-soft"></div>
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-paper-light to-leaf-50 rounded-full flex items-center justify-center">
                      {dragActive ? (
                        <UploadIcon className="w-12 h-12 sm:w-16 sm:h-16 text-leaf-600 animate-pulse" />
                      ) : (
                        <CameraIcon className="w-12 h-12 sm:w-16 sm:h-16 text-leaf-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-display text-lg sm:text-xl font-semibold text-earth-900">
                      {dragActive ? 'Drop your image here' : 'Upload an image'}
                    </p>
                    <p className="font-body text-xs sm:text-sm text-earth-600">
                      Drag & drop or click to select
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="paper-card py-3 px-4 bg-leaf-500 hover:bg-leaf-600 text-white font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                      <span>Camera</span>
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                      data-gr-ext-disabled="true"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="paper-card py-3 px-4 bg-paper-light hover:bg-earth-100 text-earth-700 font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 border border-earth-200 group"
                    >
                      <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                      <span>Gallery</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      data-gr-ext-disabled="true"
                    />
                  </div>
                </div>
              </div>

              {/* Search Link */}
              <Link
                href="/search"
                className="paper-card p-4 flex items-center justify-between group hover:shadow-paper transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center">
                    <SearchIcon className="w-5 h-5 text-earth-600" />
                  </div>
                  <span className="font-body text-earth-700 text-sm sm:text-base">Browse disposal guide</span>
                </div>
                <svg className="w-5 h-5 text-earth-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center">
            <p className="text-xs text-earth-500 font-body">
              Keeping Terre Haute clean 🌿
            </p>
          </div>
        </div>
      ) : (
        // Results View
        <div className="relative min-h-screen flex flex-col">
          <div className="flex-grow px-4 py-6 sm:py-8">
            <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6">
              {/* Back Button */}
              <button
                onClick={reset}
                className="flex items-center gap-2 text-earth-600 hover:text-earth-800 font-body text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {/* Image Preview */}
              <div className="paper-card overflow-hidden">
                <div className="aspect-[4/3] bg-earth-50">
                  <img
                    src={image}
                    alt="Analyzed item"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {loading ? (
                // Loading State
                <div className="paper-card p-8 sm:p-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-leaf-200 rounded-full blur-xl animate-pulse"></div>
                      <RecycleIcon className="relative w-12 h-12 sm:w-16 sm:h-16 text-leaf-600 animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="font-display text-base sm:text-lg font-semibold text-earth-900">Analyzing...</p>
                      <p className="font-body text-xs sm:text-sm text-earth-600 mt-1">This takes 2-3 seconds</p>
                    </div>
                  </div>
                </div>
              ) : result ? (
                // Results Display
                <div className="space-y-4">
                  {/* Main Result */}
                  <div className={`paper-card p-6 border-2 ${
                    result.recyclable === true ? 'border-leaf-400 bg-gradient-to-br from-leaf-50 to-paper-light' :
                    result.recyclable === false ? 'border-red-300 bg-gradient-to-br from-red-50 to-paper-light' :
                    'border-earth-200'
                  }`}>
                    <div className="space-y-4">
                      {/* Item Name and Status */}
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-earth-900">
                          {result.item?.name || result.error || 'Unknown Item'}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                            result.recyclable === true ? 'bg-leaf-100 text-leaf-700' :
                            result.recyclable === false ? 'bg-red-100 text-red-700' :
                            'bg-earth-100 text-earth-700'
                          }`}>
                            {result.recyclable === true ? '✓ Recyclable' :
                             result.recyclable === false ? '✗ Not Recyclable' :
                             '? Unknown'}
                          </span>
                          {result.confidence && (
                            <span className="text-xs text-earth-500">
                              {(result.confidence * 100).toFixed(0)}% sure
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Disposal Instructions */}
                      {result.item && !result.error && (
                        <div className="space-y-3 pt-3 border-t border-earth-100">
                          {result.item.disposal_method && (
                            <div>
                              <p className="font-body text-xs text-earth-600 uppercase tracking-wide mb-1">How to dispose</p>
                              <p className="font-body text-sm sm:text-base text-earth-800">{result.item.disposal_method}</p>
                            </div>
                          )}

                          {result.item.preparation && (
                            <div>
                              <p className="font-body text-xs text-earth-600 uppercase tracking-wide mb-1">Preparation</p>
                              <p className="font-body text-sm sm:text-base text-earth-800">{result.item.preparation}</p>
                            </div>
                          )}

                          {result.item.bin_color && (
                            <div>
                              <p className="font-body text-xs text-earth-600 uppercase tracking-wide mb-1">Bin</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                result.item.bin_color === 'Blue' ? 'bg-blue-100 text-blue-700' :
                                result.item.bin_color === 'Black' ? 'bg-earth-800 text-white' :
                                'bg-earth-200 text-earth-700'
                              }`}>
                                {result.item.bin_color} Bin
                              </span>
                            </div>
                          )}

                          {result.item.disposal_location && (
                            <div className="p-3 bg-amber-50 rounded-xl">
                              <p className="font-body text-xs text-amber-800 uppercase tracking-wide mb-1">Special disposal</p>
                              <p className="font-body text-sm font-semibold text-amber-900">{result.item.disposal_location}</p>
                              {result.item.disposal_address && (
                                <p className="font-body text-xs text-amber-700 mt-1">{result.item.disposal_address}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={reset}
                    className="w-full paper-card py-3 bg-leaf-500 hover:bg-leaf-600 text-white font-semibold transition-all duration-200"
                  >
                    Scan Another Item
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}