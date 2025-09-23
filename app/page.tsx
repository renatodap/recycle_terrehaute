'use client'
import { useState, useRef } from 'react'
import { Camera, Recycle } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isScanned, setIsScanned] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scanResult, setScanResult] = useState<{
    item: string
    recyclable: string
    location: string
    preparation: string
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
        setIsAnalyzing(true)

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
              location: data.location || "Check with local authorities",
              preparation: data.preparation || "None specified",
              instructions: data.instructions || "Please check with local recycling center"
            })
          } else {
            // Fallback for errors
            setIsAnalyzing(false)
            setIsScanned(true)
            setScanResult({
              item: "Unable to analyze",
              recyclable: "Unknown",
              location: "Please try again",
              preparation: "N/A",
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
            location: "N/A",
            preparation: "N/A",
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
      <header className="bg-white border-b-2 border-gray-300 p-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Recycle className="text-green-600" size={24} />
          Recycle Terre Haute
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col">
        {!isScanned ? (
          // Before Scan State
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="border-4 border-dashed border-gray-400 rounded-lg h-64 flex flex-col items-center justify-center bg-gray-100 cursor-pointer"
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
                  <Camera size={64} className="text-gray-400 mb-4" />
                  <p className="text-gray-500">Tap to upload image</p>
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
              className="mt-8 bg-green-600 text-white py-4 px-8 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700"
            >
              <Camera size={24} />
              Scan Item
            </button>
          </div>
        ) : (
          // After Scan State
          <div className="flex-1 flex flex-col">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white mb-4">
              <h2 className="text-lg font-bold mb-2">Scanned Item</h2>
              {selectedImage && (
                <div className="relative h-48 mb-4">
                  <Image
                    src={selectedImage}
                    alt="Scanned item"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              )}
              {isAnalyzing && (
                <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4">
                  <p className="text-xl font-bold text-blue-800">
                    Analyzing image...
                  </p>
                  <p className="text-gray-700">
                    Please wait while we identify your item
                  </p>
                </div>
              )}
              {!isAnalyzing && scanResult && (
                <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-600">1. Item:</span>
                      <p className="text-xl font-bold text-green-800">{scanResult.item}</p>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-gray-600">2. Recyclable:</span>
                      <p className={`text-lg font-semibold ${
                        scanResult.recyclable.toLowerCase() === 'yes' ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {scanResult.recyclable}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-gray-600">3. Location:</span>
                      <p className="text-lg text-gray-800">{scanResult.location}</p>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-gray-600">4. Preparation:</span>
                      <p className="text-lg text-gray-800">{scanResult.preparation}</p>
                    </div>

                    {scanResult.instructions.includes('\n\n') && (
                      <div className="pt-3 mt-3 border-t border-green-300">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {scanResult.instructions.split('\n\n').slice(1).join('\n\n')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleNewScan}
              className="bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Scan New Item
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
