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
        const initData = tg?.initData || 'guest'

        const res = await fetch(`${BACKEND_URL}/api/auth/miniapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          setUser(GUEST)
        }
      } catch {
        setUser(GUEST)
      } finally {
        setLoading(false)
      }
    }
    authenticate()
  }, [])

  return { user, loading }
}
