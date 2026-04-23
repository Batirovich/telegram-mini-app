'use client'

import { useEffect, useState, useRef } from 'react'
import { BACKEND_URL } from '@/lib/api'
import { IProduct } from '../types'
import ProductCard from './ProductCard'

interface Props {
  onOpenProduct: (p: IProduct) => void
  onGoSearch: () => void
}

export default function HomeView({ onOpenProduct, onGoSearch }: Props) {
  const [categories, setCategories] = useState<string[]>([])
  const [products, setProducts] = useState<IProduct[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/products/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories(['All']))
  }, [])

  useEffect(() => {
    setLoading(true)
    const q = activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''
    fetch(`${BACKEND_URL}/api/products${q}`)
      .then(r => r.json())
      .then(d => setProducts(d.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur px-4 pt-4 pb-3 space-y-3 border-b border-slate-700/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Catalog</h1>
            <p className="text-xs text-slate-400">{products.length} products</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg">🏪</div>
        </div>

        {/* Search bar tap target */}
        <button onClick={onGoSearch}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-3 text-left">
          <span className="text-slate-500 text-base">🔍</span>
          <span className="text-slate-500 text-sm">Search products, brands...</span>
        </button>
      </div>

      {/* Category tabs */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="px-4 pt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No products found</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => (
              <ProductCard key={p._id} product={p} onOpen={onOpenProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
