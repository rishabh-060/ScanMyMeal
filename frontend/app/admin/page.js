'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ArrowRight, BadgePercent, BellRing, Boxes, PackageCheck, ShoppingCart, Sparkles, TrendingUp, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { hasPermission } from '@/public/utils/isAdmin'
import { Card, EmptyState, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

export default function AdminDashboard() {
  const user = useSelector((state) => state.user)
  const [summary, setSummary] = useState({ customers: 0, products: 0, orders: 0, activeOffers: 0, unreadNotifications: 0, lowStock: [], revenue: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => { Axios(summaryApi.adminDashboardSummary).then((response) => setSummary(response.data.data)).catch((error) => toast.error(error.response?.data?.message || 'Unable to load workspace summary')).finally(() => setLoading(false)) }, [])
  const stats = [
    { label: 'Customers', value: summary.customers, icon: Users, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Menu items', value: summary.products, icon: PackageCheck, tone: 'bg-orange-50 text-orange-700' },
    { label: 'Orders', value: summary.orders, icon: ShoppingCart, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Active offers', value: summary.activeOffers, icon: BadgePercent, tone: 'bg-violet-50 text-violet-700' },
  ]
  const actions = [
    { label: 'Review orders', description: 'Move incoming orders through preparation and fulfilment.', href: '/admin/upcoming-orders', permission: 'orders.view', icon: ShoppingCart },
    { label: 'Launch an offer', description: 'Schedule a promotion with usage and discount controls.', href: '/admin/offers', permission: 'offers.view', icon: BadgePercent },
    { label: 'Notify the team', description: 'Publish an operational update for staff.', href: '/admin/notifications', permission: 'notifications.view', icon: BellRing },
  ].filter((action) => hasPermission(user, action.permission))

  return (
    <main className="space-y-7">
      <PageHeader eyebrow="Operations overview" title={`Welcome back, ${user.name?.split(' ')[0] || 'Admin'}`} description="A live pulse across customers, orders, stock, campaigns, and team communication." action={hasPermission(user, 'orders.view') && <Link href="/admin/upcoming-orders" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 font-bold text-white shadow-lg">View live orders <ArrowRight size={17} /></Link>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{loading ? [1,2,3,4].map((item) => <Skeleton key={item} className="h-36" />) : stats.map(({ label, value, icon: Icon, tone }) => <Card key={label} className="p-5"><div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon size={21} /></span><TrendingUp size={17} className="text-[var(--color-muted)]" /></div><strong className="mt-6 block text-3xl font-black tracking-tight">{value}</strong><span className="mt-1 block text-sm font-semibold text-[var(--color-muted)]">{label}</span></Card>)}</section>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-black/[0.06] p-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Inventory attention</p><h2 className="mt-2 text-xl font-black">Low-stock items</h2></div><Boxes className="text-[var(--color-secondary)]" /></div>{loading ? <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : summary.lowStock?.length ? <div className="divide-y divide-black/[0.06]">{summary.lowStock.map((product) => <div key={product._id} className="flex items-center gap-3 p-4"><img src={product.image?.[0] || '/assets/favicon.png'} alt="" className="h-11 w-11 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-bold">{product.name}</p><p className="text-xs text-[var(--color-muted)]">{product.stock} units remaining</p></div><StatusBadge value={product.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'} /></div>)}</div> : <div className="p-5"><EmptyState title="Stock looks healthy" description="No products are currently at five units or below." /></div>}</Card>
        <Card className="bg-[#19221d] p-6 text-white"><Sparkles className="text-[#f6bf4b]" /><p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-white/45">Recorded revenue</p><strong className="mt-2 block text-4xl font-black tracking-[-0.04em]">₹{Number(summary.revenue || 0).toLocaleString('en-IN')}</strong><p className="mt-2 text-sm leading-6 text-white/60">Calculated from orders currently recorded for this restaurant.</p><div className="mt-7 rounded-2xl bg-white/8 p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-white/65">Unread team updates</span><strong className="text-2xl">{summary.unreadNotifications || 0}</strong></div></div></Card>
      </div>
      {actions.length > 0 && <section><div className="mb-4"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Quick actions</p><h2 className="mt-2 text-xl font-black">Keep the workspace moving</h2></div><div className="grid gap-4 lg:grid-cols-3">{actions.map(({ label, description, href, icon: Icon }) => <Link key={href} href={href}><Card className="group h-full p-5 transition hover:-translate-y-1 hover:border-orange-200"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-primary)]"><Icon size={20} /></span><h3 className="mt-5 font-black">{label}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">Open tool <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span></Card></Link>)}</div></section>}
    </main>
  )
}
