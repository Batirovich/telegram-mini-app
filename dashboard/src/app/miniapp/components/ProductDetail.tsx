'use client'

import { useEffect } from 'react'
import { IProduct } from '../types'
import { useCart } from '../hooks/useCart'
import ProductIcon from './ProductIcon'
import { Plus, Minus, ChevronLeft } from 'lucide-react'

interface Props {
  product: IProduct
  onBack: () => void
}

const S = {
  bg: '#0a0f1e',
  card: '#0d1426',
  surface: '#1a2744',
  border: 'rgba(59,130,246,0.15)',
  muted: 'rgba(96,165,250,0.45)',
  blue: '#3b82f6',
}

export default function ProductDetail({ product, onBack }: Props) {
  const { qty, add, adjust } = useCart()
  const q = qty(product._id)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.BackButton.show()
      tg.BackButton.onClick(onBack)
      return () => tg.BackButton.hide()
    }
  }, [onBack])

  return (
    <div className="flex flex-col min-h-screen pb-32" style={{ background: S.bg }}>
      {/* Back bar */}
      <div className="sticky top-0 z-10 backdrop-blur px-4 py-3 flex items-center gap-3"
           style={{ background: 'rgba(10,15,30,0.95)', borderBottom: `1px solid ${S.border}` }}>
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
          style={{ background: S.surface, border: `1px solid ${S.border}` }}>
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-white truncate">{product.name}</span>
      </div>

      {/* Hero thumbnail */}
      <div className="mx-4 mt-4 rounded-3xl flex items-center justify-center py-14"
           style={{ background: product.bg, border: `1px solid rgba(255,255,255,0.05)` }}>
        <ProductIcon category={product.category} color={product.color} size={96} />
      </div>

      {/* Info */}
      <div className="px-4 pt-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs font-bold px-2 py-1 rounded-lg border"
                  style={{ color: product.color, borderColor: `${product.color}40`, background: product.bg }}>
              {product.brand}
            </span>
            <h2 className="text-lg font-bold text-white mt-2 leading-snug">{product.name}</h2>
          </div>
          <span className="text-xl font-bold flex-shrink-0" style={{ color: S.blue }}>${product.price.toFixed(2)}</span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: S.muted }}>{product.description}</p>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ В наличии</span>
          <span className="px-2 py-1 rounded-lg" style={{ background: S.surface, color: S.muted }}>{product.category}</span>
        </div>
      </div>

      {/* Add to cart */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4"
           style={{ background: `linear-gradient(to top, ${S.bg} 60%, transparent)`, paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        {q === 0 ? (
          <button
            onClick={() => add({ _id: product._id, name: product.name, brand: product.brand, price: product.price, emoji: product.emoji, bg: product.bg, color: product.color })}
            className="w-full text-white rounded-2xl py-4 font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: S.blue, boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>
            <Plus size={16} /> Добавить в корзину — ${product.price.toFixed(2)}
          </button>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl px-6 py-3"
               style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <button onClick={() => adjust(product._id, -1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: S.surface }}>
              <Minus size={18} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-white font-bold">{q} в корзине</p>
              <p className="text-sm" style={{ color: S.blue }}>${(product.price * q).toFixed(2)}</p>
            </div>
            <button onClick={() => adjust(product._id, 1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: S.blue }}>
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
