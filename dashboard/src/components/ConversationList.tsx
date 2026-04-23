'use client'

import Link from 'next/link'
import { IConversation } from '@/lib/api'

interface Props {
  conversations: IConversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function clientDisplayName(conv: IConversation) {
  const c = conv.clientId
  return c?.accountName || c?.firstName || `User ${conv.telegramId}`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function ConversationList({ conversations, selectedId, onSelect }: Props) {
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)

  return (
    <div className="w-72 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-sm">✈️</div>
            <span className="font-semibold text-white text-sm">Dashboard</span>
          </div>
          {totalUnread > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-slate-700/60 rounded-lg px-3 py-2">
            <p className="text-lg font-bold text-white">{conversations.length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Clients</p>
          </div>
          <div className="bg-slate-700/60 rounded-lg px-3 py-2">
            <p className="text-lg font-bold text-white">{conversations.filter(c => c.status === 'active').length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Active</p>
          </div>
        </div>
      </div>

      {/* Search label */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Conversations</p>
      </div>

      {/* Nav links */}
      <div className="px-4 pt-2 pb-2 border-b border-slate-700/60">
        <Link href="/products"
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700/60 transition-colors text-sm text-slate-300 hover:text-white">
          <span>📦</span> Products
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500 text-xs">
            No conversations yet.<br />Waiting for clients.
          </div>
        )}

        {conversations.map(conv => (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`w-full text-left px-4 py-3 hover:bg-slate-700/60 transition-colors border-l-2 ${
              selectedId === conv._id
                ? 'bg-slate-700/60 border-l-blue-500'
                : 'border-l-transparent'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
                  {clientDisplayName(conv)[0]?.toUpperCase()}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">{clientDisplayName(conv)}</span>
                  <span className="text-[10px] text-slate-500 flex-shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {conv.lastMessage || 'No messages'}
                </p>
                {conv.clientId?.phone && (
                  <p className="text-[10px] text-slate-600 mt-0.5">{conv.clientId.phone}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
