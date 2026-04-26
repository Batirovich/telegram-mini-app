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
  pending:               { label: 'Черновик',        color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  awaiting_confirmation: { label: 'Ожидает ответа',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  confirmed:             { label: 'Подтверждён ✅',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  cancelled:             { label: 'Отменён',          color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  processing:            { label: 'В обработке',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  delivered:             { label: 'Доставлен 🎉',     color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
}

const S = {
  bg: '#0a0f1e',
  card: '#0d1426',
  border: 'rgba(59,130,246,0.15)',
  muted: 'rgba(96,165,250,0.45)',
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
          <h2 className="text-lg font-bold text-white">Нет аккаунта</h2>
          <p className="text-sm" style={{ color: S.muted }}>Завершите регистрацию, чтобы видеть заказы.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 space-y-3" style={{ background: S.bg, minHeight: '100%' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl h-24 animate-pulse"
               style={{ background: 'rgba(59,130,246,0.06)', border: `1px solid ${S.border}` }} />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-8">
        <div className="text-center space-y-3">
          <div className="text-5xl">📦</div>
          <h2 className="text-lg font-bold text-white">Заказов пока нет</h2>
          <p className="text-sm" style={{ color: S.muted }}>История заказов появится здесь.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-24" style={{ background: S.bg, minHeight: '100%' }}>
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-white">Мои заказы</h1>
        <p className="text-xs" style={{ color: S.muted }}>{orders.length} заказов</p>
      </div>

      <div className="px-4 space-y-3">
        {orders.map(order => {
          const s = STATUS[order.status] ?? STATUS.pending
          const isOpen = expanded === order._id
          return (
            <button key={order._id} onClick={() => setExpanded(isOpen ? null : order._id)}
              className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.99]"
              style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: S.muted }}>#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {order.items.length} позиций · ${order.total.toFixed(2)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: S.muted }}>
                    {new Date(order.createdAt).toLocaleDateString('ru')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ color: s.color, background: s.bg }}>{s.label}</span>
                  <span className="text-xs" style={{ color: S.muted }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 pt-3 space-y-1.5"
                     style={{ borderTop: `1px solid rgba(59,130,246,0.12)` }}>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-white/70">{item.item} × {item.quantity}</span>
                      <span style={{ color: S.muted }}>${(item.price * item.quantity).toFixed(2)}</span>
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
