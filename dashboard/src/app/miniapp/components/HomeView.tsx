'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'
import { IProduct } from '../types'
import { t } from '../i18n'
import ProductCard from './ProductCard'

interface Props {
  onOpenProduct: (p: IProduct) => void
  onGoSearch: () => void
}

const CAT_EMOJI: Record<string, string> = {
  'All': '🛍️', 'Power Tools': '⚡', 'Hand Tools': '🔧',
  'Safety & PPE': '🦺', 'Fasteners': '🔩',
}

export default function HomeView({ onOpenProduct, onGoSearch }: Props) {
  const [categories, setCategories] = useState<string[]>([])
  const [products, setProducts] = useState<IProduct[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/products/categories`)
      .then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const q = activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''
    fetch(`${BACKEND_URL}/api/products${q}`)
      .then(r => r.json()).then(d => setProducts(d.products ?? []))
      .catch(() => setProducts([])).finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md px-4 pt-4 pb-3"
           style={{ background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">UGO</h1>
            <p className="text-xs" style={{ color: 'rgba(96,165,250,0.5)' }}>{t.store_subtitle}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
               style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}>
            🏗️
          </div>
        </div>
        <button onClick={onGoSearch}
          className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 transition-all active:scale-[0.98]"
          style={{ background: '#1a2744', border: '1px solid rgba(59,130,246,0.18)' }}>
          <Search size={16} style={{ color: 'rgba(96,165,250,0.4)' }} />
          <span className="text-sm" style={{ color: 'rgba(96,165,250,0.4)' }}>{t.search_placeholder}</span>
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl p-5 relative overflow-hidden shadow-xl"
             style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6,#6366f1)', boxShadow: '0 8px 32px rgba(59,130,246,0.3)' }}>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-15">🔨</div>
          <p className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: 'rgba(147,197,253,0.9)' }}>{t.hero_label}</p>
          <h2 className="text-xl font-bold text-white leading-tight">{t.hero_title}</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(191,219,254,0.8)' }}>{t.hero_sub}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.96]"
              style={activeCategory === cat
                ? { background: '#3b82f6', color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }
                : { background: '#1a2744', color: 'rgba(96,165,250,0.6)', border: '1px solid rgba(59,130,246,0.15)' }
              }>
              <span>{CAT_EMOJI[cat] ?? '📦'}</span>
              {cat === 'All' ? t.cat_all : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pt-4 pb-28">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl h-52 animate-pulse"
                   style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-sm" style={{ color: 'rgba(96,165,250,0.3)' }}>{t.no_products}</div>
        ) : (
          <>
            <p className="text-xs mb-3" style={{ color: 'rgba(96,165,250,0.4)' }}>{t.products_count(products.length)}</p>
            <div className="grid grid-cols-2 gap-3">
              {products.map(p => <ProductCard key={p._id} product={p} onOpen={onOpenProduct} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
