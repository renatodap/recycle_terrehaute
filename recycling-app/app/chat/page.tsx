'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import { Send, Trash2, MessageCircle } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "How can I help you with recycling today?", sender: 'bot' }
  ])
  const [input, setInput] = useState('')

  const quickReplies = [
    "Where can I recycle plastic?",
    "What items are recyclable?",
    "Find nearest recycling center"
  ]

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user'
    }
    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Simulate bot response
    setTimeout(() => {
      const botReply: Message = {
        id: Date.now() + 1,
        text: "Thanks for your question! You can recycle that at Location 1 on Wabash Ave.",
        sender: 'bot'
      }
      setMessages(prev => [...prev, botReply])
    }, 1000)
  }

  return (
    <>
      <Header />
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Chat Header with Clear Button */}
        <div className="bg-white px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <MessageCircle className="text-green-600" size={20} />
            Recycling Assistant
          </h2>
          <button
            onClick={() => setMessages([{ id: 1, text: "How can I help you with recycling today?", sender: 'bot' }])}
            className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
          >
            <Trash2 size={16} />
            Clear Chat
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(reply)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
            >
              {`Pre ${idx + 1}`}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="How can I help?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => sendMessage(input)}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}