'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { store } from '@/public/store/store'
import { GlobalProvider } from '@/provider/GlobalProvider'
import Navbar from '@/Components/Navbar'
import Footer from '@/Components/Footer'
import CartMobile from '@/Components/CartMobile'
import RouteProgress from '@/Components/RouteProgress'

const focusedRoutes = ['/login', '/signup', '/forgot-password', '/otp-verification', '/reset-password', '/verify-email']

const AppShellFallback = () => (
  <div className="app-shell" aria-busy="true" aria-label="Loading Scan My Meal">
    <div className="border-b border-black/[0.06] bg-[#f7f6f1]">
      <div className="page-container flex h-17 items-center gap-3 lg:h-20">
        <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
        <div className="skeleton-shimmer h-4 w-32 rounded-full" />
        <div className="skeleton-shimmer ml-auto h-11 w-28 rounded-xl" />
      </div>
    </div>
    <main className="page-container grid min-h-[65vh] gap-5 py-8">
      <div className="skeleton-shimmer h-72 w-full rounded-[2rem] lg:h-[30rem]" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => <div key={index} className="skeleton-shimmer h-36 w-30 shrink-0 rounded-3xl" />)}
      </div>
    </main>
  </div>
)

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isFocused = focusedRoutes.some((route) => pathname.startsWith(route))
  const showCart = !isAdmin && pathname !== '/place-order'

  return (
    <Provider store={store}>
      <GlobalProvider>
        <Suspense fallback={null}><RouteProgress /></Suspense>
        <Suspense fallback={<AppShellFallback />}>
          <div className="app-shell">
            {!isAdmin && <Navbar />}
            <div className="app-content">{children}</div>
            {showCart && <CartMobile />}
            {!isAdmin && !isFocused && <Footer />}
          </div>
        </Suspense>
        <ToastContainer
          position="top-right"
          limit={1}
          autoClose={3500}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
          draggable
          theme="light"
          toastClassName="!rounded-2xl !border !border-black/5 !bg-white !text-[var(--color-text)] !shadow-[var(--shadow-float)]"
          progressClassName="!bg-[var(--color-primary)]"
        />
      </GlobalProvider>
    </Provider>
  )
}
