'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'
import { AuthUser } from '../hooks/useAuth'

interface Props {
  user: AuthUser | null
}

export default function CustomOrderView({ user }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!text.trim() || loading) return
    if (!user?.telegramId) { setError('Необходима авторизация через Telegram.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/messages/from-miniapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.telegramId, text: text.trim() })
      })
      if (!res.ok) throw new Error()
      setSent(true)
      setText('')
    } catch {
      setError('Не удалось отправить. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col bg-[#111111] min-h-full pb-28">
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-white">Запрос заказа</h1>
        <p className="text-sm text-white/40 mt-1">Напишите список товаров — менеджер обработает и пришлёт счёт</p>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-3">
          <p className="text-xs text-orange-400/80 leading-relaxed">
            💡 Перечислите нужные товары с количеством. Например:<br />
            <span className="text-orange-300">«Кирпич 1000 штук, цемент 10 мешков»</span>
          </p>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введите список товаров..."
          rows={6}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-orange-500/60 resize-none transition"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {sent && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
            <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-sm font-medium">Заказ отправлен менеджеру! Ожидайте ответа.</p>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-40 text-white rounded-2xl py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Отправка...</>
            : <><Send size={16} /> Отправить менеджеру</>
          }
        </button>
      </div>
    </div>
  )
}
