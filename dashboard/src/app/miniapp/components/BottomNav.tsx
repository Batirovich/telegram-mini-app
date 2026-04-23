'use client'

export type Tab = 'home' | 'search' | 'cart' | 'orders' | 'profile'

interface Props {
  active: Tab
  cartCount: number
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home',    label: 'Home',    icon: '🏠' },
  { id: 'search',  label: 'Search',  icon: '🔍' },
  { id: 'cart',    label: 'Cart',    icon: '🛒' },
  { id: 'orders',  label: 'Orders',  icon: '📦' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav({ active, cartCount, onChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700/60"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors relative ${
              active === tab.id ? 'text-blue-500' : 'text-slate-500'
            }`}>
            <span className="text-xl leading-none relative">
              {tab.icon}
              {tab.id === 'cart' && cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-medium ${active === tab.id ? 'text-blue-500' : 'text-slate-500'}`}>
              {tab.label}
            </span>
            {active === tab.id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
