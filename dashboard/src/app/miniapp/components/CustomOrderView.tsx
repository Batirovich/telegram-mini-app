'use client'

import { useState, useRef } from 'react'
import { Camera, Type, Plus, ShoppingCart } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'
import { useCart } from '../hooks/useCart'
import { AuthUser } from '../hooks/useAuth'
import { t } from '../i18n'

interface ExtractedItem {
  name: string
  quantity: number
  price: number
  found: boolean
  productId?: string
}

interface Props {
  user: AuthUser | null
}

export default function CustomOrderView({ user }: Props) {
  const { add } = useCart()
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ExtractedItem[]>([])
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImage(URL.createObjectURL(file))
    setMode('image')
  }

  async function handleAnalyze() {
    if (!text.trim() && !imageFile) return
    setLoading(true)
    setError('')
    setItems([])
    setAdded(false)

    try {
      const formData = new FormData()
      if (imageFile) formData.append('image', imageFile)
      if (text.trim()) formData.append('text', text)

      const res = await fetch(`${BACKEND_URL}/api/orders/ai-extract`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setItems(data.items ?? [])
      if (!data.items?.length) setError(t.custom_not_found)
    } catch {
      setError(t.custom_not_found)
    } finally {
      setLoading(false)
    }
  }

  function handleAddAll() {
    items.forEach(item => {
      add({
        _id: item.productId || item.name,
        name: item.name,
        brand: '',
        price: item.price,
        emoji: '📦',
        bg: '#1e293b',
        color: '#3b82f6',
      })
    })
    setAdded(true)
  }

  return (
    <div className="flex flex-col bg-[#111111] min-h-full pb-28">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-white">{t.custom_order_title}</h1>
        <p className="text-sm text-white/40 mt-1">{t.custom_order_sub}</p>
      </div>

      {/* Mode toggle */}
      <div className="px-4 mb-4">
        <div className="flex bg-white/5 rounded-2xl p-1">
          <button onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'text' ? 'bg-orange-500 text-white' : 'text-white/40'
            }`}>
            <Type size={16} /> Текст
          </button>
          <button onClick={() => { setMode('image'); fileRef.current?.click() }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'image' ? 'bg-orange-500 text-white' : 'text-white/40'
            }`}>
            <Camera size={16} /> Фото
          </button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleImagePick} />

      <div className="px-4 space-y-4">
        {/* Image preview */}
        {image && (
          <div className="relative rounded-2xl overflow-hidden">
            <img src={image} alt="order" className="w-full max-h-56 object-cover rounded-2xl" />
            <button onClick={() => { setImage(null); setImageFile(null); setMode('text') }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white text-lg">
              ×
            </button>
          </div>
        )}

        {/* Text input */}
        {mode === 'text' && (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t.custom_type_placeholder}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-orange-500/60 resize-none"
          />
        )}

        {/* Analyze button */}
        <button onClick={handleAnalyze}
          disabled={loading || (!text.trim() && !imageFile)}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-40 text-white rounded-2xl py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.custom_analyzing}</>
          ) : (
            <>{t.custom_analyze}</>
          )}
        </button>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Extracted items */}
        {items.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-wider">Найденные товары</p>
            {items.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.quantity} шт × ${item.price.toFixed(2)}</p>
                </div>
                <p className="text-sm font-bold text-orange-400">${(item.quantity * item.price).toFixed(2)}</p>
              </div>
            ))}

            {added ? (
              <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 text-sm font-semibold">
                <ShoppingCart size={16} /> Добавлено в корзину
              </div>
            ) : (
              <button onClick={handleAddAll}
                className="w-full bg-white/8 border border-white/10 hover:bg-white/12 text-white rounded-2xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> {t.custom_add_all}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
