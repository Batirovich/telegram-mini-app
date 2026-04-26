'use client'

import { Home, Search, ShoppingCart, ClipboardList, User, Send } from 'lucide-react'
import { t } from '../i18n'

export type Tab = 'home' | 'search' | 'order' | 'orders' | 'profile'

interface Props {
  active: Tab
  cartCount: number
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'home',    label: t.nav_home,           Icon: Home },
  { id: 'search',  label: t.nav_search,         Icon: Search },
  { id: 'order',   label: t.custom_order_tab,   Icon: Send },
  { id: 'orders',  label: t.nav_orders,         Icon: ClipboardList },
  { id: 'profile', label: t.nav_profile,        Icon: User },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t"
         style={{ background: 'rgba(13,20,38,0.97)', borderColor: 'rgba(59,130,246,0.15)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5}
                style={{ color: isActive ? '#3b82f6' : 'rgba(148,163,184,0.35)' }} />
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
