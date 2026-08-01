'use client'

import Link from 'next/link'
import { ArrowRight, CreditCard, Home, RefreshCcw, ShieldCheck, ShoppingBag, XCircle } from 'lucide-react'
import { Card } from '@/Components/ui'

const CancelPage = () => (
  <main className="grid min-h-[74vh] place-items-center bg-[var(--color-background)] px-4 py-10">
    <Card className="w-full max-w-3xl overflow-hidden">
      <div className="grid gap-8 p-6 sm:p-9 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div className="grid min-h-64 place-items-center rounded-[2rem] bg-red-50 text-center"><div><span className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-white text-red-600 shadow-sm"><XCircle size={52} /></span><p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-red-700">Payment incomplete</p></div></div>
        <div><h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Your order wasn’t charged</h1><p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">The payment was cancelled or could not be completed. Your cart is still available, so you can review it and try again when you’re ready.</p><div className="mt-6 grid gap-3">{[[ShieldCheck, 'No completed charge was recorded'], [ShoppingBag, 'Your cart items remain available'], [CreditCard, 'You can retry with the same or another payment method']].map(([Icon, text]) => <div key={text} className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface-soft)] p-3 text-sm font-semibold"><Icon size={19} className="text-[var(--color-secondary)]" />{text}</div>)}</div></div>
      </div>
      <div className="flex flex-col gap-3 border-t border-black/[0.06] bg-[var(--color-surface-soft)]/50 p-5 sm:flex-row sm:justify-end"><Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 font-bold"><Home size={17} /> Return home</Link><Link href="/dashboard/cart" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 font-bold"><ShoppingBag size={17} /> Review cart</Link><Link href="/place-order" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 font-bold text-white"><RefreshCcw size={17} /> Try payment again <ArrowRight size={16} /></Link></div>
    </Card>
  </main>
)

export default CancelPage
