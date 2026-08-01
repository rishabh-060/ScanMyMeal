'use client'

import Link from 'next/link'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { ValidUrlConvert } from '@/public/utils/ValidUrlConvert'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({ data }) => {
  if (!data?._id) return null
  const url = `/product/${ValidUrlConvert(data.name)}-${data._id}`
  const discount = Number(data.discount || 0)
  const available = data.publish !== false && data.isAvailable !== false && Number(data.stock || 0) > 0
  return (
    <article className="group w-56 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-black/[0.06] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <Link href={url} className="block p-2.5 pb-0">
        <div className="relative h-38 overflow-hidden rounded-2xl bg-[var(--color-surface-soft)]"><img src={data.image?.[0]} alt={data.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />{discount > 0 && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#19221d] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white"><Sparkles size={11} /> {discount}% off</span>}<span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[var(--color-text)] opacity-0 shadow-sm transition group-hover:opacity-100"><ArrowUpRight size={16} /></span></div>
        <div className="px-1 pt-3"><h3 className="line-clamp-1 font-extrabold text-[var(--color-text)]">{data.name}</h3><div className="mt-1.5 flex items-center justify-between gap-2 text-xs"><span className="text-[var(--color-muted)]">{data.unit}</span><span className={`rounded-full px-2 py-0.5 font-bold ${available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{available ? 'Available' : 'Unavailable'}</span></div></div>
      </Link>
      <div className="flex items-center justify-between gap-2 p-3"><strong className="text-lg tracking-tight">₹{data.price}</strong>{available ? <AddToCartButton data={data} /> : <span className="text-xs font-bold text-[var(--color-error)]">Unavailable</span>}</div>
    </article>
  )
}

export default CardProduct
