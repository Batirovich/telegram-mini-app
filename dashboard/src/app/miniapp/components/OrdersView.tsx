'use client'

import { useEffect, useState } from 'react'
import { BACKEND_URL } from '@/lib/api'
import { AuthUser } from '../hooks/useAuth'

interface OrderItem { item: string; quantity: number; price: number }
interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:               { label: 'Pending',            color: '#94a3b8', bg: '#94a3b820' },
  awaiting_confirmation: { label: 'Awaiting Confirm',   color: '#f59e0b', bg: '#f59e0b20' },
  confirmed:             { label: 'Confirmed ✅',        color: '#22c55e', bg: '#22c55e20' },
  cancelled:             { label: 'Cancelled',           color: '#ef4444', bg: '#ef444420' },
  processing:            { label: 'Processing',          color: '#3b82f6', bg: '#3b82f620' },
  delivered:             { label: 'Delivered 🎉',        color: '#10b981', bg: '#10b98120' },
}

interface Props { user: AuthUser | null }

export default function OrdersView({ user }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.telegramId) { setLoading(false); return }
    fetch(`${BACKEND_URL}/api/auth/orders/${user.telegramId}`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user])

  if (!user?.registered) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-8">
        <div className="text-center space-y-3">
          <div className="text-5xl">📦</div>
          <h2 className="text-lg font-bold text-white">No Account Yet</h2>
          <p className="text-slate-400 text-sm">Start the bot with /start to register and see your orders here.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-800 rounded-2xl h-24 animate-pulse" />)}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-8">
        <div className="text-center space-y-3">
          <div className="text-5xl">📦</div>
          <h2 className="text-lg font-bold text-white">No Orders Yet</h2>
          <p className="text-slate-400 text-sm">Your order history will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-white">My Orders</h1>
        <p className="text-xs text-slate-400">{orders.length} orders</p>
      </div>

      <div className="px-4 space-y-3">
        {orders.map(order => {
          const s = STATUS[order.status] ?? STATUS.pending
          const isOpen = expanded === order._id
          return (
            <button key={order._id} onClick={() => setExpanded(isOpen ? null : order._id)}
              className="w-full bg-slate-800 rounded-2xl p-4 border border-slate-700/30 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{order.items.length} items • ${order.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ color: s.color, background: s.bg }}>{s.label}</span>
                  <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-300">{item.item} × {item.quantity}</span>
                      <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
