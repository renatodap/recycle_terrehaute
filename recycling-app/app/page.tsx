'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, HelpCircle, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnalyzingScreen from '@/components/AnalyzingScreen';
import ResultsScreen from '@/components/ResultsScreen';
import { RecyclingResult } from '@/types/recycling';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RecyclingResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetApp = () => {
    setResult(null);
    setIsAnalyzing(false);
  };

  if (isAnalyzing) {
    return <AnalyzingScreen />;
  }

  if (result) {
    return <ResultsScreen result={result} onReset={resetApp} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            RecycleIt! Terre Haute
          </h1>
          <p className="text-gray-600 text-sm">
            What should I do with...
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* Camera Button - Primary Action */}
          <div
            className={`relative ${dragActive ? 'scale-105' : ''} transition-transform`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square max-w-xs mx-auto flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <Camera className="w-20 h-20 text-white mb-4" />
              <span className="text-white text-xl font-semibold">Snap Photo</span>
              <span className="text-green-100 text-sm mt-2">Tap to identify</span>
            </button>

            {dragActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-3xl">
                <p className="text-white text-lg font-semibold">Drop image here</p>
              </div>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="text-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gradient-to-br from-green-50 to-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all"
            >
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Upload from Gallery</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button
              onClick={() => router.push('/help')}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-green-600 transition-colors"
            >
              <HelpCircle className="w-6 h-6 mb-1" />
              <span className="text-xs">Help</span>
            </button>

            <button
              onClick={() => router.push('/faq')}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-green-600 transition-colors"
            >
              <List className="w-6 h-6 mb-1" />
              <span className="text-xs">FAQ</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}