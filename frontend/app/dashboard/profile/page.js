'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Mail, Phone, UserRound } from 'lucide-react'
import { toast } from 'react-toastify'
import UserProfileAvatarEdit from '@/Components/UserProfileAvatarEdit'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import fetchUserDetails from '@/public/utils/fetchUserDetails'
import { setUserDetails } from '@/public/store/userSlice'
import { Button, Card, Input, PageHeader, StatusBadge } from '@/Components/ui'

export default function Profile() {
  const user = useSelector((state) => state.user)
  const [form, setForm] = useState({ name: '', mobile: '' })
  const [avatarEditor, setAvatarEditor] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  useEffect(() => { setForm({ name: user.name || '', mobile: user.mobile || '' }) }, [user.name, user.mobile])
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try { const response = await Axios({ ...summaryApi.updateUser, data: form }); const details = await fetchUserDetails(); dispatch(setUserDetails(details.data)); toast.success(response.data.message || 'Profile updated') }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to update profile') }
    finally { setLoading(false) }
  }
  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Profile settings" title="Your personal details" description="Keep these details accurate so restaurant and delivery teams can reach you when needed." />
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit p-6 text-center"><div className="relative mx-auto h-32 w-32"><div className="grid h-full w-full place-items-center overflow-hidden rounded-[2rem] bg-[var(--color-surface-soft)] text-4xl font-black text-[var(--color-secondary)]">{user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name?.slice(0, 1)?.toUpperCase()}</div><button onClick={() => setAvatarEditor(true)} className="absolute -bottom-2 -right-2 grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-primary)] text-white shadow-lg" aria-label="Change profile photo"><Camera size={19} /></button></div><h2 className="mt-6 text-xl font-black">{user.name}</h2><p className="mt-1 truncate text-sm text-[var(--color-muted)]">{user.email}</p><div className="mt-4"><StatusBadge value={user.verify_email ? 'EMAIL VERIFIED' : 'NOT VERIFIED'} /></div></Card>
        <Card className="p-5 sm:p-7"><form onSubmit={submit} className="grid gap-5"><div className="grid gap-5 md:grid-cols-2"><Input id="profile-name" label="Full name" name="name" value={form.name} onChange={update} required /><Input id="profile-mobile" label="Mobile number" name="mobile" type="tel" value={form.mobile} onChange={update} placeholder="Add your mobile number" required /></div><div className="grid gap-2"><span className="text-sm font-semibold">Email address</span><div className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 text-sm text-[var(--color-muted)]"><Mail size={18} />{user.email}<span className="ml-auto text-xs font-bold">Cannot be changed</span></div></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><div className="flex gap-3"><Phone className="mt-0.5 shrink-0 text-[var(--color-secondary)]" size={19} /><div><strong className="text-sm">Why we ask for a number</strong><p className="mt-1 text-sm leading-6 text-emerald-800/75">It helps the restaurant clarify an order or the delivery team find you. We do not show it publicly.</p></div></div></div><div className="flex justify-end"><Button type="submit" loading={loading}>Save changes</Button></div></form></Card>
      </div>
      {avatarEditor && <UserProfileAvatarEdit close={() => setAvatarEditor(false)} />}
    </main>
  )
}
