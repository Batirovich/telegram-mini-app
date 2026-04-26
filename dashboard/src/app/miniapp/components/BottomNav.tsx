'use client'

import { Home, Search, ShoppingCart, ClipboardList, User, Send } from 'lucide-react'
import { t } from '../i18n'

export type Tab = 'home' | 'search' | 'cart' | 'order' | 'profile'

interface Props {
  active: Tab
  cartCount: number
  onChange: (tab: Tab) => void
}

export default function BottomNav({ active, cartCount, onChange }: Props) {
  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'home',    label: t.nav_home,         Icon: Home },
    { id: 'search',  label: t.nav_search,       Icon: Search },
    { id: 'cart',    label: 'Корзина',           Icon: ShoppingCart },
    { id: 'order',   label: t.custom_order_tab, Icon: Send },
    { id: 'profile', label: t.nav_profile,      Icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t"
         style={{ background: 'rgba(13,20,38,0.97)', borderColor: 'rgba(59,130,246,0.15)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all relative">
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ color: isActive ? '#3b82f6' : 'rgba(148,163,184,0.35)' }} />
                {id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1"
                        style={{ background: '#3b82f6' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium"
                    style={{ color: isActive ? '#3b82f6' : 'rgba(148,163,184,0.35)' }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
