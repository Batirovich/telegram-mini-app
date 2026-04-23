'use client'

import { AuthUser } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

interface Props {
  user: AuthUser | null
  onGoOrders: () => void
}

export default function ProfileView({ user, onGoOrders }: Props) {
  const { count } = useCart()

  const initial = user?.firstName?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex flex-col pb-24">
      {/* Hero card */}
      <div className="mx-4 mt-5 bg-gradient-to-br from-blue-600/30 to-slate-800 rounded-3xl p-6 border border-blue-500/20">
        <div className="flex items-center gap-4">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="avatar"
              className="w-16 h-16 rounded-full border-2 border-blue-500/40" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
              {initial}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            {user?.username && <p className="text-sm text-slate-400">@{user.username}</p>}
            {user?.accountName && <p className="text-sm text-blue-400 font-medium">{user.accountName}</p>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/30 text-center">
          <p className="text-2xl font-bold text-white">{user?.orderCount ?? 0}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Orders</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/30 text-center">
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-xs text-slate-400 mt-0.5">Items in Cart</p>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 mt-4 space-y-3">
        {user?.phone && (
          <div className="bg-slate-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-slate-700/30">
            <span className="text-xl">📞</span>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Phone</p>
              <p className="text-sm font-medium text-white">{user.phone}</p>
            </div>
          </div>
        )}

        <button onClick={onGoOrders}
          className="w-full bg-slate-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-slate-700/30 active:bg-slate-700 transition-colors">
          <span className="text-xl">📦</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white">My Orders</p>
            <p className="text-xs text-slate-500">View order history</p>
          </div>
          <span className="text-slate-500">›</span>
        </button>

        {!user?.registered && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-4 flex gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-400">Registration needed</p>
              <p className="text-xs text-slate-400 mt-1">
                Open the bot and send /start to register your phone number and unlock ordering.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
