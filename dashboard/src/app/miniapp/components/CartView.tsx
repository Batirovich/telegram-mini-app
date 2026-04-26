'use client'

import { useState } from 'react'
import { useCart } from '../hooks/useCart'
import { AuthUser } from '../hooks/useAuth'
import { BACKEND_URL } from '@/lib/api'

interface Props {
  user: AuthUser | null
}

const S = {
  bg: '#0a0f1e',
  card: '#0d1426',
  surface: '#1a2744',
  border: 'rgba(59,130,246,0.15)',
  muted: 'rgba(96,165,250,0.45)',
  blue: '#3b82f6',
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
        const res = await fetch(`${BACKEND_URL}/api/orders/miniapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, telegramId: user?.telegramId })
        })
        if (res.ok) { clear(); setSent(true) }
        else setError('Не удалось отправить. Попробуйте ещё раз.')
      }
    } catch {
      setError('Ошибка соединения.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4 px-8">
          <div className="text-6xl">✅</div>
          <h2 className="text-xl font-bold text-white">Заказ отправлен!</h2>
          <p className="text-sm" style={{ color: S.muted }}>Менеджер проверит и пришлёт подтверждение в чат.</p>
          <button onClick={() => setSent(false)}
            className="mt-4 text-white rounded-xl px-6 py-2.5 text-sm"
            style={{ background: S.surface, border: `1px solid ${S.border}` }}>
            Продолжить покупки
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
          <h2 className="text-lg font-bold text-white">Корзина пуста</h2>
          <p className="text-sm" style={{ color: S.muted }}>Добавьте товары из каталога</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-40" style={{ background: S.bg, minHeight: '100%' }}>
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-white">Корзина</h1>
        <p className="text-xs" style={{ color: S.muted }}>{count} позиций</p>
      </div>

      <div className="px-4 space-y-3">
        {items.map(item => (
          <div key={item._id} className="rounded-2xl p-4 flex items-center gap-3"
               style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                 style={{ background: item.bg }}>
              {item.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold mb-0.5" style={{ color: item.color }}>{item.brand}</p>
              <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.name}</p>
              <p className="text-sm font-bold mt-1" style={{ color: S.blue }}>${(item.price * item.quantity).toFixed(2)}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button onClick={() => remove(item._id)} className="text-xs transition-colors"
                      style={{ color: 'rgba(96,165,250,0.35)' }}>
                Удалить
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => adjust(item._id, -1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ background: S.surface }}>−</button>
                <span className="text-sm font-bold text-white w-5 text-center">{item.quantity}</span>
                <button onClick={() => adjust(item._id, 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ background: S.blue }}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-6 space-y-3"
           style={{ background: '#0d1426', borderTop: `1px solid ${S.border}` }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs" style={{ color: S.muted }}>{count} позиций</p>
            <p className="text-xl font-bold text-white">${total.toFixed(2)}</p>
          </div>
          {!user?.registered && (
            <p className="text-xs text-right max-w-[160px]" style={{ color: '#fbbf24' }}>
              Завершите регистрацию для оформления заказа
            </p>
          )}
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button onClick={handleOrder} disabled={sending || !user?.registered}
          className="w-full text-white rounded-2xl py-4 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: S.blue, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
          {sending ? 'Отправка...' : '📤 Оформить заказ'}
        </button>
      </div>
    </div>
  )
}
