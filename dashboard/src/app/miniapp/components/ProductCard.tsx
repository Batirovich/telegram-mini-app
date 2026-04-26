'use client'

import { IProduct } from '../types'
import { useCart } from '../hooks/useCart'
import { Plus, Minus } from 'lucide-react'

const CAT_GRADIENT: Record<string, string> = {
  'Power Tools':  'from-orange-500 to-red-500',
  'Hand Tools':   'from-blue-500 to-indigo-600',
  'Safety & PPE': 'from-emerald-500 to-teal-600',
  'Fasteners':    'from-violet-500 to-purple-600',
}

const CAT_EMOJI: Record<string, string> = {
  'Power Tools':  '⚡',
  'Hand Tools':   '🔧',
  'Safety & PPE': '🦺',
  'Fasteners':    '🔩',
}

interface Props {
  product: IProduct
  onOpen: (product: IProduct) => void
}

export default function ProductCard({ product, onOpen }: Props) {
  const { qty, add, adjust } = useCart()
  const q = qty(product._id)
  const gradient = CAT_GRADIENT[product.category] ?? 'from-slate-600 to-slate-700'
  const catEmoji = CAT_EMOJI[product.category] ?? '📦'

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    add({ _id: product._id, name: product.name, brand: product.brand, price: product.price, emoji: product.emoji, bg: product.bg, color: product.color })
  }
  function handleAdjust(e: React.MouseEvent, delta: number) {
    e.stopPropagation()
    adjust(product._id, delta)
  }

  return (
    <button onClick={() => onOpen(product)}
      className="flex flex-col rounded-2xl overflow-hidden bg-[#1c1c1e] active:scale-[0.97] transition-transform text-left w-full shadow-lg">

      {/* Thumbnail */}
      <div className={`w-full bg-gradient-to-br ${gradient} flex items-center justify-center py-6 relative`}>
        <span className="text-5xl drop-shadow-lg">{product.emoji || catEmoji}</span>
        <span className="absolute top-2 right-2 text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
          {product.brand}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs font-semibold text-white leading-snug line-clamp-2 min-h-[32px]">
          {product.name}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-base font-bold text-white">${product.price.toFixed(2)}</span>

          {q === 0 ? (
            <button onClick={handleAdd}
              className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center active:bg-blue-700 transition-colors flex-shrink-0">
              <Plus size={16} color="white" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button onClick={e => handleAdjust(e, -1)}
                className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
                <Minus size={13} color="white" />
              </button>
              <span className="text-sm font-bold text-white w-4 text-center">{q}</span>
              <button onClick={e => handleAdjust(e, 1)}
                className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Plus size={13} color="white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
