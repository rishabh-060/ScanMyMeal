'use client'

import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronDown, ChevronUp, Clock3, MapPin, Package, ReceiptText, Store, UtensilsCrossed } from 'lucide-react'
import { Card, EmptyState, PageHeader, StatusBadge } from '@/Components/ui'

const normalizedItems = (order) => order.items?.length ? order.items : [{
  nameSnapshot: order.product_details?.name,
  imageSnapshot: order.product_details?.image || [],
  quantity: 1,
  subtotal: order.totalAmt,
}]

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const activeStatuses = new Set(['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'])
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const friendly = (value) => String(value || 'Order').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

const dateLabel = (value) => {
  const date = new Date(value)
  const now = new Date()
  const today = date.toDateString() === now.toDateString()
  const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const yesterday = date.toDateString() === yesterdayDate.toDateString()
  const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  if (today) return `Today, ${time}`
  if (yesterday) return `Yesterday, ${time}`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const orderDestination = (order) => {
  if (order.orderType === 'DINE_IN') return `Table ${order.table?.tableNumber || 'assigned'}`
  if (order.orderType === 'TAKEAWAY') return 'Takeaway counter'
  return order.deliveryAddress?.addressLine || order.delivery_address?.address_line || 'Delivery address'
}

const TypeIcon = ({ type }) => type === 'DINE_IN' ? <UtensilsCrossed size={15} /> : type === 'TAKEAWAY' ? <Store size={15} /> : <MapPin size={15} />

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.orders)
  const [openOrder, setOpenOrder] = useState('')
  const [filter, setFilter] = useState('all')

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const status = String(order.status || order.order_status || '').toUpperCase()
    if (filter === 'active') return activeStatuses.has(status)
    if (filter === 'completed') return status === 'COMPLETED'
    if (filter === 'cancelled') return status === 'CANCELLED'
    return true
  }), [orders, filter])

  return (
    <main className="space-y-5 lg:p-5">
      <PageHeader eyebrow="Order history" title="My orders" description="Track active orders and quickly review everything you have ordered." action={<span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><ReceiptText size={15} /> {orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>} />

      {orders.length > 0 && <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter orders">{FILTERS.map(({ value, label }) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold ${filter === value ? 'bg-[#19221d] text-white shadow-md' : 'border border-[var(--color-border)] bg-white text-[var(--color-muted)]'}`}>{label}</button>)}</div>}

      {!orders.length && <EmptyState title="No orders yet" description="Your completed checkouts will appear here." />}
      {orders.length > 0 && !visibleOrders.length && <EmptyState title={`No ${filter} orders`} description="Choose another filter to review your order history." />}

      <div className="space-y-3 sm:space-y-4">
        {visibleOrders.map((order) => {
          const items = normalizedItems(order)
          const quantity = items.reduce((total, item) => total + Number(item.quantity || 1), 0)
          const id = order.publicOrderId || order.orderId
          const expanded = openOrder === order._id
          const type = order.orderType || 'LEGACY'
          return (
            <Card key={order._id} className="overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-[var(--color-muted)]"><span className="inline-flex items-center gap-1.5 text-[var(--color-secondary)]"><TypeIcon type={type} /> {friendly(type)}</span><span className="inline-flex shrink-0 items-center gap-1.5"><Clock3 size={14} /> {dateLabel(order.createdAt)}</span></div>

                <div className="mt-3 flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-muted)]">Order ID</p><h2 className="mt-1 break-all text-sm font-black text-[var(--color-secondary)] sm:text-base">{id}</h2></div><strong className="shrink-0 text-lg font-black">{money(order.pricing?.grandTotal ?? order.totalAmt)}</strong></div>

                <div className="mt-3 flex flex-wrap gap-2"><StatusBadge value={order.payment?.status || order.payment_status} /><StatusBadge value={order.status || order.order_status} /></div>

                <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-xl bg-[var(--color-surface-soft)]/65 p-3 text-xs sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><Package size={16} className="text-[var(--color-primary)]" /><span className="font-semibold">{items.length} {items.length === 1 ? 'item' : 'items'} · quantity {quantity}</span><span className="col-span-2 inline-flex min-w-0 items-center gap-1.5 truncate text-[var(--color-muted)] sm:col-span-1"><MapPin size={14} className="shrink-0" /> <span className="truncate">{orderDestination(order)}</span></span></div>
              </div>

              <button type="button" onClick={() => setOpenOrder(expanded ? '' : order._id)} className="flex min-h-12 w-full items-center justify-between border-t border-black/[0.06] bg-[#fafaf8] px-4 text-sm font-bold text-[var(--color-primary)] sm:px-5" aria-expanded={expanded}><span>{expanded ? 'Hide order items' : 'View order items'}</span>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>

              {expanded && <div className="grid gap-3 border-t border-dashed border-[var(--color-border)] bg-white p-4 sm:p-5">{items.map((item, index) => <div key={`${item.product || index}`} className="flex items-center gap-3"><img src={item.imageSnapshot?.[0] || '/assets/favicon.png'} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-black/5" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.nameSnapshot || 'Menu item'}</p><p className="mt-1 text-xs text-[var(--color-muted)]">Quantity {item.quantity || 1}</p></div><strong className="text-sm">{money(item.subtotal)}</strong></div>)}</div>}
            </Card>
          )
        })}
      </div>
    </main>
  )
}

export default MyOrders
