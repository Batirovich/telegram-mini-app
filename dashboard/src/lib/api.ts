export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

const BASE = `${BACKEND_URL}/api`

export interface IClient {
  _id: string
  telegramId: number
  firstName?: string
  accountName?: string
  phone?: string
  username?: string
}

export interface IConversation {
  _id: string
  telegramId: number
  clientId: IClient
  status: string
  unreadCount: number
  lastMessage?: string
  lastMessageAt: string
  createdAt: string
}

export interface IMessage {
  _id: string
  conversationId: string
  sender: 'client' | 'admin'
  type: 'text' | 'photo' | 'voice' | 'video' | 'document' | 'audio'
  text?: string
  caption?: string
  fileUrl?: string
  fileName?: string
  duration?: number
  createdAt: string
}

export interface IOrderItem {
  item: string
  quantity: number
  price: number
}

export interface IOrder {
  _id: string
  conversationId: string
  clientId: string
  sourceMessageId?: string
  items: IOrderItem[]
  total: number
  status: 'pending' | 'awaiting_confirmation' | 'confirmed' | 'cancelled' | 'processing' | 'delivered'
  createdAt: string
}

export async function fetchConversations(): Promise<IConversation[]> {
  const res = await fetch(`${BASE}/conversations`)
  return res.json()
}

export async function fetchMessages(conversationId: string): Promise<IMessage[]> {
  const res = await fetch(`${BASE}/messages/${conversationId}`)
  return res.json()
}

export async function sendReply(conversationId: string, text: string): Promise<IMessage> {
  const res = await fetch(`${BASE}/messages/${conversationId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  return res.json()
}

export async function markRead(conversationId: string): Promise<void> {
  await fetch(`${BASE}/conversations/${conversationId}/read`, { method: 'PATCH' })
}

export async function extractOrder(messageId: string): Promise<{ items: IOrderItem[]; error?: string }> {
  const res = await fetch(`${BASE}/orders/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export async function createOrder(data: {
  conversationId: string
  clientId: string
  sourceMessageId: string
  items: IOrderItem[]
}): Promise<IOrder> {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateOrder(orderId: string, data: { items?: IOrderItem[]; status?: string }): Promise<IOrder> {
  const res = await fetch(`${BASE}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function sendOrderConfirmation(orderId: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${BASE}/orders/${orderId}/send-confirmation`, { method: 'POST' })
  return res.json()
}

export async function fetchOrders(conversationId: string): Promise<IOrder[]> {
  const res = await fetch(`${BASE}/orders/conversation/${conversationId}`)
  return res.json()
}
