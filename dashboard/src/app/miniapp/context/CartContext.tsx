'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

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

interface CartContextValue {
  items: CartItem[]
  add: (product: Omit<CartItem, 'quantity'>) => void
  adjust: (id: string, delta: number) => void
  remove: (id: string) => void
  clear: () => void
  qty: (id: string) => number
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

const KEY = 'tg_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  // Load once from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setReady(true)
  }, [])

  // Persist on every change (only after initial load)
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items))
  }, [items, ready])

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

  const clear = useCallback(() => {
    setItems([])
    localStorage.removeItem(KEY)
  }, [])

  const qty = useCallback((id: string) => items.find(i => i._id === id)?.quantity ?? 0, [items])

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, adjust, remove, clear, qty, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
