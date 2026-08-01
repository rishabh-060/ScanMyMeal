'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, BellRing, CheckCheck, ExternalLink, Plus, Send, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Button, Card, EmptyState, Input, Modal, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const emptyForm = { title: '', message: '', type: 'INFO', audience: 'STAFF', actionUrl: '', expiresAt: '' }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { const response = await Axios(summaryApi.adminNotifications); setNotifications(response.data.data || []); setUnread(response.data.unread || 0) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load notifications') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const publish = async (event) => {
    event.preventDefault(); setSaving(true)
    try { await Axios({ ...summaryApi.createNotification, data: form }); toast.success('Notification published'); setOpenForm(false); setForm(emptyForm); await load() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to publish notification') }
    finally { setSaving(false) }
  }
  const markRead = async (notification) => { if (notification.isRead) return; await Axios(summaryApi.markNotificationRead(notification._id)); await load() }
  const markAll = async () => { await Axios(summaryApi.markAllNotificationsRead); await load() }
  const remove = async (notification) => { try { await Axios(summaryApi.deleteNotification(notification._id)); toast.success('Notification deleted'); await load() } catch (error) { toast.error(error.response?.data?.message || 'Unable to delete notification') } }
  const tone = { INFO: 'bg-blue-50 text-blue-700', SUCCESS: 'bg-emerald-50 text-emerald-700', WARNING: 'bg-amber-50 text-amber-700', URGENT: 'bg-red-50 text-red-700' }

  return (
    <main className="space-y-7">
      <PageHeader eyebrow="Team communication" title="Notification centre" description="Publish operational updates and keep important workspace activity visible to the team." action={<Button onClick={() => setOpenForm(true)}><Plus size={17} /> New notification</Button>} />
      <section className="grid gap-4 sm:grid-cols-3"><Card className="p-5"><BellRing className="text-[var(--color-primary)]" /><strong className="mt-4 block text-3xl font-black">{unread}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Unread</span></Card><Card className="p-5"><Bell className="text-blue-600" /><strong className="mt-4 block text-3xl font-black">{notifications.length}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Active messages</span></Card><Card className="flex flex-col items-start justify-between gap-4 p-5"><CheckCheck className="text-emerald-600" /><Button size="sm" variant="outline" disabled={!unread} onClick={markAll}>Mark all as read</Button></Card></section>
      {loading && <div className="grid gap-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-32" />)}</div>}
      {!loading && !notifications.length && <EmptyState title="No active notifications" description="Publish an update for staff, customers, or everyone." action={<Button onClick={() => setOpenForm(true)}>Publish update</Button>} />}
      <div className="grid gap-3">{notifications.map((notification) => <Card key={notification._id} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-start ${notification.isRead ? 'opacity-75' : 'ring-1 ring-orange-200'}`} onClick={() => markRead(notification)}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tone[notification.type] || tone.INFO}`}><Bell size={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{notification.title}</h2><StatusBadge value={notification.type} /><StatusBadge value={notification.audience} />{!notification.isRead && <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" aria-label="Unread" />}</div><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{notification.message}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-neutral-500"><span>{new Date(notification.createdAt).toLocaleString()}</span>{notification.createdBy?.name && <span>By {notification.createdBy.name}</span>}{notification.actionUrl && <Link href={notification.actionUrl} className="inline-flex items-center gap-1 text-[var(--color-primary)]">Open link <ExternalLink size={12} /></Link>}</div></div><Button size="sm" variant="ghost" aria-label={`Delete ${notification.title}`} onClick={(event) => { event.stopPropagation(); remove(notification) }}><Trash2 size={16} /></Button></Card>)}</div>
      {openForm && <Modal title="Publish notification" onClose={() => setOpenForm(false)}><form onSubmit={publish} className="grid gap-4 sm:grid-cols-2"><Input id="notification-title" label="Title" value={form.title} onChange={change('title')} required /><label className="grid gap-2 text-sm font-semibold">Type<select value={form.type} onChange={change('type')} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3"><option value="INFO">Information</option><option value="SUCCESS">Success</option><option value="WARNING">Warning</option><option value="URGENT">Urgent</option></select></label><label className="grid gap-2 text-sm font-semibold">Audience<select value={form.audience} onChange={change('audience')} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3"><option value="STAFF">Staff</option><option value="CUSTOMERS">Customers</option><option value="ALL">Everyone</option></select></label><Input id="notification-expiry" label="Expires at (optional)" type="datetime-local" value={form.expiresAt} onChange={change('expiresAt')} /><Input id="notification-action" label="Action URL (optional)" value={form.actionUrl} onChange={change('actionUrl')} placeholder="/admin/inventory" className="sm:col-span-2" /><label className="grid gap-2 text-sm font-semibold sm:col-span-2">Message<textarea value={form.message} onChange={change('message')} maxLength={600} required className="min-h-32 rounded-xl border border-[var(--color-border)] bg-white p-3" /></label><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setOpenForm(false)}>Cancel</Button><Button type="submit" loading={saving}><Send size={16} /> Publish</Button></div></form></Modal>}
    </main>
  )
}
