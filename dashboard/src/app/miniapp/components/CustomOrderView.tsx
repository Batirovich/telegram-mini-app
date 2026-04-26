'use client'

import { useState, useRef } from 'react'
import { Send, Camera, Type, CheckCircle, X } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'
import { AuthUser } from '../hooks/useAuth'

interface Props {
  user: AuthUser | null
}

export default function CustomOrderView({ user }: Props) {
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImage(URL.createObjectURL(file))
    setMode('image')
    setSent(false)
    setError('')
  }

  function clearImage() {
    setImage(null)
    setImageFile(null)
    setMode('text')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSend() {
    if (!text.trim() && !imageFile) return
    if (loading) return
    if (!user?.telegramId) { setError('Необходима авторизация через Telegram.'); return }

    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('telegramId', String(user.telegramId))
      if (imageFile) formData.append('image', imageFile)
      if (text.trim()) formData.append('text', text.trim())

      const res = await fetch(`${BACKEND_URL}/api/messages/from-miniapp`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error()
      setSent(true)
      setText('')
      clearImage()
    } catch {
      setError('Не удалось отправить. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  const canSend = (text.trim().length > 0 || !!imageFile) && !loading

  return (
    <div className="flex flex-col min-h-full pb-28" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-white">Запрос заказа</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(96,165,250,0.5)' }}>
          Напишите список или отправьте фото — менеджер пришлёт счёт
        </p>
      </div>

      {/* Mode toggle */}
      <div className="px-4 mb-4">
        <div className="flex rounded-2xl p-1" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <button onClick={() => setMode('text')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={mode === 'text' ? { background: '#3b82f6', color: '#fff' } : { color: 'rgba(148,163,184,0.5)' }}>
            <Type size={15} /> Текст
          </button>
          <button onClick={() => { fileRef.current?.click() }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={mode === 'image' ? { background: '#3b82f6', color: '#fff' } : { color: 'rgba(148,163,184,0.5)' }}>
            <Camera size={15} /> Фото
          </button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleImagePick} />

      <div className="px-4 space-y-4">
        {/* Hint */}
        <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(96,165,250,0.7)' }}>
            💡 Пример: <span style={{ color: '#60a5fa' }}>«Кирпич 1000 шт, цемент 10 мешков, арматура 6мм 5 тонн»</span>
          </p>
        </div>

        {/* Image preview */}
        {image && (
          <div className="relative rounded-2xl overflow-hidden">
            <img src={image} alt="order" className="w-full max-h-56 object-cover rounded-2xl" />
            <button onClick={clearImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Text input */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={imageFile ? 'Добавьте комментарий к фото (необязательно)...' : 'Введите список товаров...'}
          rows={imageFile ? 3 : 6}
          className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none transition"
          style={{
            background: '#1a2744',
            border: '1px solid rgba(59,130,246,0.18)',
            color: '#fff',
          }}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {sent && (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
               style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-sm font-medium">Отправлено менеджеру! Ожидайте ответа в чате.</p>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full text-white rounded-2xl py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          style={{
            background: canSend ? '#3b82f6' : 'rgba(59,130,246,0.3)',
            boxShadow: canSend ? '0 8px 24px rgba(59,130,246,0.25)' : 'none',
          }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Отправка...</>
            : <><Send size={16} /> Отправить менеджеру</>
          }
        </button>
      </div>
    </div>
  )
}
