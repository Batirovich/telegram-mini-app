'use client'
import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  _id: string
  name: string
  brand: string
  price: number
  emoji: string
  bg: string
  color: string
  quantity: number
}

const KEY = 'tg_cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const ex = prev.find(i => i._id === product._id)
      return ex
        ? prev.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...product, quantity: 1 }]
    })
  }, [])

  const adjust = useCallback((id: string, delta: number) => {
    setItems(prev =>
      prev.map(i => i._id === id ? { ...i, quantity: i.quantity + delta } : i)
          .filter(i => i.quantity > 0)
    )
  }, [])

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i._id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const qty = useCallback((id: string) => items.find(i => i._id === id)?.quantity ?? 0, [items])

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return { items, add, adjust, remove, clear, qty, total, count }
}
