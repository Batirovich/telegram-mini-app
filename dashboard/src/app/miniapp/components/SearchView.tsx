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
    <div className="flex flex-col pb-24">
      {/* Search header */}
      <div className="sticky top-0 z-10 bg-[#111111]/95 backdrop-blur-md px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
          <span className="text-white/40 text-base">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, brands..."
            className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/30 hover:text-white text-lg">×</button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-slate-400 text-sm">No results for "{query}"</p>
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-16 space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-slate-400 text-sm">Start typing to search</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-xs text-slate-500 mb-3">{results.length} results for "{query}"</p>
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
