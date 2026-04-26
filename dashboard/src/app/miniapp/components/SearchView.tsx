'use client'

import { useState, useEffect, useRef } from 'react'
import { BACKEND_URL } from '@/lib/api'
import { IProduct } from '../types'
import ProductCard from './ProductCard'

interface Props {
  onOpenProduct: (p: IProduct) => void
}

export default function SearchView({ onOpenProduct }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BACKEND_URL}/api/products?search=${encodeURIComponent(query)}`)
        const d = await res.json()
        setResults(d.products ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [query])

  return (
    <div className="flex flex-col pb-24" style={{ background: '#0a0f1e', minHeight: '100%' }}>
      {/* Search header */}
      <div className="sticky top-0 z-10 backdrop-blur-md px-4 pt-4 pb-3"
           style={{ background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
             style={{ background: '#1a2744', border: '1px solid rgba(59,130,246,0.18)' }}>
          <span className="text-base" style={{ color: 'rgba(96,165,250,0.4)' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск товаров, брендов..."
            className="flex-1 bg-transparent text-white text-sm outline-none"
            style={{ caretColor: '#3b82f6' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-lg" style={{ color: 'rgba(96,165,250,0.4)' }}>×</button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl h-52 animate-pulse"
                   style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }} />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-sm" style={{ color: 'rgba(96,165,250,0.4)' }}>Ничего не найдено по «{query}»</p>
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-16 space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-sm" style={{ color: 'rgba(96,165,250,0.4)' }}>Начните вводить для поиска</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-xs mb-3" style={{ color: 'rgba(96,165,250,0.4)' }}>{results.length} результатов по «{query}»</p>
            <div className="grid grid-cols-2 gap-3">
              {results.map(p => (
                <ProductCard key={p._id} product={p} onOpen={onOpenProduct} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
