'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BadgePercent, BarChart3, BellRing, Boxes, IndianRupee, PackageCheck, ReceiptText, ShoppingCart, Sparkles, TrendingUp, UserRound, Users, UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { hasPermission } from '@/public/utils/isAdmin'
import { Card, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const todayRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { from: start.toISOString(), to: end.toISOString() }
}

const AnimatedNumber = ({ value, currency = false }) => {
  const reducedMotion = useReducedMotion()
  const target = Number(value || 0)
  const [display, setDisplay] = useState(reducedMotion ? target : 0)

  useEffect(() => {
    if (reducedMotion) { setDisplay(target); return undefined }
    const startedAt = performance.now()
    let frame
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / 750)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, reducedMotion])

  return <>{currency ? '₹' : ''}{display.toLocaleString('en-IN', { maximumFractionDigits: currency ? 2 : 0 })}</>
}

const initialSummary = {
  customers: 0,
  products: 0,
  orders: 0,
  activeOffers: 0,
  unreadNotifications: 0,
  lowStock: [],
  revenue: 0,
  todayRevenue: 0,
  todayOrders: 0,
  todayItemsSold: 0,
  todayAverageOrder: 0,
  topProducts: [],
  topCustomers: [],
}

export default function AdminDashboard() {
  const user = useSelector((state) => state.user)
  const reducedMotion = useReducedMotion()
  const [summary, setSummary] = useState(initialSummary)
  const [loading, setLoading] = useState(true)

  const loadSummary = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const range = todayRange()
      const response = await Axios({ ...summaryApi.adminDashboardSummary, params: { ...range, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } })
      setSummary({ ...initialSummary, ...response.data.data })
    } catch (error) {
      if (!quiet) toast.error(error.response?.data?.message || 'Unable to load workspace summary')
    } finally { if (!quiet) setLoading(false) }
  }, [])

  useEffect(() => {
    loadSummary()
    const refresh = window.setInterval(() => loadSummary(true), 60_000)
    return () => window.clearInterval(refresh)
  }, [loadSummary])

  const stats = [
    { label: 'Customers', value: summary.customers, icon: Users, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Menu items', value: summary.products, icon: PackageCheck, tone: 'bg-orange-50 text-orange-700' },
    { label: 'All orders', value: summary.orders, icon: ShoppingCart, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Active offers', value: summary.activeOffers, icon: BadgePercent, tone: 'bg-violet-50 text-violet-700' },
  ]
  const actions = [
    { label: 'Review orders', description: 'Move incoming orders through preparation and fulfilment.', href: '/admin/upcoming-orders', permission: 'orders.view', icon: ShoppingCart },
    { label: 'Open reports', description: 'Explore sales performance beyond today’s snapshot.', href: '/admin/reports', permission: 'orders.view', icon: BarChart3 },
    { label: 'Launch an offer', description: 'Schedule a promotion with usage and discount controls.', href: '/admin/offers', permission: 'offers.view', icon: BadgePercent },
    { label: 'Notify the team', description: 'Publish an operational update for staff.', href: '/admin/notifications', permission: 'notifications.view', icon: BellRing },
  ].filter((action) => hasPermission(user, action.permission))
  const reveal = reducedMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

  return (
    <main className="space-y-7">
      <PageHeader eyebrow="Operations overview" title={`Welcome back, ${user.name?.split(' ')[0] || 'Admin'}`} description="Today’s service, customer activity, product demand, stock, and growth tools in one live workspace." action={hasPermission(user, 'orders.view') && <Link href="/admin/reports" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 font-bold text-white shadow-lg hover:-translate-y-0.5 hover:bg-[var(--color-primary-strong)]">View reports <BarChart3 size={17} /></Link>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36" />) : stats.map(({ label, value, icon: Icon, tone }, index) => <motion.div key={label} {...reveal} transition={{ duration: 0.35, delay: index * 0.06 }}><Card className="h-full p-5"><div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon size={21} /></span><TrendingUp size={17} className="text-[var(--color-muted)]" /></div><strong className="mt-6 block text-3xl font-black tracking-tight"><AnimatedNumber value={value} /></strong><span className="mt-1 block text-sm font-semibold text-[var(--color-muted)]">{label}</span></Card></motion.div>)}
      </section>

      <motion.section {...reveal} transition={{ duration: 0.45, delay: 0.12 }}>
        <Card className="relative overflow-hidden !border-white/10 !bg-[#19221d] text-white shadow-[0_24px_60px_rgb(25_34_29_/_0.22)]" style={{ background: 'linear-gradient(120deg, #19221d 0%, #20342a 58%, #3a2a20 100%)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--color-primary)]/20 blur-3xl" />
          <div className="absolute bottom-0 right-[22%] h-40 w-40 rounded-full bg-[#f6bf4b]/10 blur-3xl" />
          <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_18px_rgb(52_211_153_/_0.75)]" /><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-300">Today’s live pulse</p></div><p className="mt-5 text-sm font-semibold text-white/55">Revenue recorded today</p><strong className="mt-1 block text-4xl font-black tracking-[-0.05em] sm:text-5xl"><AnimatedNumber value={summary.todayRevenue} currency /></strong><p className="mt-3 max-w-lg text-sm leading-6 text-white/60">A quick view of today’s reportable orders. Cancelled, failed, and refunded payments are excluded.</p></div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">{[
              ['Orders', summary.todayOrders, ReceiptText], ['Items sold', summary.todayItemsSold, UtensilsCrossed], ['Avg. order', `₹${Number(summary.todayAverageOrder || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, IndianRupee],
            ].map(([label, value, Icon]) => <motion.div key={label} whileHover={reducedMotion ? {} : { y: -4 }} className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)] backdrop-blur sm:min-w-28 sm:p-4"><Icon size={18} className="text-[#ffd166]" /><strong className="mt-4 block truncate text-xl text-white sm:text-2xl">{typeof value === 'number' ? <AnimatedNumber value={value} /> : value}</strong><span className="mt-1 block text-[10px] font-extrabold uppercase tracking-wider text-white/65 sm:text-xs">{label}</span></motion.div>)}</div>
          </div>
        </Card>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-3">
        <motion.div {...reveal} transition={{ duration: 0.4, delay: 0.18 }}><Card className="h-full overflow-hidden"><div className="flex items-center justify-between border-b border-black/[0.06] p-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Today’s demand</p><h2 className="mt-2 text-xl font-black">Top-selling products</h2></div><UtensilsCrossed className="text-[var(--color-secondary)]" /></div>{loading ? <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : summary.topProducts.length ? <div className="divide-y divide-black/[0.06]">{summary.topProducts.map((product, index) => <motion.div key={`${product.productId || product.name}-${index}`} whileHover={reducedMotion ? {} : { x: 4 }} className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-orange-50 text-sm font-black text-orange-700">{product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{product.name}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{product.quantity} sold · ₹{Number(product.revenue || 0).toLocaleString('en-IN')}</p></div><span className="text-xs font-black text-[var(--color-primary)]">#{index + 1}</span></motion.div>)}</div> : <p className="p-8 text-center text-sm leading-6 text-[var(--color-muted)]">Product rankings will appear after today’s first order.</p>}</Card></motion.div>

        <motion.div {...reveal} transition={{ duration: 0.4, delay: 0.24 }}><Card className="h-full overflow-hidden"><div className="flex items-center justify-between border-b border-black/[0.06] p-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Customer spotlight</p><h2 className="mt-2 text-xl font-black">Top customers</h2></div><UserRound className="text-[var(--color-secondary)]" /></div>{loading ? <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : summary.topCustomers.length ? <div className="divide-y divide-black/[0.06]">{summary.topCustomers.map((customer, index) => <motion.div key={customer.userId} whileHover={reducedMotion ? {} : { x: 4 }} className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-50 text-sm font-black text-emerald-700">{customer.avatar ? <img src={customer.avatar} alt="" className="h-full w-full object-cover" /> : customer.name?.slice(0, 1)?.toUpperCase() || '?'}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{customer.name || 'Customer'}</p><p className="mt-1 truncate text-xs text-[var(--color-muted)]">{customer.orderCount} {customer.orderCount === 1 ? 'order' : 'orders'} · ₹{Number(customer.spend || 0).toLocaleString('en-IN')}</p></div><span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--color-surface-soft)] text-xs font-black">{index + 1}</span></motion.div>)}</div> : <p className="p-8 text-center text-sm leading-6 text-[var(--color-muted)]">Customer rankings will appear after today’s first order. Staff accounts are excluded.</p>}</Card></motion.div>

        <motion.div {...reveal} transition={{ duration: 0.4, delay: 0.3 }}><Card className="h-full overflow-hidden"><div className="flex items-center justify-between border-b border-black/[0.06] p-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Inventory attention</p><h2 className="mt-2 text-xl font-black">Low-stock items</h2></div><Boxes className="text-[var(--color-secondary)]" /></div>{loading ? <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : summary.lowStock?.length ? <div className="divide-y divide-black/[0.06]">{summary.lowStock.map((product) => <motion.div key={product._id} whileHover={reducedMotion ? {} : { x: 4 }} className="flex items-center gap-3 p-4"><img src={product.image?.[0] || '/assets/favicon.png'} alt="" className="h-10 w-10 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{product.name}</p><p className="text-xs text-[var(--color-muted)]">{product.stock} units remaining</p></div><StatusBadge value={product.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'} /></motion.div>)}</div> : <p className="p-8 text-center text-sm text-[var(--color-muted)]">Stock looks healthy.</p>}</Card></motion.div>
      </div>

      {actions.length > 0 && <section><div className="mb-4"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Quick actions</p><h2 className="mt-2 text-xl font-black">Keep the workspace moving</h2></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{actions.map(({ label, description, href, icon: Icon }, index) => <motion.div key={href} {...reveal} transition={{ duration: 0.35, delay: 0.3 + index * 0.05 }} whileHover={reducedMotion ? {} : { y: -4 }}><Link href={href} className="block h-full"><Card className="group h-full p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-primary)]"><Icon size={20} /></span><h3 className="mt-5 font-black">{label}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">Open tool <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span></Card></Link></motion.div>)}</div></section>}
    </main>
  )
}
