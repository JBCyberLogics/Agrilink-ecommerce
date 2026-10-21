/**
 * AI Agricultural Assistant — shared chat page for both farmer and buyer roles.
 *
 * A chat-style interface for agricultural and marketplace questions.
 * No AI backend is connected yet; messages are honest placeholders.
 */
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, MessageSquare, RotateCw, Send } from 'lucide-react'
import { aiAgriculturalAssistant } from '../../services/ai'

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    type: 'assistant',
    content:
      "Hello! I'm your Agrilink AI assistant. I can help with questions about produce, pricing, and marketplace trends. AI responses require backend integration — try asking a question to see the current status.",
  },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const panelRef = useRef(null)
  const scrollRef = useRef(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addUserMessage = (text) => {
    const id = `user-${Date.now()}`
    setMessages((prev) => [...prev, { id, type: 'user', content: text }])
    return id
  }

  const addAssistantMessage = (content) => {
    const id = `assistant-${Date.now()}`
    setMessages((prev) => [...prev, { id, type: 'assistant', content }])
    return id
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setError('')
    const userId = addUserMessage(text)
    setSubmitting(true)
    try {
      const response = await aiAgriculturalAssistant(text, messages)
      if (response.ok) {
        addAssistantMessage(response.data.content || response.data.message || 'No response available.')
      } else {
        addAssistantMessage(response.error || 'Could not get a response.')
      }
    } catch (err) {
      addAssistantMessage(err?.message || 'Could not get a response.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-farmer-line bg-white px-6 py-4">
        <h1 className="font-display text-[15px] font-semibold text-farmer-ink">
          <MessageSquare size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
          AI Agricultural Assistant
        </h1>
        <p className="text-xs text-farmer-muted mt-0.5">
          Ask about produce, pricing, trends, or marketplace questions.
        </p>
      </header>

      <main className="flex-1 overflow-y-auto p-6 sm:p-8" ref={scrollRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 ${
                m.type === 'user'
                  ? 'bg-farmer-primary text-white'
                  : 'bg-white border border-farmer-line text-farmer-ink'
              }`}
            >
              <p className="text-sm leading-relaxed">{m.content}</p>
              {m.type === 'assistant' && (
                <p className="mt-1 text-[10px] text-farmer-muted">
                  AI response — server-generated
                </p>
              )}
            </div>
          </div>
        ))}
        {submitting && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-2 rounded-lg bg-white border border-farmer-line p-4">
              <div className="h-3 w-3 rounded-full bg-farmer-primary animate-pulse" />
              <span className="text-xs text-farmer-muted">Assistant is thinking…</span>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-farmer-line bg-white p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="flex gap-3">
          <input
            id="assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about produce, pricing, or trends…"
            disabled={submitting}
            aria-label="Your question"
            className="flex-1 rounded-lg border bg-white px-4 py-3 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="h-11 w-11 rounded-lg bg-farmer-primary text-white flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-farmer-primary-hover"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </form>
        {error && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
            <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
        <p className="mt-3 text-[11px] text-farmer-muted leading-relaxed">
          AI responses require backend integration. Until an AI service is connected,
          responses will show the service status rather than generated content.
        </p>
      </footer>
    </div>
  )
}
