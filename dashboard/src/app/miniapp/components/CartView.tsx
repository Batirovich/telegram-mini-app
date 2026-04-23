'use client'

import { useState } from 'react'
import { useCart } from '../hooks/useCart'
import { AuthUser } from '../hooks/useAuth'
import { BACKEND_URL } from '@/lib/api'

interface Props {
  user: AuthUser | null
}

export default function CartView({ user }: Props) {
  const { items, adjust, remove, clear, total, count } = useCart()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleOrder() {
    if (!items.length) return
    setSending(true)
    setError('')
    try {
      const tg = (window as any).Telegram?.WebApp
      const payload = { items: items.map(i => ({ item: i.name, quantity: i.quantity, price: i.price })) }

      if (tg?.sendData) {
        tg.sendData(JSON.stringify(payload))
        clear()
        setSent(true)
      } else {
        // Browser fallback — post directly
        const res = await fetch(`${BACKEND_URL}/api/orders/miniapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, telegramId: user?.telegramId })
        })
        if (res.ok) { clear(); setSent(true) }
        else setError('Failed to send order. Please try again.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4 px-8">
          <div className="text-6xl">✅</div>
          <h2 className="text-xl font-bold text-white">Order Sent!</h2>
          <p className="text-slate-400 text-sm">Our team will review and send you a confirmation in the chat.</p>
          <button onClick={() => setSent(false)}
            className="mt-4 bg-slate-800 text-white rounded-xl px-6 py-2.5 text-sm">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3 px-8">
          <div className="text-6xl">🛒</div>
          <h2 className="text-lg font-bold text-white">Cart is empty</h2>
          <p className="text-slate-400 text-sm">Browse the catalog and add items to your cart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-36">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-white">Your Cart</h1>
        <p className="text-xs text-slate-400">{count} items</p>
      </div>

      <div className="px-4 space-y-3">
        {items.map(item => (
          <div key={item._id} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3 border border-slate-700/30">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                 style={{ background: item.bg }}>
              {item.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold mb-0.5" style={{ color: item.color }}>{item.brand}</p>
              <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.name}</p>
              <p className="text-sm font-bold text-blue-400 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button onClick={() => remove(item._id)} className="text-slate-600 hover:text-red-400 text-xs transition-colors">Remove</button>
              <div className="flex items-center gap-2">
                <button onClick={() => adjust(item._id, -1)}
                  className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center">−</button>
                <span className="text-sm font-bold text-white w-5 text-center">{item.quantity}</span>
                <button onClick={() => adjust(item._id, 1)}
                  className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700/60 px-4 pt-4 pb-6 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400">{count} items</p>
            <p className="text-xl font-bold text-white">${total.toFixed(2)}</p>
          </div>
          {!user?.registered && (
            <p className="text-xs text-amber-400 text-right max-w-[160px]">Start the bot first to enable ordering</p>
          )}
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button onClick={handleOrder} disabled={sending || !user?.registered}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl py-4 font-semibold text-sm transition-all">
          {sending ? 'Sending...' : '📤 Place Order'}
        </button>
      </div>
    </div>
  )
}
