'use client'

import { AuthUser } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'

interface Props {
  user: AuthUser | null
  onGoOrders: () => void
}

const S = {
  bg: '#0a0f1e',
  card: '#0d1426',
  border: 'rgba(59,130,246,0.15)',
  muted: 'rgba(96,165,250,0.45)',
  blue: '#3b82f6',
}

export default function ProfileView({ user, onGoOrders }: Props) {
  const { count } = useCart()
  const initial = user?.firstName?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex flex-col pb-24" style={{ background: S.bg, minHeight: '100%' }}>
      {/* Hero card */}
      <div className="mx-4 mt-5 rounded-3xl p-6"
           style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(99,102,241,0.15))', border: `1px solid ${S.border}` }}>
        <div className="flex items-center gap-4">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="avatar"
              className="w-16 h-16 rounded-full border-2" style={{ borderColor: 'rgba(59,130,246,0.4)' }} />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                 style={{ background: S.blue }}>
              {initial}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            {user?.username && <p className="text-sm" style={{ color: S.muted }}>@{user.username}</p>}
            {user?.accountName && <p className="text-sm font-medium" style={{ color: '#60a5fa' }}>{user.accountName}</p>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        <div className="rounded-2xl p-4 text-center"
             style={{ background: S.card, border: `1px solid ${S.border}` }}>
          <p className="text-2xl font-bold text-white">{user?.orderCount ?? 0}</p>
          <p className="text-xs mt-0.5" style={{ color: S.muted }}>Заказов</p>
        </div>
        <div className="rounded-2xl p-4 text-center"
             style={{ background: S.card, border: `1px solid ${S.border}` }}>
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-xs mt-0.5" style={{ color: S.muted }}>В корзине</p>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 mt-4 space-y-3">
        {user?.phone && (
          <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
               style={{ background: S.card, border: `1px solid ${S.border}` }}>
            <span className="text-xl">📞</span>
            <div>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: S.muted }}>Телефон</p>
              <p className="text-sm font-medium text-white">{user.phone}</p>
            </div>
          </div>
        )}

        <button onClick={onGoOrders}
          className="w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all active:scale-[0.99]"
          style={{ background: S.card, border: `1px solid ${S.border}` }}>
          <span className="text-xl">📦</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white">Мои заказы</p>
            <p className="text-xs" style={{ color: S.muted }}>История заказов</p>
          </div>
          <span style={{ color: S.muted }}>›</span>
        </button>

        {!user?.registered && (
          <div className="rounded-2xl px-4 py-4 flex gap-3"
               style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-400">Регистрация не завершена</p>
              <p className="text-xs mt-1" style={{ color: S.muted }}>
                Введите данные компании для оформления заказов.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
