'use client'

import { useEffect, useState } from 'react'

interface FeaturedItem {
  id: string
  name: string
  brand: string
  price: number
  emoji: string
  bg: string
  color: string
}

interface Category {
  id: string
  category: string
  emoji: string
  items: FeaturedItem[]
}

interface CartItem extends FeaturedItem {
  quantity: number
}

export default function MiniApp() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [sent, setSent] = useState(false)
  const [tgReady, setTgReady] = useState(false)

  useEffect(() => {
    // Use relative URL — works both locally and via ngrok
    fetch('/api/featured')
      .then(r => r.json())
      .then((data: Category[]) => {
        setCategories(data)
        if (data.length) setActiveCategory(data[0].id)
      })

    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      setTgReady(true)
    }
  }, [])

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg || !tgReady) return
    if (cart.length > 0) {
      tg.MainButton.color = '#2563eb'
      tg.MainButton.setText(`Place Order • ${cartTotal()}`)
      tg.MainButton.show()
    } else {
      tg.MainButton.hide()
    }
  }, [cart, tgReady])

  function cartTotal() {
    return '$' + cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)
  }
  function cartCount() {
    return cart.reduce((s, i) => s + i.quantity, 0)
  }
  function getQty(id: string) {
    return cart.find(c => c.id === id)?.quantity ?? 0
  }

  function addToCart(item: FeaturedItem) {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      return ex
        ? prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev, { ...item, quantity: 1 }]
    })
  }

  function adjustQty(id: string, delta: number) {
    setCart(prev =>
      prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c)
          .filter(c => c.quantity > 0)
    )
  }

  function handleSendOrder() {
    if (!cart.length) return
    const payload = { items: cart.map(c => ({ item: c.name, quantity: c.quantity, price: c.price })) }
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.sendData(JSON.stringify(payload))
      setSent(true)
    } else {
      alert(`Order ready (${cartCount()} items, ${cartTotal()})\n\nOpen inside Telegram to send.`)
    }
  }

  const activeItems = categories.find(c => c.id === activeCategory)?.items ?? []

  // ── Sent confirmation screen ──────────────────────────────────────────
  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-5xl mx-auto">✅</div>
          <h2 className="text-xl font-bold text-white">Order Sent!</h2>
          <p className="text-slate-400 text-sm">Our team will confirm your order in the chat shortly.</p>
        </div>
      </div>
    )
  }

  // ── Cart drawer ───────────────────────────────────────────────────────
  if (showCart) {
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    return (
      <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 z-10 bg-slate-900 px-4 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-bold text-white text-base">Your Cart</h2>
          <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto pb-36">
          {cart.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-10">Cart is empty</p>
          )}
          {cart.map(item => (
            <div key={item.id} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                   style={{ background: item.bg }}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                <p className="text-xs mt-0.5" style={{ color: item.color }}>{item.brand}</p>
                <p className="text-xs text-slate-400">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustQty(item.id, -1)}
                    className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-lg">−</button>
                  <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                  <button onClick={() => adjustQty(item.id, 1)}
                    className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 pt-4 pb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{cartCount()} items</span>
              <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
            </div>
            <button onClick={handleSendOrder}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl py-4 font-semibold text-sm transition-all">
              📤 Send Order to Chat
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Main shop ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen pb-28" suppressHydrationWarning>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/60 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">🛒 Featured Items</h1>
          <p className="text-[11px] text-slate-400">Construction & Power Tools</p>
        </div>
        <button onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl px-3.5 py-2 text-sm font-medium transition-colors">
          Cart
          {cartCount() > 0 ? (
            <span className="bg-white text-blue-700 text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount()}
            </span>
          ) : (
            <span className="text-base">🛒</span>
          )}
        </button>
      </div>

      {/* Category tabs */}
      <div className="px-4 pt-4 pb-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}>
              {cat.emoji} {cat.category}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="px-4 pt-3 space-y-3">
        {activeItems.map(item => {
          const qty = getQty(item.id)
          return (
            <div key={item.id}
              className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4 border border-slate-700/30 active:scale-[0.99] transition-transform">

              {/* Emoji thumbnail */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 border border-white/5"
                   style={{ background: item.bg }}>
                {item.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold mb-1" style={{ color: item.color }}>{item.brand}</p>
                <p className="text-sm font-semibold text-white leading-snug">{item.name}</p>
                <p className="text-base font-bold text-blue-400 mt-1">${item.price.toFixed(2)}</p>
              </div>

              {/* Add / Qty control */}
              <div className="flex-shrink-0">
                {qty === 0 ? (
                  <button onClick={() => addToCart(item)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">
                    Add
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustQty(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-xl">−</button>
                    <span className="text-sm font-bold text-white w-5 text-center">{qty}</span>
                    <button onClick={() => adjustQty(item.id, 1)}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xl">+</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating order button */}
      {cartCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
          <button onClick={() => setShowCart(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl py-4 font-semibold text-sm transition-all shadow-xl shadow-blue-900/50 flex items-center justify-center gap-3">
            <span>View Cart</span>
            <span className="bg-blue-500 rounded-xl px-3 py-1 text-xs font-bold">{cartCount()} items • {cartTotal()}</span>
          </button>
        </div>
      )}
    </div>
  )
}
