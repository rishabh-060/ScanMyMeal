'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, CheckCircle2, CreditCard, Download, IndianRupee, PackageCheck, ReceiptText, RefreshCw, ShoppingBag, TrendingUp, UtensilsCrossed, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import TrendChart from '@/Components/admin/TrendChart'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '@/Components/ui'

const PERIODS = [
  { value: 'day', label: 'Day', detail: 'Hourly trend' },
  { value: 'week', label: 'Week', detail: 'Daily trend' },
  { value: 'month', label: 'Month', detail: 'Daily trend' },
  { value: 'year', label: 'Year', detail: 'Monthly trend' },
]

const todayInput = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const periodRange = (period, value) => {
  const [year, month, day] = value.split('-').map(Number)
  const start = new Date(year, month - 1, day)
  const end = new Date(start)
  if (period === 'week') {
    const weekday = start.getDay() || 7
    start.setDate(start.getDate() - weekday + 1)
    end.setTime(start.getTime())
    end.setDate(end.getDate() + 7)
  } else if (period === 'month') {
    start.setDate(1)
    end.setTime(start.getTime())
    end.setMonth(end.getMonth() + 1)
  } else if (period === 'year') {
    start.setMonth(0, 1)
    end.setTime(start.getTime())
    end.setFullYear(end.getFullYear() + 1)
  } else {
    end.setDate(end.getDate() + 1)
  }
  return { from: start.toISOString(), to: end.toISOString(), start, end }
}

