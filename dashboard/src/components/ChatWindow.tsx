'use client'

import { useEffect, useRef, useState } from 'react'
import { IMessage, IOrderItem, BACKEND_URL, fetchMessages, sendReply, markRead, extractOrder } from '@/lib/api'
import { getSocket } from '@/lib/socket'

const BACKEND = BACKEND_URL

interface Props {
  conversationId: string
  clientId: string
  clientName: string
  onExtractOrder: (msg: IMessage, items: IOrderItem[]) => void
}

function MessageBubble({
  msg, onExtract
}: {
  msg: IMessage
  onExtract: (msg: IMessage) => void
}) {
  const isAdmin = msg.sender === 'admin'
  const canExtract = msg.sender === 'client' && (msg.type === 'text' || msg.type === 'photo')

  const content = () => {
    switch (msg.type) {
      case 'text':
        return <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
      case 'photo':
        return (
          <div className="space-y-1">
            <img
              src={`${BACKEND}${msg.fileUrl}`}
              alt="photo"
              className="max-w-[260px] rounded-xl"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {msg.caption && <p className="text-sm">{msg.caption}</p>}
          </div>
        )
      case 'voice':
      case 'audio':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎙</span>
              <audio controls src={`${BACKEND}${msg.fileUrl}`} className="h-8" style={{ maxWidth: 220 }} />
            </div>
            {msg.duration && <p className="text-xs opacity-60">{msg.duration}s</p>}
          </div>
        )
      case 'video':
        return (
          <div className="space-y-1">
            <video controls src={`${BACKEND}${msg.fileUrl}`} className="max-w-[260px] rounded-xl" />
            {msg.caption && <p className="text-sm">{msg.caption}</p>}
          </div>
        )
      case 'document':
        return (
          <a
            href={`${BACKEND}${msg.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm underline underline-offset-2"
          >
            <span>📄</span>
            <span>{msg.fileName || 'Document'}</span>
          </a>
        )
      default:
        return <p className="text-sm opacity-50">[{msg.type}]</p>
    }
  }

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div className="max-w-[72%] space-y-1">
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isAdmin
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'text-white rounded-bl-sm'
          }`}
          style={isAdmin ? {} : { background: '#1a2744', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          {content()}
          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-blue-200' : 'text-blue-400/50'}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {canExtract && (
          <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
            <button
              onClick={() => onExtract(msg)}
              className="text-[11px] text-blue-400/40 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
            >
              {msg.type === 'photo' ? '🔍 Анализировать и создать заказ' : '📋 Создать заказ'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatWindow({ conversationId, clientId, clientName, onExtractOrder }: Props) {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [extractingId, setExtractingId] = useState<string | null>(null)
  const [extractError, setExtractError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages(conversationId).then(setMessages)
    markRead(conversationId)

    const socket = getSocket()
    const handler = (data: { conversationId: string; message: IMessage }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => [...prev, data.message])
        markRead(conversationId)
      }
    }
    socket.on('new_message', handler)
    return () => { socket.off('new_message', handler) }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!replyText.trim() || sending) return
    setSending(true)
    try {
      await sendReply(conversationId, replyText.trim())
      setReplyText('')
    } finally {
      setSending(false)
    }
  }

  async function handleExtract(msg: IMessage) {
    setExtractError('')
    setExtractingId(msg._id)
    try {
      const result = await extractOrder(msg._id)
      if (result.error) {
        setExtractError(result.error)
        return
      }
      if (!result.items || result.items.length === 0) {
        setExtractError('No items found in this message. Try a more detailed message.')
        return
      }
      onExtractOrder(msg, result.items)
    } catch {
      setExtractError('AI extraction failed. Check that ANTHROPIC_API_KEY is set in backend/.env')
    } finally {
      setExtractingId(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-blue-950/60 flex items-center gap-3" style={{ background: '#0d1426' }}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {clientName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{clientName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            <span className="text-xs text-blue-400/50">Активная сессия</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ background: '#0a0f1e' }}>
        {messages.length === 0 && (
          <div className="text-center text-blue-400/30 text-sm mt-16">Сообщений пока нет.</div>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg._id}
            msg={msg}
            onExtract={handleExtract}
          />
        ))}

        {extractingId && (
          <div className="text-center text-blue-400 text-xs py-2 animate-pulse">
            🤖 AI анализирует сообщение...
          </div>
        )}
        {extractError && (
          <div className="text-center text-red-400 text-xs py-2 bg-red-900/20 rounded-lg px-3">
            {extractError}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div className="p-4 border-t border-blue-950/60" style={{ background: '#0d1426' }}>
        <div className="flex gap-2 items-end">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            placeholder="Написать ответ… (Enter для отправки)"
            rows={2}
            className="flex-1 text-white placeholder-blue-400/30 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-blue-500/50 transition"
            style={{ background: '#1a2744', border: '1px solid rgba(59,130,246,0.15)' }}
          />
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || sending}
            className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all h-[58px] shadow-lg shadow-blue-900/30"
          >
            {sending ? '...' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  )
}
