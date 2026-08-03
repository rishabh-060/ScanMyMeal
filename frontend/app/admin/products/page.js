'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, EyeOff, PackageOpen, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'react-toastify'
import ProductComponent from '@/Components/ProductComponent'
import RestrictUser from '@/Components/RestrictUser'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '@/Components/ui'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'

const FILTERS = [
  { value: 'all', label: 'All items', key: 'total', icon: PackageOpen, tone: 'bg-blue-50 text-blue-700' },
  { value: 'available', label: 'Available', key: 'available', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  { value: 'low_stock', label: 'Low stock', key: 'lowStock', icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700' },
  { value: 'hidden', label: 'Hidden', key: 'hidden', icon: EyeOff, tone: 'bg-neutral-100 text-neutral-700' },
]

const ProductList = () => {
  const user = useSelector((state) => state.user)
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('newest')
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, available: 0, lowStock: 0, outOfStock: 0, hidden: 0 })
  const requestId = useRef(0)

  const fetchProducts = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    try {
      const response = await Axios({ ...summaryApi.getProduct, data: { page, limit: 12, search: search.trim(), status, sort } })
      if (currentRequest !== requestId.current) return
      setProducts(response.data.data || [])
      setTotalPages(Math.max(1, Number(response.data.totalNoPage || 1)))
      setTotalCount(Number(response.data.totalCount || 0))
      setStats((current) => ({ ...current, ...(response.data.stats || {}) }))
    } catch (error) {
      if (currentRequest === requestId.current) toast.error(error.response?.data?.message || 'Unable to load menu items')
    } finally { if (currentRequest === requestId.current) setLoading(false) }
  }, [page, search, sort, status])

  useEffect(() => { const timer = window.setTimeout(fetchProducts, search ? 300 : 0); return () => window.clearTimeout(timer) }, [fetchProducts, search])
  if (!isAdmin(user.role)) return <RestrictUser />

  const chooseFilter = (value) => { setStatus(value); setPage(1) }

  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Menu management" title="Menu items" description="Review availability, stock, pricing, categories, and visibility across the complete customer menu." action={<Link href="/admin/add-product" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 font-bold text-white shadow-lg hover:-translate-y-0.5 hover:bg-[var(--color-primary-strong)]"><Plus size={18} /> Add menu item</Link>} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{FILTERS.map(({ value, label, key, icon: Icon, tone }) => <button key={value} type="button" onClick={() => chooseFilter(value)} className={`rounded-2xl border p-3 text-left transition sm:p-4 ${status === value ? 'border-[var(--color-primary)] bg-[#fff7f3] shadow-[0_10px_28px_rgb(234_91_53_/_0.1)] ring-2 ring-orange-100' : 'border-black/[0.06] bg-white shadow-sm hover:-translate-y-0.5 hover:border-orange-200'}`}><div className="flex items-center justify-between gap-2"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon size={17} /></span><strong className="text-xl font-black">{stats[key] || 0}</strong></div><span className="mt-3 block text-xs font-bold text-[var(--color-muted)] sm:text-sm">{label}</span></button>)}</section>

      <Card className="grid gap-3 p-4 lg:grid-cols-[minmax(240px,1fr)_220px_190px] lg:items-end">
        <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)]">Search menu<div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100"><Search size={18} /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} className="search-field-input min-w-0 flex-1 py-3 text-sm font-medium normal-case tracking-normal" placeholder="Name or description" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-white"><X size={16} /></button>}</div></label>
        <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)]">Availability<select value={status} onChange={(event) => chooseFilter(event.target.value)} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold normal-case tracking-normal text-[var(--color-text)]"><option value="all">All menu items</option><option value="available">Available</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option><option value="hidden">Hidden</option></select></label>
        <label className="grid gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-muted)]">Sort by<div className="relative"><SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" /><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-3 text-sm font-semibold normal-case tracking-normal text-[var(--color-text)]"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name_asc">Name A–Z</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option><option value="stock_low">Lowest stock</option></select></div></label>
      </Card>

      <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">{FILTERS.find((item) => item.value === status)?.label || 'Menu items'}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">{totalCount} matching {totalCount === 1 ? 'item' : 'items'}</p></div></div>
      {loading && <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[27rem]" />)}</section>}
      {!loading && !products.length && <EmptyState title={search ? 'No matching menu items' : `No ${status === 'all' ? '' : FILTERS.find((item) => item.value === status)?.label.toLowerCase()} items`} description={search ? 'Try a broader search or clear the current query.' : 'Choose another availability filter or add a new menu item.'} action={search ? <Button variant="outline" onClick={() => setSearch('')}>Clear search</Button> : <Link href="/admin/add-product" className="font-bold text-[var(--color-primary)]">Add menu item</Link>} />}
      {!loading && products.length > 0 && <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{products.map((product) => <ProductComponent key={product._id} data={product} fetchProducts={fetchProducts} />)}</section>}
      {!loading && totalPages > 1 && <nav className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-3" aria-label="Menu item pages"><Button variant="ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={17} /> Previous</Button><p className="text-sm font-bold">Page {page} <span className="text-[var(--color-muted)]">of {totalPages}</span></p><Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={17} /></Button></nav>}
    </main>
  )
}

export default ProductList
