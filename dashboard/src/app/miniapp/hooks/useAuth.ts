'use client'
import { useState, useEffect } from 'react'
import { BACKEND_URL } from '@/lib/api'

export interface AuthUser {
  guest: boolean
  telegramId: number | null
  firstName: string
  lastName: string
  username: string
  photoUrl: string
  registered: boolean
  accountName: string
  phone: string
  orderCount: number
}

const GUEST: AuthUser = {
  guest: true, telegramId: null, firstName: 'Guest', lastName: '',
  username: '', photoUrl: '', registered: false, accountName: '', phone: '', orderCount: 0
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function authenticate() {
      try {
        const tg = (window as any).Telegram?.WebApp
        const tgUser = tg?.initDataUnsafe?.user

        // No Telegram context — show as guest
        if (!tgUser?.id) {
          setUser(GUEST)
          setLoading(false)
          return
        }

        // We have Telegram user info directly — no HMAC needed
        const baseUser: AuthUser = {
          guest: false,
          telegramId: tgUser.id,
          firstName: tgUser.first_name || '',
          lastName: tgUser.last_name || '',
          username: tgUser.username || '',
          photoUrl: tgUser.photo_url || '',
          registered: false,
          accountName: '',
          phone: '',
          orderCount: 0,
        }

        // Fetch registration status from backend
        const res = await fetch(`${BACKEND_URL}/api/auth/miniapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: tgUser.id })
        })

        if (res.ok) {
          const data = await res.json()
          setUser({ ...baseUser, ...data })
        } else {
          // Backend down — still show name/photo from Telegram
          setUser(baseUser)
        }
      } catch (e) {
        console.warn('Auth error:', e)
        setUser(GUEST)
      } finally {
        setLoading(false)
      }
    }
    authenticate()
  }, [])

  return { user, loading }
}
