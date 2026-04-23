'use client'

import { useEffect, useState } from 'react'
import { BACKEND_URL } from '@/lib/api'
import Link from 'next/link'

interface Product {
  _id: string
  name: string
  brand: string
  description: string
  price: number
  category: string
  emoji: string
  bg: string
  color: string
  stock: number
  isActive: boolean
}

const EMPTY: Omit<Product, '_id'> = {
  name: '', brand: '', description: '', price: 0,
  category: 'Power Tools', emoji: '🔧', bg: '#1e293b', color: '#3b82f6',
  stock: 100, isActive: true
}

const CATEGORIES = ['Power Tools', 'Hand Tools', 'Safety & PPE', 'Fasteners']

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const r = await fetch(`${BACKEND_URL}/api/products?limit=200`)
      const d = await r.json()
      setProducts(d.products ?? [])
    } catch { setError('Failed to load products') }
    finally { setLoading(false) }
  }

  async function save() {
    if (!editProduct) return
    setSaving(true)
    setError('')
    try {
      const url = isNew
        ? `${BACKEND_URL}/api/products`
        : `${BACKEND_URL}/api/products/${editProduct._id}`
      const r = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct)
      })
      if (!r.ok) throw new Error(await r.text())
      setEditProduct(null)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally { setSaving(false) }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`${BACKEND_URL}/api/products/${id}`, { method: 'DELETE' })
      load()
    } catch { setError('Delete failed') }
  }

  async function toggleActive(p: Product) {
    await fetch(`${BACKEND_URL}/api/products/${p._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive })
    })
    load()
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <h1 className="text-lg font-bold">Products</h1>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{products.length}</span>
        </div>
        <button
          onClick={() => { setIsNew(true); setEditProduct({ ...EMPTY }) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex gap-3 flex-wrap items-center border-b border-slate-800">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, brand..."
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 w-64"
        />
        <div className="flex gap-2">
          {['All', ...CATEGORIES].map(c => (
            <button key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="px-6 pt-6 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="px-6 pt-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/40 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                             style={{ background: p.bg }}>{p.emoji}</div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <p className="text-xs" style={{ color: p.color }}>{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{p.category}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-blue-400">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-300">{p.stock}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
                        }`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setIsNew(false); setEditProduct({ ...p }) }}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => deleteProduct(p._id)}
                          className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-sm">No products found</div>
            )}
          </div>
        </div>
      )}

      {/* Edit / Create modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-bold text-white">{isNew ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setEditProduct(null)} className="text-slate-500 hover:text-white text-xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Brand', key: 'brand', type: 'text' },
                { label: 'Price', key: 'price', type: 'number' },
                { label: 'Stock', key: 'stock', type: 'number' },
                { label: 'Emoji', key: 'emoji', type: 'text' },
                { label: 'Background color (hex)', key: 'bg', type: 'text' },
                { label: 'Accent color (hex)', key: 'color', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editProduct as any)[key] ?? ''}
                    onChange={e => setEditProduct(prev => ({ ...prev, [key]: type === 'number' ? +e.target.value : e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={editProduct.category ?? CATEGORIES[0]}
                  onChange={e => setEditProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editProduct.description ?? ''}
                  onChange={e => setEditProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProduct.isActive ?? true}
                  onChange={e => setEditProduct(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-300">Active (visible in Mini App)</span>
              </label>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditProduct(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-3 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors">
                  {saving ? 'Saving...' : isNew ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
