'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { Mail, Package, Phone, ShieldCheck, UserRound } from 'lucide-react'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import AccoutSuspention from '@/Components/AccoutSuspention'
import { Button, Card, EmptyState, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'
import { hasPermission } from '@/public/utils/isAdmin'

export default function CustomersPage() {
  const [users, setUsers] = useState([])
  const currentUser = useSelector((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [statusTarget, setStatusTarget] = useState(null)
  const load = async () => { setLoading(true); try { const response = await Axios(summaryApi.getAllUsers); setUsers(response.data.data || []) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Customer management" title="Customers" description="Review account status, order activity, and administrative access." />
      {loading && <div className="grid gap-4 xl:grid-cols-2">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-48" />)}</div>}
      {!loading && !users.length && <EmptyState title="No customers found" description="New registered accounts will appear here." />}
      <div className="grid gap-4 xl:grid-cols-2">{users.map((customer) => { const suspended = customer.status === 'Suspended'; return <Card key={customer._id} className={`p-5 ${suspended ? 'opacity-70' : ''}`}><div className="flex items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--color-surface-soft)] font-black text-[var(--color-secondary)]">{customer.avatar ? <img src={customer.avatar} alt="" className="h-full w-full object-cover" /> : customer.name?.slice(0,1)?.toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{customer.name}</h2><StatusBadge value={suspended ? 'SUSPENDED' : customer.role} /></div><p className="mt-2 flex items-center gap-2 truncate text-sm text-[var(--color-muted)]"><Mail size={14} />{customer.email}</p>{customer.mobile && <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-muted)]"><Phone size={14} />{customer.mobile}</p>}<p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-muted)]"><Package size={14} />{customer.order_history?.length || 0} orders</p></div></div><div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-black/[0.06] pt-4">{hasPermission(currentUser, 'access.manage') && <Link href="/admin/access" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-bold hover:border-[var(--color-primary)]"><ShieldCheck size={15} /> Manage access</Link>}{hasPermission(currentUser, 'customers.manage') && <Button size="sm" variant={suspended ? 'secondary' : 'danger'} onClick={() => setStatusTarget(customer)}><UserRound size={15} /> {suspended ? 'Restore account' : 'Suspend'}</Button>}</div></Card> })}</div>
      {statusTarget && <AccoutSuspention data={statusTarget} close={() => { setStatusTarget(null); load() }} fetchAllUsers={load} />}
    </main>
  )
}
