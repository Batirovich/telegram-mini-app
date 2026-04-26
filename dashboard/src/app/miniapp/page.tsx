'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { IProduct } from './types'
import BottomNav, { Tab } from './components/BottomNav'
import HomeView from './components/HomeView'
import SearchView from './components/SearchView'
import CartView from './components/CartView'
import OrdersView from './components/OrdersView'
import ProfileView from './components/ProfileView'
import ProductDetail from './components/ProductDetail'
import RegisterView from './components/RegisterView'

export default function MiniApp() {
  const { user, loading, refresh } = useAuth()
  const { count } = useCart()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  // Not in Telegram — show catalog anyway (guest mode)
  // In Telegram but not registered — show registration
  if (user && !user.guest && !user.registered) {
    return (
      <RegisterView
        telegramId={user.telegramId!}
        firstName={user.firstName}
        onRegistered={(phone, accountName) => refresh({ phone, accountName })}
      />
    )
  }

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]" suppressHydrationWarning>
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'home'    && <HomeView onOpenProduct={setSelectedProduct} onGoSearch={() => setActiveTab('search')} />}
        {activeTab === 'search'  && <SearchView onOpenProduct={setSelectedProduct} />}
        {activeTab === 'cart'    && <CartView user={user} />}
        {activeTab === 'orders'  && <OrdersView user={user} />}
        {activeTab === 'profile' && <ProfileView user={user} onGoOrders={() => setActiveTab('orders')} />}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} cartCount={count} />
    </div>
  )
}
