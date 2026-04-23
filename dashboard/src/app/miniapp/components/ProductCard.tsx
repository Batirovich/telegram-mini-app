'use client'

import { IProduct } from '../types'
import { useCart } from '../hooks/useCart'
import { Plus, Minus } from 'lucide-react'
import ProductIcon from './ProductIcon'

interface Props {
  product: IProduct
  onOpen: (product: IProduct) => void
}

export default function ProductCard({ product, onOpen }: Props) {
  const { qty, add, adjust } = useCart()
  const q = qty(product._id)

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    add({
      _id: product._id, name: product.name, brand: product.brand,
      price: product.price, emoji: product.emoji, bg: product.bg, color: product.color
    })
  }

  function handleAdjust(e: React.MouseEvent, delta: number) {
    e.stopPropagation()
    adjust(product._id, delta)
  }

  return (
    <button onClick={() => onOpen(product)}
      className="bg-slate-800 rounded-2xl p-3 flex flex-col border border-slate-700/30 active:scale-[0.97] transition-transform text-left w-full">

      {/* Thumbnail */}
      <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-3 border border-white/5 overflow-hidden"
           style={{ background: product.bg }}>
        <ProductIcon category={product.category} color={product.color} size={52} />
      </div>

      {/* Brand */}
      <span className="text-[10px] font-bold mb-1" style={{ color: product.color }}>
        {product.brand}
      </span>

      {/* Name */}
      <p className="text-xs font-semibold text-white leading-tight line-clamp-2 flex-1 mb-2">
        {product.name}
      </p>

      {/* Price */}
      <p className="text-sm font-bold text-white mb-2">${product.price.toFixed(2)}</p>

      {/* Cart control */}
      {q === 0 ? (
        <button onClick={handleAdd}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1">
          <Plus size={12} />
          Add to Cart
        </button>
      ) : (
        <div className="flex items-center justify-between bg-slate-700 rounded-xl px-2 py-1.5">
          <button onClick={e => handleAdjust(e, -1)}
            className="w-7 h-7 flex items-center justify-center text-white rounded-lg active:bg-slate-600">
            <Minus size={14} />
          </button>
          <span className="text-sm font-bold text-white">{q}</span>
          <button onClick={e => handleAdjust(e, 1)}
            className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-lg active:bg-blue-700">
            <Plus size={14} />
          </button>
        </div>
      )}
    </button>
  )
}
