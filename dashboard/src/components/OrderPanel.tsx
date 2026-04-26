'use client'

import { useState } from 'react'
import { IOrderItem, IOrder, createOrder, updateOrder, sendOrderConfirmation } from '@/lib/api'

interface Props {
  conversationId: string
  clientId: string
  sourceMessageId: string
  initialItems: IOrderItem[]
  existingOrder?: IOrder | null
  onClose: () => void
  onOrderSent: (order: IOrder) => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:               { label: 'Черновик',        color: '#94a3b8', bg: '#94a3b815' },
  awaiting_confirmation: { label: 'Ожидает клиента', color: '#f59e0b', bg: '#f59e0b15' },
  confirmed:             { label: '✅ Подтверждён',   color: '#22c55e', bg: '#22c55e15' },
  cancelled:             { label: '❌ Отменён',       color: '#ef4444', bg: '#ef444415' },
  processing:            { label: 'В обработке',     color: '#3b82f6', bg: '#3b82f615' },
  delivered:             { label: 'Доставлен 🎉',    color: '#10b981', bg: '#10b98115' },
}

export default function OrderPanel({ conversationId, clientId, sourceMessageId, initialItems, existingOrder, onClose, onOrderSent }: Props) {
  const [items, setItems] = useState<IOrderItem[]>(existingOrder?.items ?? initialItems)
  const [order, setOrder] = useState<IOrder | null>(existingOrder ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const status = order?.status ?? 'pending'
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const canEdit = !['awaiting_confirmation', 'confirmed', 'delivered'].includes(status)

  function updateField(index: number, field: keyof IOrderItem, raw: string) {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      if (field === 'item') return { ...item, item: raw }
      if (field === 'quantity') return { ...item, quantity: Math.max(1, parseInt(raw) || 1) }
      if (field === 'price') return { ...item, price: Math.max(0, parseFloat(raw) || 0) }
      return item
    }))
  }

  async function handleSend() {
    if (items.length === 0) return setError('Добавьте хотя бы один товар.')
    if (items.some(i => !i.item.trim())) return setError('У всех товаров должно быть название.')
    setError('')
    setLoading(true)
    try {
      let current = order
      if (!current) {
        current = await createOrder({ conversationId, clientId, sourceMessageId, items })
      } else {
        current = await updateOrder(current._id, { items })
      }
      setOrder(current)
      await sendOrderConfirmation(current._id)
      const updated = { ...current, status: 'awaiting_confirmation' as const }
      setOrder(updated)
      onOrderSent(updated)
    } catch {
      setError('Ошибка отправки. Проверьте соединение.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[360px] flex-shrink-0 flex flex-col border-l border-blue-950/60" style={{ background: '#0d1426' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-950/60">
        <div className="flex items-center gap-3">
          <p className="font-semibold text-white text-sm">Заказ</p>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-blue-400/50 hover:text-white transition-colors text-xl">
          ×
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {items.length === 0 && (
          <p className="text-blue-400/30 text-sm text-center py-8">Нет позиций. Добавьте ниже.</p>
        )}

        {items.map((item, i) => (
          <div key={i} className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-400/50 uppercase tracking-widest font-medium">Позиция {i + 1}</span>
              {canEdit && (
                <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}
                  className="text-blue-400/30 hover:text-red-400 text-xs transition-colors">
                  Удалить
                </button>
              )}
            </div>

            <input disabled={!canEdit} value={item.item}
              onChange={e => updateField(i, 'item', e.target.value)}
              placeholder="Название товара"
              className="w-full bg-blue-950/40 disabled:opacity-50 text-white placeholder-blue-400/30 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 border border-blue-500/10 transition" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-blue-400/50 font-medium block mb-1">Количество</label>
                <input disabled={!canEdit} type="number" min={1} value={item.quantity}
                  onChange={e => updateField(i, 'quantity', e.target.value)}
                  className="w-full bg-blue-950/40 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 border border-blue-500/10 text-center" />
              </div>
              <div>
                <label className="text-[10px] text-blue-400/50 font-medium block mb-1">Цена ($)</label>
                <input disabled={!canEdit} type="number" min={0} step={0.01} value={item.price}
                  onChange={e => updateField(i, 'price', e.target.value)}
                  className="w-full bg-blue-950/40 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 border border-blue-500/10 text-center" />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-blue-500/10">
              <span className="text-xs text-blue-400/40">Итого</span>
              <span className="text-sm font-bold text-blue-400">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}

        {canEdit && (
          <button onClick={() => setItems(prev => [...prev, { item: '', quantity: 1, price: 0 }])}
            className="w-full py-3 rounded-xl border border-dashed border-blue-500/20 hover:border-blue-500/50 text-blue-400/40 hover:text-blue-400 text-sm transition-colors">
            + Добавить позицию
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-blue-950/60 space-y-3">
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
          <span className="text-blue-400/70 text-sm">Итого заказ</span>
          <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
        </div>

        {error && <p className="text-red-400 text-xs bg-red-900/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

        {canEdit && (
          <button onClick={handleSend} disabled={loading || items.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30">
            {loading ? <span className="animate-pulse">Отправка...</span> : <><span>📤</span> Отправить подтверждение</>}
          </button>
        )}

        {status === 'awaiting_confirmation' && (
          <p className="text-amber-400/80 text-xs text-center">Ожидаем ответа клиента...</p>
        )}
        {status === 'confirmed' && (
          <p className="text-emerald-400 text-xs text-center font-medium">Клиент подтвердил заказ ✅</p>
        )}
        {status === 'cancelled' && (
          <p className="text-red-400/80 text-xs text-center">Клиент отменил заказ</p>
        )}
      </div>
    </div>
  )
}
