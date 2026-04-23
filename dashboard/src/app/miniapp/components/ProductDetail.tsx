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
    <div className="flex flex-col min-h-screen pb-32">
      {/* Custom back bar (for browser / fallback) */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur px-4 py-3 border-b border-slate-700/40 flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-white truncate">{product.name}</span>
      </div>

      {/* Hero thumbnail */}
      <div className="mx-4 mt-4 rounded-3xl flex items-center justify-center py-14 border border-white/5"
           style={{ background: product.bg }}>
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
          <span className="text-xl font-bold text-blue-400 flex-shrink-0">${product.price.toFixed(2)}</span>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">✓ In Stock</span>
          <span className="bg-slate-800 px-2 py-1 rounded-lg">{product.category}</span>
        </div>
      </div>

      {/* Add to cart — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent"
           style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        {q === 0 ? (
          <button
            onClick={() => add({ _id: product._id, name: product.name, brand: product.brand, price: product.price, emoji: product.emoji, bg: product.bg, color: product.color })}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl py-4 font-semibold text-sm transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2">
            <Plus size={16} /> Add to Cart — ${product.price.toFixed(2)}
          </button>
        ) : (
          <div className="flex items-center gap-4 bg-slate-800 rounded-2xl px-6 py-3 border border-slate-700">
            <button onClick={() => adjust(product._id, -1)}
              className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center">
              <Minus size={18} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-white font-bold">{q} in cart</p>
              <p className="text-blue-400 text-sm">${(product.price * q).toFixed(2)}</p>
            </div>
            <button onClick={() => adjust(product._id, 1)}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
