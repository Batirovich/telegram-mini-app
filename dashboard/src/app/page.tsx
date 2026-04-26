'use client'

import { useEffect, useState } from 'react'
import { IConversation, IMessage, IOrderItem, IOrder, fetchConversations } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import ConversationList, { clientDisplayName } from '@/components/ConversationList'
import ChatWindow from '@/components/ChatWindow'
import OrderPanel from '@/components/OrderPanel'
import Link from 'next/link'

interface OrderDraft {
  sourceMessage: IMessage
  items: IOrderItem[]
  existingOrder: IOrder | null
}

export default function Home() {
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null)

  useEffect(() => {
    fetchConversations().then(setConversations)
    const socket = getSocket()

    socket.on('new_conversation', (conv: IConversation) => {
      setConversations(prev => [conv, ...prev])
    })

    socket.on('new_message', ({ conversationId }: { conversationId: string }) => {
      setConversations(prev =>
        [...prev.map(c =>
          c._id === conversationId
            ? { ...c, unreadCount: selectedId === conversationId ? 0 : (c.unreadCount || 0) + 1, lastMessageAt: new Date().toISOString() }
            : c
        )].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      )
    })

    socket.on('order_updated', ({ conversationId, status }: { conversationId: string; orderId: string; status: string }) => {
      if (orderDraft && conversationId === selectedId) {
        setOrderDraft(prev => prev
          ? { ...prev, existingOrder: prev.existingOrder ? { ...prev.existingOrder, status: status as any } : null }
          : null
        )
      }
    })

    return () => {
      socket.off('new_conversation')
      socket.off('new_message')
      socket.off('order_updated')
    }
  }, [selectedId, orderDraft])

  const selected = conversations.find(c => c._id === selectedId)
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">

      {/* Left sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-[#0d1426] border-r border-blue-950/60">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-blue-950/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-900/50">
              U
            </div>
            <div>
              <p className="font-bold text-white text-sm">UGO Admin</p>
              <p className="text-[11px] text-blue-400/60">Dashboard v2</p>
            </div>
            {totalUnread > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {totalUnread}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white">{conversations.length}</p>
              <p className="text-[10px] text-blue-400/70 mt-0.5 uppercase tracking-wide">Клиентов</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white">{conversations.filter(c => c.status === 'active').length}</p>
              <p className="text-[10px] text-blue-400/70 mt-0.5 uppercase tracking-wide">Активных</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-3 border-b border-blue-950/60 space-y-1">
          <p className="text-[10px] text-blue-400/40 uppercase tracking-widest px-2 mb-2">Навигация</p>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <span>💬</span> Сообщения
          </div>
          <Link href="/products"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-blue-500/8 text-blue-400/60 hover:text-blue-300 text-sm font-medium transition-colors">
            <span>📦</span> Товары
          </Link>
        </div>

        {/* Conversations */}
        <div className="px-3 py-2">
          <p className="text-[10px] text-blue-400/40 uppercase tracking-widest px-2 mb-2">Переписки</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="px-2 py-8 text-center text-blue-400/30 text-xs">
              Ожидаем клиентов...
            </div>
          ) : (
            conversations.map(conv => {
              const isSelected = selectedId === conv._id
              const initials = clientDisplayName(conv)[0]?.toUpperCase()
              return (
                <button key={conv._id} onClick={() => { setSelectedId(conv._id); setOrderDraft(null) }}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'hover:bg-blue-500/8 border border-transparent'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white">
                        {initials}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">{clientDisplayName(conv)}</span>
                        <span className="text-[10px] text-blue-400/40 flex-shrink-0 ml-1">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-blue-400/50 truncate mt-0.5">{conv.lastMessage || '—'}</p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex min-w-0">
        {selected ? (
          <>
            <ChatWindow
              key={selected._id}
              conversationId={selected._id}
              clientId={selected.clientId?._id ?? ''}
              clientName={clientDisplayName(selected)}
              onExtractOrder={(msg, items) => setOrderDraft({ sourceMessage: msg, items, existingOrder: null })}
            />
            {orderDraft && (
              <OrderPanel
                conversationId={selected._id}
                clientId={selected.clientId?._id ?? ''}
                sourceMessageId={orderDraft.sourceMessage._id}
                initialItems={orderDraft.items}
                existingOrder={orderDraft.existingOrder}
                onClose={() => setOrderDraft(null)}
                onOrderSent={order => setOrderDraft(prev => prev ? { ...prev, existingOrder: order } : null)}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-4xl mx-auto">
                💬
              </div>
              <div>
                <p className="text-white font-semibold text-lg">UGO Admin Dashboard</p>
                <p className="text-blue-400/50 text-sm mt-1 max-w-[220px] mx-auto">
                  Выберите переписку слева для просмотра сообщений и заказов
                </p>
              </div>
              <div className="flex gap-3 justify-center mt-2">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-lg font-bold text-white">{conversations.length}</p>
                  <p className="text-[11px] text-blue-400/60">клиентов</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 text-center">
                  <p className="text-lg font-bold text-white">{totalUnread}</p>
                  <p className="text-[11px] text-blue-400/60">новых</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
