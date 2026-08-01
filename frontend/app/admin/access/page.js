'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { KeyRound, Search, ShieldCheck, UsersRound } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Button, Card, EmptyState, Modal, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const permissionLabel = (permission) => permission.split('.').map((part) => part[0].toUpperCase() + part.slice(1)).join(' · ')

export default function AccessPage() {
  const currentUser = useSelector((state) => state.user)
  const [data, setData] = useState({ users: [], roles: [], permissions: [] })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState(null)
  const [form, setForm] = useState({ role: 'USER', permissions: [] })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setData((await Axios(summaryApi.adminAccess)).data.data) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load access controls') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const users = useMemo(() => data.users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase())), [data.users, query])
  const open = (user) => { setTarget(user); setForm({ role: user.role, permissions: user.permissions || [] }) }
  const togglePermission = (permission) => setForm((current) => ({ ...current, permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] }))
  const save = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      await Axios({ ...summaryApi.updateAdminAccess(target._id), data: form })
      toast.success('Role and permissions updated')
      setTarget(null)
      await load()
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to update access') }
    finally { setSaving(false) }
  }

  return (
    <main className="space-y-7">
      <PageHeader eyebrow="Security & governance" title="Roles and permissions" description="Give each team member only the workspace access needed for their responsibilities." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.roles.map((role) => <Card key={role.role} className="p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><ShieldCheck size={19} /></span><h2 className="mt-4 font-black">{role.role.replaceAll('_', ' ')}</h2><p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{role.permissions.includes('*') ? 'Full workspace access' : `${role.permissions.length} default permissions`}</p></Card>)}
      </section>
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black">Team access</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Assign a role and optional extra permissions.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-3.5 text-neutral-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team or customers" className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)]" /></div></div>
      </Card>
      {loading && <div className="grid gap-3">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-20" />)}</div>}
      {!loading && !users.length && <EmptyState title="No matching accounts" description="Try a different name, email, or role." />}
      <div className="grid gap-3">
        {users.map((user) => <Card key={user._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--color-surface-soft)] font-black text-[var(--color-secondary)]">{user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name?.slice(0, 1)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-black">{user.name}</h3><StatusBadge value={user.role} />{user.status !== 'Active' && <StatusBadge value={user.status} />}</div><p className="mt-1 truncate text-sm text-[var(--color-muted)]">{user.email}</p></div><div className="flex items-center gap-3"><span className="hidden text-xs font-semibold text-[var(--color-muted)] md:block">{user.permissions?.length || 0} custom grants</span><Button size="sm" variant="outline" disabled={String(user._id) === String(currentUser.id)} onClick={() => open(user)}><KeyRound size={15} /> Manage</Button></div></Card>)}
      </div>
      {target && <Modal title={`Access for ${target.name}`} onClose={() => setTarget(null)}><form onSubmit={save} className="space-y-5"><label className="grid gap-2 text-sm font-bold">Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3"><option value="USER">USER</option>{data.roles.map((role) => <option key={role.role} value={role.role}>{role.role.replaceAll('_', ' ')}</option>)}</select></label><div><div className="flex items-center justify-between"><div><h3 className="font-black">Additional permissions</h3><p className="mt-1 text-xs text-[var(--color-muted)]">These grants are added on top of the selected role.</p></div><UsersRound size={20} className="text-[var(--color-secondary)]" /></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{data.permissions.map((permission) => <label key={permission} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-[var(--color-surface-soft)]/50 p-3 text-sm font-semibold"><input type="checkbox" checked={form.permissions.includes(permission)} onChange={() => togglePermission(permission)} disabled={form.role === 'ADMIN' || form.role === 'USER'} />{permissionLabel(permission)}</label>)}</div></div><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setTarget(null)}>Cancel</Button><Button type="submit" loading={saving}>Save access</Button></div></form></Modal>}
    </main>
  )
}
