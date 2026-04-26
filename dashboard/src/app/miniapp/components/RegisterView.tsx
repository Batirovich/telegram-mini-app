'use client'

import { useState } from 'react'
import { Phone, Building2 } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'

interface Props {
  telegramId: number
  firstName: string
  onRegistered: (phone: string, accountName: string) => void
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
      // Browser fallback — manual entry
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
        setError('Something went wrong. Try again.')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">

        {/* Icon */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-500 flex items-center justify-center text-4xl mx-auto mb-4 shadow-xl shadow-orange-900/40">
            🏗️
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome, {firstName}!</h1>
          <p className="text-white/40 text-sm mt-2">Quick setup to start ordering</p>
        </div>

        {step === 'phone' && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
              <Phone size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Share your phone number</p>
                <p className="text-xs text-white/40 mt-1">So we can contact you about your orders</p>
              </div>
            </div>

            <button
              onClick={handlePhoneShare}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-2xl py-4 font-semibold text-sm transition-all shadow-lg shadow-orange-900/30">
              📱 Share Phone Number
            </button>

            <button
              onClick={() => setStep('company')}
              className="w-full text-white/30 text-xs py-2">
              Skip for now
            </button>
          </div>
        )}

        {step === 'company' && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
              <Building2 size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Company or account name</p>
                <p className="text-xs text-white/40 mt-1">So we know who the order is for</p>
              </div>
            </div>

            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. ABC Construction"
              autoFocus
              className="w-full bg-white/8 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/30 text-sm outline-none focus:border-orange-500/60"
            />

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button
              onClick={handleFinish}
              disabled={loading || !company.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-40 text-white rounded-2xl py-4 font-semibold text-sm transition-all shadow-lg shadow-orange-900/30">
              {loading ? 'Saving...' : '✅ Complete Setup'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
