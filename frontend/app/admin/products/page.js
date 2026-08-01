'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronLeft, ChevronRight, PackageOpen, Plus, Search, X } from 'lucide-react'
import { toast } from 'react-toastify'
import ProductComponent from '@/Components/ProductComponent'
import RestrictUser from '@/Components/RestrictUser'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '@/Components/ui'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'

const ProductList = () => {
  const user = useSelector((state) => state.user)
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await Axios({ ...summaryApi.getProduct, data: { page, limit: 12, search: search.trim() } })
      setProducts(response.data.data || [])
      setTotalPages(Math.max(1, Number(response.data.totalNoPage || 1)))
      setTotalCount(Number(response.data.totalCount || 0))
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to load menu items') }
    finally { setLoading(false) }
  }
  useEffect(() => { const timer = window.setTimeout(fetchProducts, search ? 300 : 0); return () => window.clearTimeout(timer) }, [page, search])
  if (!isAdmin(user.role)) return <RestrictUser />

  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Menu management" title="Menu items" description="Search, review, price, and update everything customers can order." action={<Link href="/admin/add-product" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 font-bold text-white shadow-lg"><Plus size={18} /> Add menu item</Link>} />
      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100"><Search size={19} className="text-[var(--color-muted)]" /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} className="search-field-input min-w-0 flex-1 py-3" placeholder="Search by item name or description" />{search && <button onClick={() => setSearch('')} aria-label="Clear search" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-white"><X size={16} /></button>}</label><div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3"><PackageOpen size={18} className="text-[var(--color-secondary)]" /><div><strong>{totalCount}</strong><p className="text-[11px] text-[var(--color-muted)]">menu items</p></div></div></Card>
      {loading && <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-80" />)}</section>}
      {!loading && !products.length && <EmptyState title={search ? 'No matching menu items' : 'No menu items yet'} description={search ? 'Try a broader search or clear the current query.' : 'Add your first item to start building the menu.'} action={search ? <Button variant="outline" onClick={() => setSearch('')}>Clear search</Button> : <Link href="/admin/add-product" className="font-bold text-[var(--color-primary)]">Add menu item</Link>} />}
      {!loading && products.length > 0 && <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductComponent key={product._id} data={product} fetchProducts={fetchProducts} />)}</section>}
      {!loading && totalPages > 1 && <nav className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-3" aria-label="Menu item pages"><Button variant="ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={17} /> Previous</Button><p className="text-sm font-bold">Page {page} <span className="text-[var(--color-muted)]">of {totalPages}</span></p><Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={17} /></Button></nav>}
    </main>
  )
}

export default ProductList
