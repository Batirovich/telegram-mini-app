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

export default function MiniApp() {
  const { user, loading } = useAuth()
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

  function handleOpenProduct(p: IProduct) {
    setSelectedProduct(p)
  }

  function handleBack() {
    setSelectedProduct(null)
  }

  function handleGoOrders() {
    setActiveTab('orders')
  }

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={handleBack} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900" suppressHydrationWarning>
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'home'    && <HomeView onOpenProduct={handleOpenProduct} onGoSearch={() => setActiveTab('search')} />}
        {activeTab === 'search'  && <SearchView onOpenProduct={handleOpenProduct} />}
        {activeTab === 'cart'    && <CartView user={user} />}
        {activeTab === 'orders'  && <OrdersView user={user} />}
        {activeTab === 'profile' && <ProfileView user={user} onGoOrders={handleGoOrders} />}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} cartCount={count} />
    </div>
  )
}
