'use client'

import { useState } from 'react'
import { Edit3, Package, Sparkles, Trash2 } from 'lucide-react'
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
  const available = data.publish !== false && data.isAvailable !== false && Number(data.stock || 0) > 0
  const finalPrice = DiscountedPrice(data.price, data.discount)
  return (
    <Card className="group flex h-full flex-col overflow-hidden">
      <div className="relative h-44 overflow-hidden bg-[var(--color-surface-soft)]"><img src={data.image?.[0]} alt={data.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />{Number(data.discount || 0) > 0 && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#19221d] px-2.5 py-1 text-[10px] font-black uppercase text-white"><Sparkles size={11} /> {data.discount}% off</span>}<span className="absolute right-3 top-3"><StatusBadge value={available ? 'AVAILABLE' : 'OUT OF STOCK'} /></span></div>
      <div className="flex flex-1 flex-col p-4"><h2 className="line-clamp-1 text-lg font-black">{data.name}</h2><p className="mt-1 line-clamp-1 text-xs text-[var(--color-muted)]">{data.unit || 'No unit specified'}</p><div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-[var(--color-muted)]">Selling price</p><strong className="text-xl">₹{finalPrice}</strong>{Number(data.discount || 0) > 0 && <span className="ml-2 text-xs text-neutral-400 line-through">₹{data.price}</span>}</div><div className="text-right"><p className="text-xs text-[var(--color-muted)]">Stock</p><span className="inline-flex items-center gap-1 font-bold"><Package size={14} /> {data.stock || 0}</span></div></div><div className="mt-auto flex gap-2 border-t border-black/[0.06] pt-4"><Button className="flex-1" size="sm" variant="outline" onClick={() => setEditing(true)}><Edit3 size={15} /> Edit item</Button><Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleting(true)} aria-label={`Delete ${data.name}`}><Trash2 size={16} /></Button></div></div>
      {editing && <EditProduct close={() => setEditing(false)} prData={data} fetchProducts={fetchProducts} />}
      {deleting && <ConfirmBox close={() => setDeleting(false)} cancel={() => setDeleting(false)} confirm={remove} />}
    </Card>
  )
}

export default ProductComponent
