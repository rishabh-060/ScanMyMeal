'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, CheckCircle2, Clock3, Home, ReceiptText, ShoppingBag, XCircle } from 'lucide-react'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Card, Skeleton, StatusBadge } from '@/Components/ui'
import { useGlobalContext } from '@/provider/GlobalProvider'

const SuccessPage = () => {
  const orderId = useSearchParams().get('orderId')
  const { fetchCartItem, fetchOrder } = useGlobalContext()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) { setError('Order reference is missing.'); return }
    let mounted = true; let attempts = 0; let timer
    const load = async () => {
      attempts += 1
      try {
        const response = await Axios(summaryApi.orderDetails(orderId))
        if (!mounted) return
        const nextOrder = response.data.data
        setOrder(nextOrder)
        await Promise.allSettled([fetchCartItem?.(), fetchOrder?.()])
        if (nextOrder.payment?.status === 'PENDING' && attempts < 10) timer = window.setTimeout(load, 2000)
      } catch (requestError) { if (mounted) setError(requestError.response?.data?.message || 'Unable to verify this order.') }
    }
    load()
    return () => { mounted = false; window.clearTimeout(timer) }
  }, [orderId])

  const paymentStatus = order?.payment?.status || order?.payment_status
  const paid = paymentStatus === 'PAID'
  const failed = ['FAILED', 'CANCELLED'].includes(paymentStatus)
  const pending = !error && !paid && !failed
  const total = order?.pricing?.grandTotal ?? order?.totalAmt
  const itemCount = order?.items?.reduce((sum, item) => sum + Number(item.quantity || 1), 0)

  return (
    <main className="min-h-[74vh] bg-[var(--color-background)] py-8 sm:py-12">
      <div className="page-container max-w-4xl">
        <Card className="overflow-hidden">
          <div className={`grid place-items-center px-6 py-10 text-center ${error || failed ? 'bg-red-50' : paid ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <span className={`grid h-20 w-20 place-items-center rounded-[1.75rem] bg-white shadow-sm ${error || failed ? 'text-red-600' : paid ? 'text-emerald-600' : 'text-amber-600'}`}>{error || failed ? <XCircle size={44} /> : paid ? <CheckCircle2 size={44} /> : <Clock3 className="animate-pulse" size={42} />}</span>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-muted)]">{error || failed ? 'Action needed' : paid ? 'Order confirmed' : 'Secure verification'}</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{error ? 'We couldn’t verify this order' : paid ? 'Your order is in!' : failed ? 'Payment wasn’t completed' : order ? 'Order received' : 'Checking your payment'}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">{error || (paid ? 'The kitchen has your order. You can follow every update from your order history.' : failed ? 'No successful payment was recorded. You can safely return and try again.' : 'This usually takes only a few seconds. Please keep this page open.')}</p>
            {order && <div className="mt-5 flex flex-wrap justify-center gap-2"><StatusBadge value={paymentStatus} /><StatusBadge value={order.status || order.order_status} /></div>}
          </div>

          {!order && !error && <div className="grid gap-3 p-6 sm:p-8"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>}
          {order && <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr]">
            <section><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-secondary)]"><ReceiptText size={21} /></span><div><p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Order reference</p><strong>{order.publicOrderId || order.orderId}</strong></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[var(--color-surface-soft)] p-4"><p className="text-xs text-[var(--color-muted)]">Items</p><strong className="mt-1 block text-xl">{itemCount || order.items?.length || 0}</strong></div><div className="rounded-2xl bg-[var(--color-surface-soft)] p-4"><p className="text-xs text-[var(--color-muted)]">Total</p><strong className="mt-1 block text-xl">₹{total ?? '—'}</strong></div></div></section>
            <section className="rounded-2xl border border-black/[0.06] p-5"><h2 className="font-black">What happens next?</h2><div className="mt-4 grid gap-3">{['Payment and order details are recorded', 'Kitchen preparation updates appear in My orders', 'You can return to the menu at any time'].map((text) => <div key={text} className="flex gap-3 text-sm leading-5 text-[var(--color-muted)]"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={14} /></span>{text}</div>)}</div></section>
          </div>}
          <div className="flex flex-col justify-center gap-3 border-t border-black/[0.06] bg-[var(--color-surface-soft)]/45 p-5 sm:flex-row">{failed || error ? <Link href="/place-order" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 font-bold text-white"><ShoppingBag size={18} /> Try checkout again</Link> : <Link href="/dashboard/my-orders" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-secondary)] px-5 font-bold text-white"><ReceiptText size={18} /> Track my order</Link>}<Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 font-bold"><Home size={18} /> Back to menu</Link></div>
        </Card>
      </div>
    </main>
  )
}

export default SuccessPage
