'use client'

import { useState } from 'react'
import { Phone, Building2 } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'

interface Props {
  telegramId: number
  firstName: string
  onRegistered: (phone: string, accountName: string) => void
}

const S = {
  bg: '#0a0f1e',
  card: '#0d1426',
  surface: '#1a2744',
  border: 'rgba(59,130,246,0.18)',
  muted: 'rgba(96,165,250,0.45)',
  blue: '#3b82f6',
}

export default function RegisterView({ telegramId, firstName, onRegistered }: Props) {
  const [step, setStep] = useState<'phone' | 'company'>('phone')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePhoneShare() {
    const tg = (window as any).Telegram?.WebApp
    if (tg?.requestContact) {
      tg.requestContact((ok: boolean, contact: any) => {
        if (ok && contact?.contact?.phone_number) {
          setPhone(contact.contact.phone_number)
          setStep('company')
        }
      })
    } else {
      setStep('company')
    }
  }

  async function handleFinish() {
    if (!company.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, phone, accountName: company.trim() })
      })
      if (res.ok) {
        onRegistered(phone, company.trim())
      } else {
        setError('Что-то пошло не так. Попробуйте ещё раз.')
      }
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: S.bg }}>
      <div className="w-full max-w-sm space-y-6">

        {/* Icon */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl"
               style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}>
            🏗️
          </div>
          <h1 className="text-2xl font-bold text-white">Добро пожаловать, {firstName}!</h1>
          <p className="text-sm mt-2" style={{ color: S.muted }}>Быстрая настройка для начала работы</p>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 flex items-start gap-3"
                 style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <Phone size={20} className="flex-shrink-0 mt-0.5" style={{ color: S.blue }} />
              <div>
                <p className="text-sm font-semibold text-white">Поделитесь номером телефона</p>
                <p className="text-xs mt-1" style={{ color: S.muted }}>Чтобы менеджер мог связаться по заказу</p>
              </div>
            </div>

            <button onClick={handlePhoneShare}
              className="w-full text-white rounded-2xl py-4 font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: S.blue, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
              📱 Поделиться номером
            </button>

            <button onClick={() => setStep('company')}
              className="w-full text-xs py-2"
              style={{ color: S.muted }}>
              Пропустить
            </button>
          </div>
        )}

        {step === 'company' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 flex items-start gap-3"
                 style={{ background: S.card, border: `1px solid ${S.border}` }}>
              <Building2 size={20} className="flex-shrink-0 mt-0.5" style={{ color: S.blue }} />
              <div>
                <p className="text-sm font-semibold text-white">Название компании</p>
                <p className="text-xs mt-1" style={{ color: S.muted }}>Чтобы мы знали для кого заказ</p>
              </div>
            </div>

            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Например: ООО Стройград"
              autoFocus
              className="w-full rounded-2xl px-4 py-4 text-white text-sm outline-none transition"
              style={{ background: S.surface, border: `1px solid ${S.border}`, caretColor: S.blue }}
            />

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button onClick={handleFinish} disabled={loading || !company.trim()}
              className="w-full text-white rounded-2xl py-4 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: S.blue, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
              {loading ? 'Сохранение...' : '✅ Завершить настройку'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
