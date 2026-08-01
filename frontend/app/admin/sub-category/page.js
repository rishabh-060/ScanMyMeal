'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Edit3, Layers3, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import ConfirmBox from '@/Components/ConfirmBox'
import EditSubCategory from '@/Components/EditSubCategory'
import RestrictUser from '@/Components/RestrictUser'
import UploadSubcategory from '@/Components/UploadSubcategory'
import ViewImage from '@/Components/ViewImage'
import { Button, Card, EmptyState, PageHeader, Skeleton } from '@/Components/ui'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'

const SubCategoryPage = () => {
  const user = useSelector((state) => state.user)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [preview, setPreview] = useState('')

  const load = async () => {
    setLoading(true)
    try { const response = await Axios(summaryApi.getSubcategory); setItems(response.data.data || []) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load subcategories') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const filtered = useMemo(() => items.filter((item) => `${item.name} ${item.category?.map((category) => category.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [items, query])
  const remove = async () => {
    try { await Axios({ ...summaryApi.deleteSubcategory, data: { _id: deleteTarget._id } }); toast.success('Subcategory deleted'); setDeleteTarget(null); await load() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to delete subcategory') }
  }
  if (!isAdmin(user.role)) return <RestrictUser />

  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Menu structure" title="Subcategories" description="Create focused collections beneath categories so customers reach the right items faster." action={<Button onClick={() => setCreating(true)}><Plus size={18} /> Add subcategory</Button>} />
      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100"><Search size={18} className="text-[var(--color-muted)]" /><input className="search-field-input min-w-0 flex-1 py-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subcategories or parent categories" /></label><p className="shrink-0 text-sm font-semibold text-[var(--color-muted)]">{filtered.length} of {items.length}</p></Card>
      {loading && <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((item) => <Skeleton key={item} className="h-52" />)}</section>}
      {!loading && !filtered.length && <EmptyState title={query ? 'No subcategories match' : 'No subcategories yet'} description={query ? 'Try another name or parent category.' : 'Add a subcategory to create more focused menu collections.'} />}
      {!loading && <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <Card key={item._id} className="flex gap-4 p-4"><button onClick={() => setPreview(item.image)} className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-soft)]" aria-label={`Preview ${item.name} image`}><img src={item.image} alt="" className="h-full w-full object-cover transition hover:scale-105" /></button><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Layers3 size={17} /></span><div className="min-w-0"><h2 className="truncate font-black">{item.name}</h2><p className="text-xs text-[var(--color-muted)]">Subcategory</p></div></div><div className="mt-3 flex flex-wrap gap-1.5">{item.category?.map((category) => <span key={category._id} className="rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-secondary)]">{category.name}</span>)}</div><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => setEditTarget(item)}><Edit3 size={14} /> Edit</Button><Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleteTarget(item)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></Button></div></div></Card>)}</section>}
      {creating && <UploadSubcategory fetchData={load} close={() => setCreating(false)} />}
      {editTarget && <EditSubCategory editData={editTarget} close={() => setEditTarget(null)} fetchData={load} />}
      {deleteTarget && <ConfirmBox cancel={() => setDeleteTarget(null)} close={() => setDeleteTarget(null)} confirm={remove} />}
      {preview && <ViewImage url={preview} close={() => setPreview('')} />}
    </main>
  )
}

export default SubCategoryPage
