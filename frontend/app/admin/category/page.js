'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Edit3, FolderOpen, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import ConfirmBox from '@/Components/ConfirmBox'
import EditCategory from '@/Components/EditCategory'
import RestrictUser from '@/Components/RestrictUser'
import UploadCategory from '@/Components/UploadCategory'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '@/Components/ui'
import summaryApi from '@/public/common/summaryApi'
import { setAllCategory } from '@/public/store/productSlice'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'

const CategoryPage = () => {
  const user = useSelector((state) => state.user)
  const categories = useSelector((state) => state.product.allCategory)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try { const response = await Axios(summaryApi.getCategory); dispatch(setAllCategory(response.data.data || [])) }
    catch { toast.error('Unable to load categories') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const filtered = useMemo(() => categories.filter((category) => category.name?.toLowerCase().includes(query.toLowerCase())), [categories, query])
  const remove = async () => {
    try { await Axios({ ...summaryApi.deleteCategory, data: { _id: deleteTarget._id } }); toast.success('Category deleted'); setDeleteTarget(null); await load() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to delete category') }
  }

  if (!isAdmin(user.role)) return <RestrictUser />
  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Menu structure" title="Categories" description="Build the top-level groups customers use to explore the menu." action={<Button onClick={() => setCreating(true)}><Plus size={18} /> Add category</Button>} />
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center"><label className="flex min-h-12 max-w-xl items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100"><Search size={18} className="text-[var(--color-muted)]" /><input className="search-field-input min-w-0 flex-1 py-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" /></label><p className="text-sm font-semibold text-[var(--color-muted)]">{filtered.length} of {categories.length} categories</p></div>
      {loading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-64" />)}</div>}
      {!loading && !filtered.length && <EmptyState title={query ? 'No categories match' : 'No categories yet'} description={query ? 'Try a different search term.' : 'Create the first category to start organizing your menu.'} action={!query && <Button onClick={() => setCreating(true)}><Plus size={17} /> Add category</Button>} />}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((category) => <Card key={category._id} className="group overflow-hidden"><div className="relative h-44 bg-[var(--color-surface-soft)]"><img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white/90 text-[var(--color-secondary)] shadow-sm"><FolderOpen size={18} /></span></div><div className="p-4"><h2 className="truncate text-lg font-black">{category.name}</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Storefront category</p><div className="mt-4 flex gap-2 border-t border-black/[0.06] pt-3"><Button className="flex-1" size="sm" variant="outline" onClick={() => setEditData(category)}><Edit3 size={15} /> Edit</Button><Button size="sm" variant="ghost" className="text-red-600" aria-label={`Delete ${category.name}`} onClick={() => setDeleteTarget(category)}><Trash2 size={16} /></Button></div></div></Card>)}</section>
      {creating && <UploadCategory fetchCategory={load} close={() => setCreating(false)} />}
      {editData && <EditCategory fetchCategory={load} close={() => setEditData(null)} data={editData} />}
      {deleteTarget && <ConfirmBox close={() => setDeleteTarget(null)} cancel={() => setDeleteTarget(null)} confirm={remove} />}
    </main>
  )
}

export default CategoryPage
