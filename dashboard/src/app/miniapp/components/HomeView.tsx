'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'
import { IProduct } from '../types'
import ProductCard from './ProductCard'

interface Props {
  onOpenProduct: (p: IProduct) => void
  onGoSearch: () => void
}

const CAT_EMOJI: Record<string, string> = {
  'All':          '🛍️',
  'Power Tools':  '⚡',
  'Hand Tools':   '🔧',
  'Safety & PPE': '🦺',
  'Fasteners':    '🔩',
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
      .catch(() => {})
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
    <div className="flex flex-col bg-[#111111] min-h-full">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#111111]/95 backdrop-blur-md px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ProTools Store</h1>
            <p className="text-xs text-white/40">Construction & Power Tools</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-xl shadow-lg shadow-orange-900/40">
            🏗️
          </div>
        </div>

        {/* Search bar */}
        <button onClick={onGoSearch}
          className="w-full bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search size={16} className="text-white/40" />
          <span className="text-white/40 text-sm">Search tools, brands...</span>
        </button>
      </div>

      {/* Hero banner */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-5 relative overflow-hidden shadow-xl shadow-orange-900/30">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-20">🔨</div>
          <p className="text-xs font-semibold text-orange-200 mb-1 uppercase tracking-widest">Professional Grade</p>
          <h2 className="text-xl font-bold text-white leading-tight">Tools Built<br/>to Last</h2>
          <p className="text-sm text-orange-100/80 mt-1">Top brands · Fast delivery</p>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', ...categories].map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/30'
                  : 'bg-white/8 text-white/50 border border-white/8'
              }`}>
              <span>{CAT_EMOJI[cat] ?? '📦'}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="px-4 pt-4 pb-28">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-white/30 text-sm">No products found</div>
        ) : (
          <>
            <p className="text-xs text-white/30 mb-3">{products.length} products</p>
            <div className="grid grid-cols-2 gap-3">
              {products.map(p => (
                <ProductCard key={p._id} product={p} onOpen={onOpenProduct} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
