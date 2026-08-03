'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, BadgePercent, BarChart3, Bell, Boxes, CalendarClock, Images, LayoutDashboard, Layers3, ListTree, LogOut, PlusCircle, QrCode, ShieldCheck, ShoppingBag, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import RestrictUser from '@/Components/RestrictUser'
import { hasPermission, isStaff } from '@/public/utils/isAdmin'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { logout } from '@/public/store/userSlice'

const links = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, permission: 'dashboard.view', group: 'Workspace' },
  { label: 'Orders', href: '/admin/upcoming-orders', icon: CalendarClock, permission: 'orders.view', group: 'Workspace' },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3, permission: 'orders.view', group: 'Workspace' },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell, permission: 'notifications.view', group: 'Workspace' },
  { label: 'Menu items', href: '/admin/products', icon: ShoppingBag, permission: 'products.view', group: 'Catalog' },
  { label: 'Add item', href: '/admin/add-product', icon: PlusCircle, permission: 'products.manage', group: 'Catalog' },
  { label: 'Categories', href: '/admin/category', icon: Layers3, permission: 'products.manage', group: 'Catalog' },
  { label: 'Subcategories', href: '/admin/sub-category', icon: ListTree, permission: 'products.manage', group: 'Catalog' },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes, permission: 'inventory.view', group: 'Catalog' },
  { label: 'Offers', href: '/admin/offers', icon: BadgePercent, permission: 'offers.view', group: 'Growth' },
  { label: 'Banners', href: '/admin/banners', icon: Images, permission: 'banners.manage', group: 'Growth' },
  { label: 'Table QR', href: '/admin/generate-qr', icon: QrCode, permission: 'tables.manage', group: 'Operations' },
  { label: 'Customers', href: '/admin/all-users', icon: Users, permission: 'customers.view', group: 'People' },
  { label: 'Staff management', href: '/admin/access', icon: ShieldCheck, permission: 'access.manage', group: 'People' },
]

export default function AdminLayout({ children }) {
  const user = useSelector((state) => state.user)
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const signOut = async () => {
    try { await Axios(summaryApi.logout) }
    catch (_error) { /* Clear the local session even if the server session already expired. */ }
    dispatch(logout())
    router.replace('/login')
    toast.success('Signed out')
  }
  if (!isStaff(user.role)) return <RestrictUser />
  const activeLink = links.find((item) => item.href === pathname) || links.find((item) => item.href !== '/admin' && pathname.startsWith(item.href))
  if (activeLink && !hasPermission(user, activeLink.permission)) return <RestrictUser />
  const visibleLinks = links.filter((item) => hasPermission(user, item.permission))
  const groups = [...new Set(visibleLinks.map((item) => item.group))]
  const current = activeLink?.label || 'Operations'

  return (
    <main className="min-h-screen bg-[#eff1ed]">
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/92 backdrop-blur-xl">
        <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><Link href="/" className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-surface-soft)]" aria-label="Back to restaurant"><ArrowLeft size={19} /></Link><div className="flex items-center gap-2.5"><Image src="/assets/favicon.png" alt="" width={34} height={34} className="rounded-lg" /><div><strong className="block text-sm font-black">Scan My Meal</strong><span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Admin workspace</span></div></div></div>
          <div className="hidden text-center sm:block"><p className="text-xs font-semibold text-[var(--color-muted)]">Workspace</p><h1 className="font-black">{current}</h1></div>
          <div className="flex items-center gap-2">
            {hasPermission(user, 'notifications.view') && <Link href="/admin/notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-black/[0.06] bg-white text-[var(--color-muted)] shadow-sm hover:text-[var(--color-primary)]" aria-label="Open notifications"><Bell size={18} /></Link>}
            <div className="hidden text-right md:block"><p className="text-sm font-black leading-4">{user.name}</p><p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-secondary)]">{user.role?.replaceAll('_', ' ')}</p></div>
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-[#19221d] text-sm font-black text-white">{user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name?.slice(0, 1)?.toUpperCase()}</span>
            <button type="button" onClick={signOut} className="grid h-10 w-10 place-items-center rounded-xl border border-black/[0.06] bg-white text-[var(--color-muted)] shadow-sm hover:text-[var(--color-error)]" aria-label="Sign out of admin workspace"><LogOut size={18} /></button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1560px] gap-5 p-3 sm:p-5 lg:grid-cols-[264px_minmax(0,1fr)] lg:p-6">
        <aside className="no-scrollbar overflow-x-auto rounded-2xl border border-black/[0.06] bg-white p-2 shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:p-3">
          <nav className="flex min-w-max gap-1 lg:grid lg:min-w-0" aria-label="Admin sections">
            {groups.map((group) => <div key={group} className="contents lg:block"><p className="mb-1 mt-4 hidden px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-400 first:mt-1 lg:block">{group}</p>{visibleLinks.filter((item) => item.group === group).map(({ label, href, icon: Icon }) => { const active = href === '/admin' ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${active ? 'bg-[#19221d] text-white shadow-md' : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]'}`}><Icon size={18} />{label}</Link> })}</div>)}
          </nav>
          <div className="mt-5 hidden rounded-2xl bg-[#fff1eb] p-4 lg:block"><div className="flex items-center gap-2 text-[var(--color-primary)]"><ShieldCheck size={17} /><p className="text-xs font-extrabold uppercase tracking-[0.15em]">Access protected</p></div><p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">Your navigation only shows the tools enabled for the {user.role?.toLowerCase()} role.</p></div>
        </aside>
        <section className="admin-content min-w-0 rounded-[1.75rem] border border-black/[0.05] bg-[#fafaf8] p-4 shadow-sm sm:p-6 lg:p-8">{children}</section>
      </div>
    </main>
  )
}
