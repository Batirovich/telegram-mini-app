'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { IProduct } from './types'
import BottomNav, { Tab } from './components/BottomNav'
import HomeView from './components/HomeView'
import SearchView from './components/SearchView'
import CartView from './components/CartView'
import ProfileView from './components/ProfileView'
import ProductDetail from './components/ProductDetail'
import RegisterView from './components/RegisterView'
import CustomOrderView from './components/CustomOrderView'

export default function MiniApp() {
  const { user, loading, refresh } = useAuth()
  const { count } = useCart()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) { tg.ready(); tg.expand() }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(59,130,246,0.3)', borderTopColor: '#3b82f6' }} />
      </div>
    )
  }

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
    <div className="flex flex-col min-h-screen" style={{ background: '#0a0f1e' }} suppressHydrationWarning>
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'home'    && <HomeView onOpenProduct={setSelectedProduct} onGoSearch={() => setActiveTab('search')} />}
        {activeTab === 'search'  && <SearchView onOpenProduct={setSelectedProduct} />}
        {activeTab === 'cart'    && <CartView user={user} />}
        {activeTab === 'order'   && <CustomOrderView user={user} />}
        {activeTab === 'profile' && <ProfileView user={user} onGoOrders={() => {}} />}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} cartCount={count} />
    </div>
  )
}