const shiftDate = (value, period, direction) => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (period === 'year') date.setFullYear(date.getFullYear() + direction)
  else if (period === 'month') date.setMonth(date.getMonth() + direction)
  else date.setDate(date.getDate() + direction * (period === 'week' ? 7 : 1))
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const friendly = (value) => String(value || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

const rangeLabel = ({ start, end }, period) => {
  const last = new Date(end.getTime() - 1)
  if (period === 'day') return start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  if (period === 'month') return start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  if (period === 'year') return String(start.getFullYear())
  return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${last.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const MetricCard = ({ label, value, note, icon: Icon, tone }) => (
  <Card className="p-5"><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon size={21} /></span><TrendingUp size={17} className="text-[var(--color-muted)]" /></div><strong className="mt-5 block text-3xl font-black tracking-[-0.04em]">{value}</strong><span className="mt-1 block text-sm font-bold">{label}</span><p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{note}</p></Card>
)

const Breakdown = ({ title, icon: Icon, items }) => {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  return <Card className="overflow-hidden"><div className="flex items-center gap-3 border-b border-black/[0.06] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-secondary)]"><Icon size={19} /></span><h3 className="font-black">{title}</h3></div><div className="space-y-4 p-5">{items.length ? items.map((item) => { const width = total ? (item.count / total) * 100 : 0; return <div key={item.label}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="font-bold">{friendly(item.label)}</span><span className="text-[var(--color-muted)]">{item.count} · {money(item.revenue)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-soft)]"><div className="h-full rounded-full bg-[var(--color-secondary)]" style={{ width: `${width}%` }} /></div></div> }) : <p className="py-6 text-center text-sm text-[var(--color-muted)]">No data for this period.</p>}</div></Card>
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('day')
  const [referenceDate, setReferenceDate] = useState(todayInput)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const range = periodRange(period, referenceDate)
      const response = await Axios({ ...summaryApi.adminOrderReports, params: { period, from: range.from, to: range.to, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } })
      setReport(response.data.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to generate report')
    } finally { setLoading(false) }
  }, [period, referenceDate])

  useEffect(() => { loadReport() }, [loadReport])

  const currentRange = periodRange(period, referenceDate)
  const summary = report?.summary || { revenue: 0, orderCount: 0, itemsSold: 0, averageOrderValue: 0, completedOrders: 0, cancelledOrders: 0 }

  const exportReport = () => {
    if (!report) return
    const rows = [
      ['Scan My Meal order report', rangeLabel(currentRange, period)],
      ['Revenue', summary.revenue], ['Orders', summary.orderCount], ['Items sold', summary.itemsSold], ['Average order value', summary.averageOrderValue],
      [], ['Top products'], ['Product', 'Quantity', 'Revenue'],
      ...report.topProducts.map((item) => [item.name, item.quantity, item.revenue]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `scanmymeal-${period}-report-${referenceDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Business intelligence" title="Reports" description="Review revenue, order volume, product sales, fulfilment, and payment performance for any day, week, month, or year." action={<div className="flex flex-wrap gap-2"><Link href="/admin/upcoming-orders" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 font-bold hover:border-[var(--color-primary)] hover:bg-[#fff7f3]"><ReceiptText size={17} /> Live orders</Link><Button variant="outline" onClick={loadReport} loading={loading}><RefreshCw size={17} /> Refresh</Button></div>} />

      <Card className="p-4 sm:p-5"><div className="grid gap-4 lg:grid-cols-[220px_minmax(280px,1fr)_auto] lg:items-end"><label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)]">Trend period<div className="relative"><BarChart3 size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" /><select value={period} onChange={(event) => setPeriod(event.target.value)} className="min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-3 text-sm font-bold normal-case tracking-normal text-[var(--color-text)]">{PERIODS.map(({ value, label, detail }) => <option key={value} value={value}>{label} · {detail}</option>)}</select></div></label><div><p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)]">Reference date</p><div className="flex items-center gap-2"><button type="button" onClick={() => setReferenceDate(shiftDate(referenceDate, period, -1))} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]" aria-label={`Previous ${period}`}><ArrowLeft size={17} /></button><input type="date" aria-label="Report reference date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold" /><button type="button" onClick={() => setReferenceDate(shiftDate(referenceDate, period, 1))} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]" aria-label={`Next ${period}`}><ArrowRight size={17} /></button></div></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { setReferenceDate(todayInput()); setPeriod('day') }}><CalendarDays size={17} /> Today</Button><Button onClick={exportReport} disabled={!report}><Download size={17} /> Export CSV</Button></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] pt-4"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-primary)]">Current selection</span><p className="text-sm font-black">{rangeLabel(currentRange, period)}</p></div></Card>

      {loading && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-40" />)}</div><Skeleton className="h-96" /></>}
      {!loading && report && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total revenue" value={money(summary.revenue)} note="Excludes cancelled, failed, and refunded orders." icon={IndianRupee} tone="bg-emerald-50 text-emerald-700" />
          <MetricCard label="Order count" value={summary.orderCount} note={`${summary.completedOrders} completed · ${summary.cancelledOrders} cancelled`} icon={ReceiptText} tone="bg-blue-50 text-blue-700" />
          <MetricCard label="Items sold" value={summary.itemsSold} note="Quantity across reportable orders." icon={PackageCheck} tone="bg-orange-50 text-orange-700" />
          <MetricCard label="Average order" value={money(summary.averageOrderValue)} note="Revenue divided by all orders in the period." icon={TrendingUp} tone="bg-violet-50 text-violet-700" />
        </section>

        <Card className="overflow-hidden">{report.trend.length ? <TrendChart data={report.trend} period={period} /> : <div className="p-5"><EmptyState title="No sales in this period" description="Choose another date or a broader reporting period." /></div>}</Card>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <Card className="overflow-hidden"><div className="flex items-center gap-3 border-b border-black/[0.06] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-700"><ShoppingBag size={19} /></span><div><h3 className="font-black">Top-selling products</h3><p className="text-xs text-[var(--color-muted)]">Ranked by quantity sold</p></div></div><div className="divide-y divide-black/[0.06]">{report.topProducts.length ? report.topProducts.map((product, index) => <div key={`${product.productId || product.name}-${index}`} className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 p-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-surface-soft)] text-xs font-black">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{product.name}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-soft)]"><div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${Math.max(8, (product.quantity / report.topProducts[0].quantity) * 100)}%` }} /></div></div><div className="text-right"><p className="text-sm font-black">{product.quantity} sold</p><p className="text-xs text-[var(--color-muted)]">{money(product.revenue)}</p></div></div>) : <p className="p-8 text-center text-sm text-[var(--color-muted)]">No product sales for this period.</p>}</div></Card>
          <div className="grid gap-5"><Breakdown title="Order type" icon={UtensilsCrossed} items={report.orderTypes} /><Breakdown title="Payment method" icon={CreditCard} items={report.paymentMethods} /></div>
        </div>

        <Card className="grid gap-4 !bg-[#19221d] p-5 text-white sm:grid-cols-2 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300"><CheckCircle2 size={21} /></span><div><p className="text-xs font-semibold text-white/55">Completed orders</p><strong className="text-2xl">{summary.completedOrders}</strong></div></div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-red-400/15 text-red-300"><XCircle size={21} /></span><div><p className="text-xs font-semibold text-white/55">Cancelled orders</p><strong className="text-2xl">{summary.cancelledOrders}</strong></div></div></Card>
      </>}
    </main>
  )
}
