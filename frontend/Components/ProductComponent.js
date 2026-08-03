'use client'

import { memo, useState } from 'react'
import { Boxes, Edit3, EyeOff, Package, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import EditProduct from './EditProduct'
import ConfirmBox from './ConfirmBox'
import { Button, Card, StatusBadge } from './ui'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { DiscountedPrice } from '@/public/utils/DiscountedPrice'

const ProductComponent = ({ data, fetchProducts }) => {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const remove = async () => {
    try { const response = await Axios({ ...summaryApi.deleteProduct, data: { _id: data._id } }); toast.success(response.data.message); setDeleting(false); await fetchProducts?.() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to delete item') }
  }
  const stock = Number(data.stock || 0)
  const available = data.publish !== false && data.isAvailable !== false && stock > 0
  const hidden = data.publish === false
  const finalPrice = DiscountedPrice(data.price, data.discount)
  const categories = [...(data.category || []), ...(data.subCategory || [])].filter(Boolean)
  const stockProgress = Math.min(100, (stock / 20) * 100)
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-[var(--color-surface-soft)]"><img src={data.image?.[0] || '/assets/favicon.png'} alt={data.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />{Number(data.discount || 0) > 0 && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#19221d] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white"><Sparkles size={11} /> {data.discount}% off</span>}<span className="absolute right-3 top-3">{hidden ? <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white"><EyeOff size={11} /> Hidden</span> : <StatusBadge value={available ? 'AVAILABLE' : 'OUT OF STOCK'} />}</span><p className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-xs font-bold text-white"><Package size={14} /> {data.unit || 'Unit not specified'}</p></div>
      <div className="flex flex-1 flex-col p-4 sm:p-5"><div><h2 className="line-clamp-2 text-lg font-black leading-snug">{data.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[var(--color-muted)]">{data.description || 'No item description has been added.'}</p></div>
        <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">{categories.slice(0, 3).map((category) => <span key={category._id || category.name} className="rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-secondary)]">{category.name}</span>)}{categories.length > 3 && <span className="rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-muted)]">+{categories.length - 3}</span>}</div>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--color-surface-soft)]/60 p-3"><div><p className="text-[11px] text-[var(--color-muted)]">Selling price</p><strong className="mt-1 block text-xl">₹{finalPrice}</strong>{Number(data.discount || 0) > 0 && <span className="text-xs text-neutral-400 line-through">₹{data.price}</span>}</div><div><div className="flex items-center justify-between"><p className="text-[11px] text-[var(--color-muted)]">Stock</p><Boxes size={14} className={stock <= 5 ? 'text-amber-600' : 'text-[var(--color-secondary)]'} /></div><strong className="mt-1 block text-xl">{stock}</strong><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${stock <= 5 ? 'bg-amber-500' : 'bg-[var(--color-secondary)]'}`} style={{ width: `${stockProgress}%` }} /></div></div></div>
        <div className="mt-auto flex gap-2 border-t border-black/[0.06] pt-4"><Button className="flex-1" size="sm" variant="outline" onClick={() => setEditing(true)}><Edit3 size={15} /> Edit item</Button><Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(true)} aria-label={`Delete ${data.name}`}><Trash2 size={16} /></Button></div></div>
      {editing && <EditProduct close={() => setEditing(false)} prData={data} fetchProducts={fetchProducts} />}
      {deleting && <ConfirmBox close={() => setDeleting(false)} cancel={() => setDeleting(false)} confirm={remove} />}
    </Card>
  )
}

export default memo(ProductComponent)
