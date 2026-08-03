'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { BriefcaseBusiness, KeyRound, Mail, Plus, Search, ShieldCheck, UserCog, UsersRound } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Button, Card, EmptyState, Input, Modal, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const emptyForm = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  role: 'MANAGER',
  permissions: [],
  status: 'Active',
}

const permissionLabel = (permission) => permission
  .split('.')
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join(' · ')

const PermissionEditor = ({ roles, permissions, form, setForm }) => {
  const role = roles.find((item) => item.role === form.role)
  const fullAccess = role?.permissions.includes('*')
  const defaults = new Set(fullAccess ? permissions : role?.permissions || [])

  const toggle = (permission) => {
    if (defaults.has(permission)) return
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-black">Permissions</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">Role permissions are selected automatically. Add only the extra grants this member needs.</p>
        </div>
        <UsersRound size={20} className="shrink-0 text-[var(--color-secondary)]" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {permissions.map((permission) => {
          const roleDefault = defaults.has(permission)
          const checked = roleDefault || form.permissions.includes(permission)
          return (
            <label key={permission} className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${checked ? 'border-emerald-200 bg-emerald-50/70' : 'border-black/[0.06] bg-[var(--color-surface-soft)]/50'} ${roleDefault ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input type="checkbox" checked={checked} onChange={() => toggle(permission)} disabled={roleDefault} className="h-4 w-4 accent-[var(--color-secondary)]" />
              <span className="min-w-0 flex-1">{permissionLabel(permission)}</span>
              {roleDefault && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">Role</span>}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function StaffManagementPage() {
  const currentUser = useSelector((state) => state.user)
  const [data, setData] = useState({ staff: [], roles: [], permissions: [] })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [openForm, setOpenForm] = useState(false)
  const [target, setTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setData((await Axios(summaryApi.adminAccess)).data.data) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load staff management') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const staff = useMemo(() => data.staff.filter((member) => {
    const matchesQuery = `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(query.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter
    return matchesQuery && matchesRole && matchesStatus
  }), [data.staff, query, roleFilter, statusFilter])

  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const changeRole = (event) => {
    const role = event.target.value
    const defaults = data.roles.find((item) => item.role === role)?.permissions || []
    setForm((current) => ({ ...current, role, permissions: role === 'ADMIN' ? [] : current.permissions.filter((permission) => !defaults.includes(permission)) }))
  }
  const create = () => { setTarget(null); setForm(emptyForm); setOpenForm(true) }
  const edit = (member) => {
    setTarget(member)
    setForm({
      ...emptyForm,
      name: member.name || '',
      email: member.email || '',
      mobile: member.mobile || '',
      role: member.role,
      permissions: member.permissions || [],
      status: member.status,
    })
    setOpenForm(true)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const request = target ? summaryApi.updateStaff(target._id) : summaryApi.createStaff
      await Axios({ ...request, data: form })
      toast.success(target ? 'Staff member updated' : 'Verified staff account created')
      setOpenForm(false)
      setTarget(null)
      await load()
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to save staff member') }
    finally { setSaving(false) }
  }

  const activeCount = data.staff.filter((member) => member.status === 'Active').length
  const adminCount = data.staff.filter((member) => member.role === 'ADMIN' && member.status === 'Active').length

  return (
    <main className="space-y-7">
      <PageHeader eyebrow="People & security" title="Staff management" description="Create verified staff-only accounts, assign dashboard roles, and control each member’s workspace access." action={<Button onClick={create}><Plus size={17} /> New staff member</Button>} />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><BriefcaseBusiness className="text-[var(--color-primary)]" /><strong className="mt-4 block text-3xl font-black">{data.staff.length}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Staff members</span></Card>
        <Card className="p-5"><UserCog className="text-emerald-700" /><strong className="mt-4 block text-3xl font-black">{activeCount}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Active accounts</span></Card>
        <Card className="p-5"><ShieldCheck className="text-violet-700" /><strong className="mt-4 block text-3xl font-black">{adminCount}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Active administrators</span></Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {data.roles.map((role) => <Card key={role.role} className="p-4"><h2 className="font-black">{role.role.replaceAll('_', ' ')}</h2><p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{role.permissions.includes('*') ? 'Full workspace access' : `${role.permissions.length} default permissions`}</p></Card>)}
      </section>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="relative"><Search className="absolute left-3 top-3.5 text-neutral-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff by name, email, or role" className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)]" /></div>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="min-h-11 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold"><option value="ALL">All roles</option>{data.roles.map((role) => <option key={role.role} value={role.role}>{role.role.replaceAll('_', ' ')}</option>)}</select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold"><option value="ALL">All statuses</option><option value="Active">Active</option><option value="Suspended">Suspended</option></select>
        </div>
      </Card>

      {loading && <div className="grid gap-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24" />)}</div>}
      {!loading && !staff.length && <EmptyState title="No matching staff members" description="Create a staff member or adjust your filters." action={!data.staff.length ? <Button onClick={create}>Create first staff member</Button> : undefined} />}
      <div className="grid gap-3">
        {staff.map((member) => <Card key={member._id} className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${member.status !== 'Active' ? 'opacity-70' : ''}`}><span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--color-surface-soft)] font-black text-[var(--color-secondary)]">{member.avatar ? <img src={member.avatar} alt="" className="h-full w-full object-cover" /> : member.name?.slice(0, 1)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-black">{member.name}</h3><StatusBadge value={member.role} /><StatusBadge value={member.status} /></div><p className="mt-1 flex items-center gap-2 truncate text-sm text-[var(--color-muted)]"><Mail size={14} />{member.email}</p><p className="mt-1 text-xs text-[var(--color-muted)]">{member.permissions?.length || 0} extra grants · {member.last_login_date ? `Last login ${new Date(member.last_login_date).toLocaleString()}` : 'Never signed in'}</p></div><Button size="sm" variant="outline" disabled={String(member._id) === String(currentUser.id)} onClick={() => edit(member)}><KeyRound size={15} /> Manage</Button></Card>)}
      </div>

      {openForm && <Modal title={target ? `Manage ${target.name}` : 'Create staff member'} onClose={() => setOpenForm(false)}><form onSubmit={save} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Input id="staff-name" label="Full name" value={form.name} onChange={change('name')} required /><Input id="staff-email" label="Work email" type="email" value={form.email} onChange={change('email')} required /><Input id="staff-mobile" label="Mobile (optional)" type="tel" value={form.mobile} onChange={change('mobile')} /><Input id="staff-password" label={target ? 'New password (optional)' : 'Temporary password'} type="password" minLength={8} value={form.password} onChange={change('password')} required={!target} hint={target ? 'Leave blank to keep the current password.' : 'At least 8 characters. Share it securely with the member.'} /><label className="grid gap-2 text-sm font-bold">Dashboard role<select value={form.role} onChange={changeRole} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3">{data.roles.map((role) => <option key={role.role} value={role.role}>{role.role.replaceAll('_', ' ')}</option>)}</select></label>{target && <label className="grid gap-2 text-sm font-bold">Account status<select value={form.status} onChange={change('status')} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3"><option value="Active">Active</option><option value="Suspended">Suspended</option></select></label>}</div><PermissionEditor roles={data.roles} permissions={data.permissions} form={form} setForm={setForm} /><div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900">Staff accounts are verified immediately and restricted to the admin workspace. Customer accounts are managed separately in Customers.</div><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setOpenForm(false)}>Cancel</Button><Button type="submit" loading={saving}>{target ? 'Save staff member' : 'Create verified account'}</Button></div></form></Modal>}
    </main>
  )
}
