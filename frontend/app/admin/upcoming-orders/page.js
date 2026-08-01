'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3, RefreshCw, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import ManageOrder from '@/Components/ManageOrder'
import { Button, Card, EmptyState, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const ORDER_STATUSES = ['LIVE', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']
const ORDER_TYPES = ['DELIVERY', 'DINE_IN', 'TAKEAWAY']
const PAYMENT_STATUSES = ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']

const todayInput = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const todayRange = () => {
  const [year, month, day] = todayInput().split('-').map(Number)
  const start = new Date(year, month - 1, day)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { from: start.toISOString(), to: end.toISOString() }
}

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const friendly = (value) => String(value || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

const SelectField = ({ label, value, onChange, children }) => (
  <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)]">{label}<select value={value} onChange={onChange} className="min-h-11 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold normal-case tracking-normal text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-orange-100">{children}</select></label>
)

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('LIVE')
  const [orderType, setOrderType] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [windowFilter, setWindowFilter] = useState('24h')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 0 })
  const [selected, setSelected] = useState(null)

  const orderParams = useMemo(() => {
    const params = { search: search || undefined, status: status || undefined, orderType: orderType || undefined, paymentStatus: paymentStatus || undefined, window: windowFilter, page, limit: 20 }
    if (windowFilter === 'today') Object.assign(params, todayRange())
    return params
  }, [search, status, orderType, paymentStatus, windowFilter, page])

  const loadOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const response = await Axios({ ...summaryApi.upcomingOrders, params: orderParams })
      setOrders(response.data.data || [])
      setPagination(response.data.pagination || { total: 0, pages: 0 })
    } catch (error) {
      if (!quiet) toast.error(error.response?.data?.message || 'Unable to load orders')
    } finally { if (!quiet) setLoading(false) }
  }, [orderParams])

  useEffect(() => {
    const debounce = window.setTimeout(() => loadOrders(false), 250)
    const poll = window.setInterval(() => loadOrders(true), 10_000)
    return () => { window.clearTimeout(debounce); window.clearInterval(poll) }
  }, [loadOrders])

  const resetPage = (setter) => (event) => { setter(event.target.value); setPage(1) }
  const setQuickFilter = (nextWindow, nextStatus) => { setWindowFilter(nextWindow); setStatus(nextStatus); setPage(1) }
  const activeQuick = windowFilter === '12h' && status === 'LIVE' ? 'live12' : windowFilter === '24h' && status === 'LIVE' ? 'live24' : windowFilter === 'today' && !status ? 'today' : windowFilter === 'all' && !status ? 'all' : ''

  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Live service" title="Orders" description="Manage the current queue with focused time windows, automatic refresh, and complete order-history filters." action={<Button variant="outline" onClick={() => loadOrders(false)} loading={loading}><RefreshCw size={17} /> Refresh</Button>} />

      <Card className="overflow-hidden">
        <div className="border-b border-black/[0.06] p-4 sm:p-5"><div className="flex flex-wrap gap-2">{[
          ['live12', '12h live', '12h', 'LIVE'], ['live24', '24h live', '24h', 'LIVE'], ['today', 'Today', 'today', ''], ['all', 'All orders', 'all', ''],
        ].map(([key, label, nextWindow, nextStatus]) => <button type="button" key={key} onClick={() => setQuickFilter(nextWindow, nextStatus)} className={`min-h-9 rounded-full px-3.5 text-xs font-extrabold ${activeQuick === key ? 'bg-[var(--color-primary)] text-white shadow-md' : 'border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}>{label}</button>)}</div></div>
        <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(145px,.7fr))]">
          <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)]">Search<div className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100"><Search size={17} /><input value={search} onChange={resetPage(setSearch)} placeholder="Order ID or phone" className="search-field-input min-w-0 flex-1 text-sm font-medium normal-case tracking-normal" /></div></label>
          <SelectField label="Status" value={status} onChange={resetPage(setStatus)}><option value="">All statuses</option>{ORDER_STATUSES.map((value) => <option key={value} value={value}>{friendly(value)}</option>)}</SelectField>
          <SelectField label="Order type" value={orderType} onChange={resetPage(setOrderType)}><option value="">All types</option>{ORDER_TYPES.map((value) => <option key={value} value={value}>{friendly(value)}</option>)}</SelectField>
          <SelectField label="Payment" value={paymentStatus} onChange={resetPage(setPaymentStatus)}><option value="">All payments</option>{PAYMENT_STATUSES.map((value) => <option key={value} value={value}>{friendly(value)}</option>)}</SelectField>
        </div>
      </Card>

      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="text-xl font-black">{status === 'LIVE' ? 'Live order queue' : 'Order history'}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">{pagination.total} matching {pagination.total === 1 ? 'order' : 'orders'} · refreshed every 10 seconds</p></div>{windowFilter !== 'all' && <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live monitoring</span>}</div>

      {loading && <div className="grid gap-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-40" />)}</div>}
      {!loading && !orders.length && <EmptyState title="No matching orders" description={status === 'LIVE' ? 'There are no active orders in this time window. Try Today or All orders to review history.' : 'Adjust the filters to find older orders.'} />}
      {!loading && orders.length > 0 && <div className="grid gap-4 xl:grid-cols-2">
        {orders.map((order) => {
          const destination = order.table?.tableNumber ? `Table ${order.table.tableNumber}` : order.deliveryAddress?.addressLine || (order.orderType === 'TAKEAWAY' ? 'Takeaway counter' : 'Address unavailable')
          const itemCount = order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 1
          return <Card key={order._id} role="button" tabIndex={0} className="group cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg" onClick={() => setSelected(order)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelected(order) }}>
            <div className="p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-primary)]">{friendly(order.orderType || 'LEGACY')}</p><h3 className="mt-1 font-black text-[var(--color-text)]">{order.publicOrderId || order.orderId}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]"><Clock3 size={14} /> {new Date(order.createdAt).toLocaleString('en-IN')}</p></div><div className="flex flex-wrap gap-2"><StatusBadge value={order.payment?.status || order.payment_status} /><StatusBadge value={order.status || order.order_status} /></div></div>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--color-surface-soft)]/55 p-4 text-sm"><div><p className="text-xs text-[var(--color-muted)]">Customer</p><p className="mt-1 truncate font-bold">{order.userId?.name || 'Customer'}</p></div><div><p className="text-xs text-[var(--color-muted)]">Fulfilment</p><p className="mt-1 truncate font-bold">{destination}</p></div><div><p className="text-xs text-[var(--color-muted)]">Items</p><p className="mt-1 font-bold">{itemCount}</p></div><div><p className="text-xs text-[var(--color-muted)]">Total</p><p className="mt-1 font-black">{money(order.pricing?.grandTotal ?? order.totalAmt)}</p></div></div>
              {order.items?.length > 0 && <p className="mt-4 truncate text-xs text-[var(--color-muted)]">{order.items.slice(0, 3).map((item) => `${item.quantity}× ${item.nameSnapshot}`).join(' · ')}{order.items.length > 3 ? ` · +${order.items.length - 3} more` : ''}</p>}
            </div><div className="flex items-center justify-between border-t border-black/[0.06] bg-[#fafaf8] px-5 py-3 text-xs font-bold text-[var(--color-muted)]"><span>Open order details</span><ArrowRight size={16} className="transition group-hover:translate-x-1 group-hover:text-[var(--color-primary)]" /></div>
          </Card>
        })}
      </div>}
      {pagination.pages > 1 && <div className="flex items-center justify-center gap-3"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ArrowLeft size={16} /> Previous</Button><span className="text-sm font-bold text-[var(--color-muted)]">Page {page} of {pagination.pages}</span><Button variant="outline" disabled={page >= pagination.pages} onClick={() => setPage((value) => value + 1)}>Next <ArrowRight size={16} /></Button></div>}

      {selected && <ManageOrder data={selected} close={() => setSelected(null)} fetchUpcomingOrders={() => loadOrders(false)} />}
    </main>
  )
}

export default AdminOrdersPage
