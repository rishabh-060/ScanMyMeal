'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock3, PackageCheck, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-toastify'
import AddToCartButton from '@/Components/AddToCartButton'
import { Card, EmptyState, Skeleton, StatusBadge } from '@/Components/ui'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import { DiscountedPrice } from '@/public/utils/DiscountedPrice'

const ProductOverview = () => {
  const params = useParams()
  const productId = String(params?.product_id || '').split('-').at(-1)
  const [data, setData] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) return
    let mounted = true
    setLoading(true); setError('')
    Axios({ ...summaryApi.getProductDetails, data: { productId } })
      .then((response) => mounted && setData(response.data.data))
      .catch((requestError) => {
        const message = requestError.response?.data?.message || 'This menu item could not be loaded.'
        if (mounted) setError(message)
        toast.error(message)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [productId])

  if (loading) return <main className="page-container grid gap-6 py-8 lg:grid-cols-[1.15fr_0.85fr]"><Skeleton className="h-[34rem]" /><div className="grid content-start gap-4"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-28" /><Skeleton className="h-56" /></div></main>
  if (error || !data) return <main className="page-container py-10"><EmptyState title="Item unavailable" description={error || 'This item may have been removed from the menu.'} action={<Link href="/" className="font-bold text-[var(--color-primary)]">Return to the menu</Link>} /></main>

  const images = data.image?.filter(Boolean) || []
  const price = DiscountedPrice(data.price, data.discount)
  const available = data.publish !== false && data.isAvailable !== false && Number(data.stock || 0) > 0
  const details = Object.entries(data.more_details || {}).filter(([, value]) => value !== '' && value != null)

  return (
    <main className="page-container py-6 sm:py-9">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-primary)]"><ArrowLeft size={17} /> Back to menu</Link>
      <div className="grid items-start gap-7 lg:grid-cols-[1.12fr_0.88fr]">
        <section>
          <Card className="overflow-hidden p-3 sm:p-4">
            <div className="relative h-[22rem] overflow-hidden rounded-[1.5rem] bg-[var(--color-surface-soft)] sm:h-[32rem]">
              {images[activeImage] ? <img src={images[activeImage]} alt={data.name} className="h-full w-full object-cover transition duration-500" /> : <div className="grid h-full place-items-center text-[var(--color-muted)]"><UtensilsCrossed size={48} /></div>}
              {Number(data.discount || 0) > 0 && <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#19221d] px-3 py-2 text-xs font-black uppercase tracking-wide text-white"><Sparkles size={14} /> {data.discount}% off</span>}
            </div>
          </Card>
          {images.length > 1 && <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">{images.map((src, index) => <button key={src} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`} aria-pressed={activeImage === index} className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1 transition ${activeImage === index ? 'border-[var(--color-primary)] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={src} alt="" className="h-full w-full rounded-xl object-cover" /></button>)}</div>}
        </section>

        <Card className="sticky top-24 overflow-hidden">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge value={available ? 'AVAILABLE' : 'OUT OF STOCK'} /><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><Clock3 size={13} /> Freshly prepared</span></div>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">{data.name}</h1>
            <p className="mt-2 font-semibold text-[var(--color-muted)]">{data.unit}</p>
            <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">{data.description || 'Prepared fresh and ready to add to your order.'}</p>
            <div className="my-6 flex items-end justify-between gap-4 border-y border-black/[0.06] py-5"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-muted)]">Your price</p><div className="mt-1 flex items-baseline gap-2"><strong className="text-3xl tracking-tight">₹{price}</strong>{Number(data.discount || 0) > 0 && <span className="text-sm font-semibold text-neutral-400 line-through">₹{data.price}</span>}</div></div>{available && <span className="text-xs font-semibold text-emerald-700">{data.stock} in stock</span>}</div>
            {available ? <div className="[&_button]:min-h-12 [&_button]:min-w-32 [&_button]:text-base"><AddToCartButton data={data} /></div> : <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">This item is temporarily unavailable. Check back soon.</div>}
          </div>
          <div className="grid gap-3 border-t border-black/[0.06] bg-[var(--color-surface-soft)]/60 p-5 sm:grid-cols-3">
            {[['Made fresh', UtensilsCrossed], ['Secure checkout', ShieldCheck], ['Live availability', PackageCheck]].map(([label, Icon]) => <div key={label} className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)]"><Icon size={17} className="text-[var(--color-secondary)]" />{label}</div>)}
          </div>
        </Card>
      </div>
      {details.length > 0 && <section className="mt-10"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary)]">Good to know</p><h2 className="mt-2 text-2xl font-black">Item details</h2></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{details.map(([key, value]) => <Card key={key} className="p-5"><p className="text-xs font-extrabold uppercase tracking-wide text-[var(--color-muted)]">{key}</p><p className="mt-2 font-semibold leading-6">{String(value)}</p></Card>)}</div></section>}
    </main>
  )
}

export default ProductOverview
