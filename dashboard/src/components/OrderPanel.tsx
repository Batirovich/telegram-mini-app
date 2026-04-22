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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:                { label: 'Draft',             bg: 'bg-slate-600',   text: 'text-slate-100' },
  awaiting_confirmation:  { label: 'Awaiting Client',   bg: 'bg-amber-500',   text: 'text-white' },
  confirmed:              { label: '✅ Confirmed',       bg: 'bg-emerald-600', text: 'text-white' },
  cancelled:              { label: '❌ Cancelled',       bg: 'bg-red-600',     text: 'text-white' },
  processing:             { label: 'Processing',         bg: 'bg-blue-600',    text: 'text-white' },
  delivered:              { label: 'Delivered',          bg: 'bg-emerald-700', text: 'text-white' },
}

export default function OrderPanel({
  conversationId, clientId, sourceMessageId,
  initialItems, existingOrder, onClose, onOrderSent
}: Props) {
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

  function addRow() {
    setItems(prev => [...prev, { item: '', quantity: 1, price: 0 }])
  }

  function removeRow(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSendConfirmation() {
    if (items.length === 0) return setError('Add at least one item.')
    if (items.some(i => !i.item.trim())) return setError('All items need a name.')
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
      // Reflect status change locally
      const updated = { ...current, status: 'awaiting_confirmation' as const }
      setOrder(updated)
      onOrderSent(updated)
    } catch {
      setError('Failed to send. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[380px] flex-shrink-0 bg-slate-850 border-l border-slate-700 flex flex-col"
         style={{ background: '#1a2232' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-white">Order</span>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-lg">
          ×
        </button>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {items.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">No items yet. Add one below.</p>
        )}

        {items.map((item, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700/50">
            {/* Row header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Item {i + 1}
              </span>
              {canEdit && (
                <button onClick={() => removeRow(i)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-sm">
                  Remove
                </button>
              )}
            </div>

            {/* Item name */}
            <input
              disabled={!canEdit}
              value={item.item}
              onChange={e => updateField(i, 'item', e.target.value)}
              placeholder="Item name"
              className="w-full bg-slate-700/80 disabled:opacity-60 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/60 transition"
            />

            {/* Qty + Price on same row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Quantity</label>
                <input
                  disabled={!canEdit}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateField(i, 'quantity', e.target.value)}
                  className="w-full bg-slate-700/80 disabled:opacity-60 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/60 transition text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Unit Price ($)</label>
                <input
                  disabled={!canEdit}
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.price}
                  onChange={e => updateField(i, 'price', e.target.value)}
                  className="w-full bg-slate-700/80 disabled:opacity-60 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/60 transition text-center"
                />
              </div>
            </div>

            {/* Line total */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-700/50">
              <span className="text-xs text-slate-500">Line total</span>
              <span className="text-sm font-semibold text-white">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        {canEdit && (
          <button onClick={addRow}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500/50 text-slate-500 hover:text-blue-400 text-sm transition-colors">
            + Add item
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700 space-y-4">
        {/* Total */}
        <div className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
          <span className="text-slate-400 text-sm font-medium">Order Total</span>
          <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Action */}
        {canEdit && (
          <button
            onClick={handleSendConfirmation}
            disabled={loading || items.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2">
            {loading ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <><span>📤</span> Send Confirmation to Client</>
            )}
          </button>
        )}

        {status === 'awaiting_confirmation' && (
          <div className="text-center space-y-1">
            <p className="text-amber-400 text-xs font-medium">Waiting for client response</p>
            <p className="text-slate-500 text-xs">Client sees: ✅ Confirm / ❌ Cancel / ✏️ Edit</p>
          </div>
        )}
        {status === 'confirmed' && (
          <p className="text-emerald-400 text-xs text-center font-medium">Client confirmed this order ✅</p>
        )}
        {status === 'cancelled' && (
          <p className="text-red-400 text-xs text-center">Client cancelled — you can create a new order</p>
        )}
      </div>
    </div>
  )
}
