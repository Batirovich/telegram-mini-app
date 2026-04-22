'use client'

import { useEffect, useState } from 'react'
import { IConversation, IMessage, IOrderItem, IOrder, fetchConversations } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import ConversationList, { clientDisplayName } from '@/components/ConversationList'
import ChatWindow from '@/components/ChatWindow'
import OrderPanel from '@/components/OrderPanel'

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
            ? {
                ...c,
                unreadCount: selectedId === conversationId ? 0 : (c.unreadCount || 0) + 1,
                lastMessageAt: new Date().toISOString()
              }
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

  function handleSelectConversation(id: string) {
    setSelectedId(id)
    setOrderDraft(null)
  }

  function handleExtractOrder(msg: IMessage, items: IOrderItem[]) {
    setOrderDraft({ sourceMessage: msg, items, existingOrder: null })
  }

  function handleOrderSent(order: IOrder) {
    setOrderDraft(prev => prev ? { ...prev, existingOrder: order } : null)
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelectConversation}
      />

      {/* Main area */}
      <div className="flex-1 flex min-w-0">
        {selected ? (
          <>
            <ChatWindow
              key={selected._id}
              conversationId={selected._id}
              clientId={selected.clientId?._id ?? ''}
              clientName={clientDisplayName(selected)}
              onExtractOrder={handleExtractOrder}
            />
            {orderDraft && (
              <OrderPanel
                conversationId={selected._id}
                clientId={selected.clientId?._id ?? ''}
                sourceMessageId={orderDraft.sourceMessage._id}
                initialItems={orderDraft.items}
                existingOrder={orderDraft.existingOrder}
                onClose={() => setOrderDraft(null)}
                onOrderSent={handleOrderSent}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mx-auto">
                💬
              </div>
              <p className="text-white font-semibold">Select a conversation</p>
              <p className="text-slate-500 text-sm max-w-[200px]">
                New clients appear here automatically when they start the bot
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
