'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Bell, ChevronDown, MapPin, ShoppingBag, UserRound } from 'lucide-react'
import Search from './Search'
import UserMenu from './userMenu'
import DisplayCartProduct from './DisplayCartProduct'
import { useGlobalContext } from '@/provider/GlobalProvider'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'

const Navbar = () => {
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const [openCart, setOpenCart] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const pathname = usePathname()
  const user = useSelector((state) => state.user)
  const cartItem = useSelector((state) => state.cartItem.cart)
  const tableId = useSelector((state) => state.addresses.tableId)
  const { totalCartItem, totalCartPrice } = useGlobalContext()
  const menuRef = useRef(null)

  useEffect(() => {
    const close = (event) => menuRef.current && !menuRef.current.contains(event.target) && setOpenUserMenu(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  useEffect(() => { setOpenUserMenu(false); setOpenCart(false); setOpenNotifications(false) }, [pathname])
  useEffect(() => {
    if (!user?.id) { setNotifications([]); setUnreadNotifications(0); return }
    Axios(summaryApi.userNotifications).then((response) => { setNotifications(response.data.data || []); setUnreadNotifications(response.data.unread || 0) }).catch(() => {})
  }, [user?.id, pathname])

  const markNotificationRead = async (notification) => {
    if (!notification.isRead) {
      await Axios(summaryApi.readUserNotification(notification._id))
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, isRead: true } : item))
      setUnreadNotifications((count) => Math.max(0, count - 1))
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f7f6f1]/92 backdrop-blur-xl">
      <div className="page-container flex h-17 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Scan My Meal home">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"><Image src="/assets/favicon.png" alt="" width={34} height={34} className="rounded-lg" /></span>
          <span className="hidden leading-none sm:block"><strong className="block text-[17px] font-black tracking-[-0.035em]">Scan My Meal</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Fresh. Fast. Yours.</span></span>
        </Link>

        <div className="hidden flex-1 justify-center px-4 md:flex"><Search /></div>

        <nav className="flex items-center gap-2" aria-label="Customer navigation">
          {
            tableId && <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 lg:flex"><MapPin size={14} /> Dine-in active</span>
          }
          {!user?.id ? (
            <Link href="/login" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 font-bold text-[var(--color-text)] hover:bg-white"><UserRound size={19} /><span className="hidden sm:inline">Sign in</span></Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setOpenUserMenu((value) => !value)} aria-expanded={openUserMenu} className="flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-2 hover:border-black/5 hover:bg-white">
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[var(--color-surface-soft)] text-sm font-black text-[var(--color-secondary)]">{user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name?.slice(0, 1)?.toUpperCase()}</span>
                <span className="hidden max-w-28 truncate text-sm font-bold lg:block">{user.name}</span><ChevronDown size={15} className={`hidden transition-transform lg:block ${openUserMenu ? 'rotate-180' : ''}`} />
              </button>
              {openUserMenu && <div className="absolute right-0 top-[calc(100%+0.75rem)] w-64 animate-fade-up rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[var(--shadow-float)]"><UserMenu close={() => setOpenUserMenu(false)} compact /></div>}
            </div>
          )}
          {
            user?.id && 
              <div className="relative">
                <button onClick={() => setOpenNotifications((value) => !value)} className="relative grid h-11 w-11 place-items-center rounded-xl text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-primary)]" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`} aria-expanded={openNotifications}>
                  <Bell size={19} />{unreadNotifications > 0 && <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-black text-white">{Math.min(99, unreadNotifications)}</span>}
                </button>
                {
                  openNotifications && <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[var(--shadow-float)]">
                    <div className="flex items-center justify-between border-b border-black/[0.06] p-4">
                      <div>
                        <p className="font-black">Notifications</p>
                        <p className="text-xs text-[var(--color-muted)]">{unreadNotifications ? `${unreadNotifications} unread updates` : 'You are all caught up'}</p>
                      </div>
                      <Bell size={17} className="text-[var(--color-primary)]" />
                    </div>

                    <div className="no-scrollbar max-h-80 overflow-y-auto">
                      {notifications.length ?
                        notifications.slice(0, 8).map((notification) => <div key={notification._id} className={`border-b border-black/[0.05] p-4 last:border-0 ${notification.isRead ? '' : 'bg-orange-50/60'}`}>
                            <button onClick={() => markNotificationRead(notification)} className="w-full text-left">
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-bold">{notification.title}</p>

                                {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">{notification.message}</p>
                            </button>
                            
                            {notification.actionUrl && <Link href={notification.actionUrl} onClick={() => markNotificationRead(notification)} className="mt-2 inline-flex text-xs font-bold text-[var(--color-primary)]">View update →</Link>}
                          </div>
                        ) : <p className="p-6 text-center text-sm text-[var(--color-muted)]">No notifications yet.</p>
                      }
                    </div>
                  </div>
                }
              </div>
          }
          <button onClick={() => setOpenCart(true)} className="relative inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-text)] px-3.5 font-bold text-white shadow-lg hover:-translate-y-0.5 hover:bg-black" aria-label={`Open cart with ${totalCartItem} items`}>
            <ShoppingBag size={19} />
            <span className="hidden sm:inline">
              {cartItem.length ? `₹${totalCartPrice}` : 'Cart'}
            </span>
            {totalCartItem > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] text-white ring-2 ring-[#f7f6f1]">{totalCartItem}</span>}
          </button>
        </nav>
      </div>
      <div className="page-container pb-3 md:hidden"><Search /></div>
      {openCart && <DisplayCartProduct close={() => setOpenCart(false)} />}
    </header>
  )
}

export default Navbar
