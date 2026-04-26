'use client'

import { Home, Search, ShoppingCart, ClipboardList, User, PenLine } from 'lucide-react'
import { t } from '../i18n'

export type Tab = 'home' | 'search' | 'order' | 'orders' | 'profile'

interface Props {
  active: Tab
  cartCount: number
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'home',    label: t.nav_home,    Icon: Home },
  { id: 'search',  label: t.nav_search,  Icon: Search },
  { id: 'order',   label: t.custom_order_tab, Icon: PenLine },
  { id: 'orders',  label: t.nav_orders,  Icon: ClipboardList },
  { id: 'profile', label: t.nav_profile, Icon: User },
]

export default function BottomNav({ active, cartCount, onChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-white/8"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-all">
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'text-orange-500' : 'text-white/30'} />
                {id === 'order' && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                    AI
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-orange-500' : 'text-white/30'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
