'use client'

import Link from 'next/link'
import { useSelector } from 'react-redux'
import { ArrowRight, CheckCircle2, MapPin, Package, ReceiptText, UserRound } from 'lucide-react'
import { Card, PageHeader, StatusBadge } from '@/Components/ui'

export default function Dashboard() {
  const user = useSelector((state) => state.user)
  const orders = useSelector((state) => state.orders.orders) || []
  const addresses = useSelector((state) => state.addresses.addressList) || []
  const activeAddresses = addresses.filter((item) => item.status)
  const latest = orders[0]
  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Your account" title={`Good to see you, ${user.name?.split(' ')[0] || 'Foodie'}`} description="Everything you need for faster orders and easier tracking, all in one place." />
      <section className="grid gap-4 sm:grid-cols-3">{[[Package, 'Orders', orders.length, 'View history', '/dashboard/my-orders'], [MapPin, 'Saved addresses', activeAddresses.length, 'Manage addresses', '/dashboard/address'], [UserRound, 'Profile', user.mobile ? 'Complete' : 'Needs info', 'Update details', '/dashboard/profile']].map(([Icon, label, value, action, href]) => <Card key={label} className="group p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1eb] text-[var(--color-primary)]"><Icon size={20} /></span><p className="mt-5 text-sm font-semibold text-[var(--color-muted)]">{label}</p><strong className="mt-1 block text-2xl font-black tracking-tight">{value}</strong><Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-secondary)]">{action}<ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></Card>)}</section>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Latest activity</p><h2 className="mt-2 text-xl font-black">Most recent order</h2></div><ReceiptText className="text-[var(--color-muted)]" /></div>{latest ? <div className="mt-6 rounded-2xl bg-[var(--color-surface-soft)] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong>{latest.publicOrderId || latest.orderId}</strong><p className="mt-1 text-sm text-[var(--color-muted)]">{new Date(latest.createdAt).toLocaleString()}</p></div><StatusBadge value={latest.status || latest.order_status} /></div><div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4"><span className="text-sm text-[var(--color-muted)]">Order total</span><strong className="text-xl">₹{latest.pricing?.grandTotal ?? latest.totalAmt}</strong></div></div> : <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center"><p className="font-bold">No orders yet</p><Link href="/" className="mt-2 inline-block text-sm font-bold text-[var(--color-primary)]">Explore the menu</Link></div>}</Card>
        <Card className="bg-[#19221d] p-6 text-white"><CheckCircle2 className="text-[#f6bf4b]" size={30} /><h2 className="mt-5 text-xl font-black">Account status</h2><p className="mt-2 text-sm leading-6 text-white/60">Your email is {user.verify_email ? 'verified' : 'not verified yet'} and your profile is {user.mobile ? 'ready for quick checkout' : 'missing a mobile number'}.</p><Link href="/dashboard/profile" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#19221d]">Review profile <ArrowRight size={16} /></Link></Card>
      </div>
    </main>
  )
}
