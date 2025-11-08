"use client"

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { MetricCard } from '@/components/MetricCard'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
  data?: any[]
  visualization?: string
  timestamp: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch sample questions on mount
  useEffect(() => {
    const fetchSampleQuestions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/chat/sample-questions`)
        setSampleQuestions(response.data.questions)
      } catch (error) {
        console.error('Failed to fetch sample questions:', error)
      }
    }
    fetchSampleQuestions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: input
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer,
        data: response.data.data,
        visualization: response.data.visualization,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please make sure the backend server is running.',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSampleQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Business Intelligence Chat</h1>
        <p className="text-muted-foreground">Ask questions about your business data</p>
      </div>

      {/* Sample Questions */}
      {messages.length === 0 && sampleQuestions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleSampleQuestion(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-lg px-4 py-2'
                  : 'w-full'
              }`}
            >
              {message.role === 'user' ? (
                <p>{message.content}</p>
              ) : (
                <div className="space-y-4">
                  <Card className="p-4">
                    <p className="text-sm">{message.content}</p>
                  </Card>

                  {message.data && message.data.length > 0 && (
                    <div>
                      {message.visualization === 'metric' ? (
                        <MetricCard data={message.data} />
                      ) : (
                        <DataTable data={message.data} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your data..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
