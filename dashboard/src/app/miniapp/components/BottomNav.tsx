'use client'

import { Home, Search, ShoppingCart, Package, User } from 'lucide-react'

export type Tab = 'home' | 'search' | 'cart' | 'orders' | 'profile'

interface Props {
  active: Tab
  cartCount: number
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'search',  label: 'Search',  Icon: Search },
  { id: 'cart',    label: 'Cart',    Icon: ShoppingCart },
  { id: 'orders',  label: 'Orders',  Icon: Package },
  { id: 'profile', label: 'Profile', Icon: User },
]

export default function BottomNav({ active, cartCount, onChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-700/60"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${
                isActive ? 'text-blue-500' : 'text-slate-500'
              }`}>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
              )}
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                {id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
