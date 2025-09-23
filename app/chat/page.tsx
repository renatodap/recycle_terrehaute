'use client'
import { useState, FormEvent } from 'react'
import { Send, MessageCircle, Recycle, X } from 'lucide-react'

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "How can I help you with recycling today?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const presetMessages = [
    "Where can I recycle plastic bottles?",
    "What electronics can be recycled?",
    "Find nearest recycling center"
  ]

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date()
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')
    setIsTyping(true)

    // Call chat API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.id !== 1).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.text
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsTyping(false)
        const botMessage: Message = {
          id: Date.now() + 1,
          text: data.message,
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        setIsTyping(false)
        const botMessage: Message = {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble responding right now. Please try again.",
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't connect to the server. Please check your connection.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "How can I help you with recycling today?",
        isUser: false,
        timestamp: new Date()
      }
    ])
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Recycle className="text-green-600" size={24} />
            Recycle Terre Haute
          </h1>
          <button
            onClick={clearChat}
            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
          >
            Clear Chat
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-3">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-300'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-300 px-4 py-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white border-t-2 border-gray-300 p-3">
        {/* Preset Buttons */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {presetMessages.map((preset, index) => (
            <button
              key={index}
              onClick={() => sendMessage(preset)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs whitespace-nowrap hover:bg-gray-200"
              title={preset}
            >
              {preset.length > 20 ? preset.substring(0, 20) + '...' : preset}
            </button>
          ))}
        </div>

        {/* Text Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message or..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}