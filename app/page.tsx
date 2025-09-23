'use client'
import React, { useState, useRef } from 'react'
import { Camera, Recycle } from 'lucide-react'
import Image from 'next/image'

function formatInstructions(text: string) {
  const lines = text.split('\n')
  const formatted: React.ReactElement[] = []

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return

    if (trimmed.startsWith('**') && trimmed.endsWith(':**')) {
      const heading = trimmed.replace(/\*\*/g, '').replace(':', '')
      formatted.push(
        <h4 key={idx} className="font-bold text-gray-900 mt-2 mb-1 text-sm">
          {heading}
        </h4>
      )
    } else if (trimmed.startsWith('•')) {
      formatted.push(
        <li key={idx} className="ml-4 text-gray-700 text-sm">
          {trimmed.substring(1).trim()}
        </li>
      )
    } else {
      formatted.push(
        <p key={idx} className="text-gray-700 text-sm">
          {trimmed}
        </p>
      )
    }
  })

  return <div className="space-y-1">{formatted}</div>
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isScanned, setIsScanned] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scanResult, setScanResult] = useState<{
    item: string
    recyclable: string
    instructions: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageBase64 = reader.result as string
        setSelectedImage(imageBase64)

        // Show processing state after image is loaded
        setIsAnalyzing(true)
        setIsScanned(true)

        // Call AI analysis API
        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageBase64 })
          })

          if (response.ok) {
            const data = await response.json()
            setIsAnalyzing(false)
            setIsScanned(true)
            setScanResult({
              item: data.item || "Unknown Item",
              recyclable: data.recyclable || "Unknown",
              instructions: data.instructions || "Please check with local recycling center"
            })
          } else {
            // Fallback for errors
            setIsAnalyzing(false)
            setIsScanned(true)
            setScanResult({
              item: "Unable to analyze",
              recyclable: "Unknown",
              instructions: "Please try again or contact your local recycling center"
            })
          }
        } catch (error) {
          console.error('Error analyzing image:', error)
          setIsAnalyzing(false)
          setIsScanned(true)
          setScanResult({
            item: "Analysis failed",
            recyclable: "Unknown",
            instructions: "Please check your connection and try again"
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNewScan = () => {
    setSelectedImage(null)
    setIsScanned(false)
    setScanResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 p-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Recycle className="text-green-600" size={20} />
          Recycle Terre Haute
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 flex flex-col overflow-y-auto">
        {!isScanned ? (
          // Before Scan State
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="border-4 border-dashed border-gray-400 rounded-lg h-48 flex flex-col items-center justify-center bg-gray-100 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={selectedImage}
                    alt="Selected item"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <>
                  <Camera size={48} className="text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm">Tap to upload image</p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 bg-green-600 text-white py-3 px-6 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-green-700"
            >
              <Camera size={24} />
              Scan Item
            </button>
          </div>
        ) : (
          // After Scan State
          <div className="flex-1 flex flex-col">
            <div className="border-2 border-gray-300 rounded-lg p-3 bg-white mb-3">
              <h2 className="text-base font-bold mb-2">Scanned Item</h2>
              {selectedImage && (
                <div className="relative h-32 mb-3">
                  <Image
                    src={selectedImage}
                    alt="Scanned item"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              )}
              {isAnalyzing && (
                <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-base font-bold text-blue-800">
                        Processing your image...
                      </p>
                      <p className="text-gray-700 text-sm">
                        Identifying item and finding disposal instructions
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!isAnalyzing && scanResult && (
                <div className="space-y-3">
                  {/* Item Identification */}
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
                    <h3 className="text-base font-bold text-gray-800 mb-2">
                      {scanResult.item}
                    </h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      scanResult.recyclable?.toLowerCase() === 'yes'
                        ? 'bg-green-100 text-green-800'
                        : scanResult.recyclable?.toLowerCase() === 'no'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {scanResult.recyclable === 'Yes' ? '♻️ Recyclable' :
                       scanResult.recyclable === 'No' ? '🗑️ Not Recyclable' :
                       '⚠️ Special Disposal'}
                    </div>
                  </div>

                  {/* Disposal Instructions */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">What to do:</h4>
                    {formatInstructions(scanResult.instructions)}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleNewScan}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg text-base font-semibold hover:bg-blue-700"
            >
              Scan New Item
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
