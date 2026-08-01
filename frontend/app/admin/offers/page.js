'use client'

import { useEffect, useState } from 'react'
import { BadgePercent, CalendarDays, Copy, Pencil, Plus, Ticket, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Button, Card, EmptyState, Input, Modal, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const emptyForm = { name: '', code: '', description: '', type: 'PERCENTAGE', value: 10, minOrder: 0, maxDiscount: '', usageLimit: '', startAt: '', endAt: '', isActive: true }
const dateInput = (value) => value ? new Date(value).toISOString().slice(0, 16) : ''

export default function OffersPage() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    try { setOffers((await Axios(summaryApi.adminOffers)).data.data || []) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load offers') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const openCreate = () => { setEditingId(''); setForm(emptyForm); setOpenForm(true) }
  const edit = (offer) => { setEditingId(offer._id); setForm({ ...emptyForm, ...offer, startAt: dateInput(offer.startAt), endAt: dateInput(offer.endAt), maxDiscount: offer.maxDiscount ?? '', usageLimit: offer.usageLimit ?? '' }); setOpenForm(true) }
  const submit = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      const request = editingId ? summaryApi.updateOffer(editingId) : summaryApi.createOffer
      await Axios({ ...request, data: form })
      toast.success(editingId ? 'Offer updated' : 'Offer created')
      setOpenForm(false)
      await load()
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to save offer') }
    finally { setSaving(false) }
  }
  const toggle = async (offer) => { try { await Axios({ ...summaryApi.setOfferStatus(offer._id), data: { isActive: !offer.isActive } }); await load() } catch (error) { toast.error(error.response?.data?.message || 'Unable to update offer') } }
  const remove = async () => { try { await Axios(summaryApi.deleteOffer(deleteTarget._id)); toast.success('Offer deleted'); setDeleteTarget(null); await load() } catch (error) { toast.error(error.response?.data?.message || 'Unable to delete offer') } }
  const copy = async (code) => { await navigator.clipboard.writeText(code); toast.success('Offer code copied') }
  const now = Date.now()
  const status = (offer) => !offer.isActive ? 'PAUSED' : offer.startAt && new Date(offer.startAt).getTime() > now ? 'SCHEDULED' : offer.endAt && new Date(offer.endAt).getTime() < now ? 'EXPIRED' : offer.usageLimit && offer.usedCount >= offer.usageLimit ? 'LIMIT REACHED' : 'ACTIVE'

  return (
    <main className="space-y-7">
      <PageHeader eyebrow="Growth tools" title="Offers and promotions" description="Create percentage, fixed-value, or free-delivery campaigns with scheduling and redemption limits." action={<Button onClick={openCreate}><Plus size={17} /> New offer</Button>} />
      <section className="grid gap-4 sm:grid-cols-3"><Card className="p-5"><BadgePercent className="text-[var(--color-primary)]" /><strong className="mt-4 block text-3xl font-black">{offers.filter((offer) => status(offer) === 'ACTIVE').length}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Active offers</span></Card><Card className="p-5"><Ticket className="text-violet-600" /><strong className="mt-4 block text-3xl font-black">{offers.reduce((sum, offer) => sum + Number(offer.usedCount || 0), 0)}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Total redemptions</span></Card><Card className="p-5"><CalendarDays className="text-[var(--color-secondary)]" /><strong className="mt-4 block text-3xl font-black">{offers.filter((offer) => status(offer) === 'SCHEDULED').length}</strong><span className="text-sm font-semibold text-[var(--color-muted)]">Scheduled</span></Card></section>
      {loading && <div className="grid gap-4 lg:grid-cols-2">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-56" />)}</div>}
      {!loading && !offers.length && <EmptyState title="No offers yet" description="Create your first promotion to prepare a campaign." action={<Button onClick={openCreate}>Create offer</Button>} />}
      <div className="grid gap-4 xl:grid-cols-2">{offers.map((offer) => <Card key={offer._id} className="overflow-hidden"><div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-5"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{offer.name}</h2><StatusBadge value={status(offer)} /></div><button onClick={() => copy(offer.code)} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#19221d] px-2.5 py-1.5 font-mono text-xs font-bold text-white">{offer.code}<Copy size={12} /></button></div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 font-black text-[var(--color-primary)]">{offer.type === 'PERCENTAGE' ? `${offer.value}%` : offer.type === 'FIXED' ? `₹${offer.value}` : 'FREE'}</span></div><div className="grid grid-cols-2 gap-3 p-5 text-sm"><div><p className="text-xs text-[var(--color-muted)]">Minimum order</p><strong>₹{offer.minOrder || 0}</strong></div><div><p className="text-xs text-[var(--color-muted)]">Usage</p><strong>{offer.usedCount || 0}{offer.usageLimit ? ` / ${offer.usageLimit}` : ' / Unlimited'}</strong></div><div className="col-span-2"><p className="text-xs text-[var(--color-muted)]">Schedule</p><strong className="text-xs">{offer.startAt ? new Date(offer.startAt).toLocaleString() : 'Immediately'} → {offer.endAt ? new Date(offer.endAt).toLocaleString() : 'No end date'}</strong></div></div><div className="flex flex-wrap justify-end gap-2 border-t border-black/[0.06] bg-[var(--color-surface-soft)]/50 p-3"><Button size="sm" variant="outline" onClick={() => toggle(offer)}>{offer.isActive ? 'Pause' : 'Activate'}</Button><Button size="sm" variant="ghost" aria-label={`Edit ${offer.name}`} onClick={() => edit(offer)}><Pencil size={16} /></Button><Button size="sm" variant="danger" aria-label={`Delete ${offer.name}`} onClick={() => setDeleteTarget(offer)}><Trash2 size={16} /></Button></div></Card>)}</div>
      {openForm && <Modal title={editingId ? 'Edit offer' : 'Create offer'} onClose={() => setOpenForm(false)}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Input id="offer-name" label="Offer name" value={form.name} onChange={change('name')} required /><Input id="offer-code" label="Code" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') }))} required /><label className="grid gap-2 text-sm font-semibold">Offer type<select value={form.type} onChange={change('type')} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3"><option value="PERCENTAGE">Percentage discount</option><option value="FIXED">Fixed discount</option><option value="FREE_DELIVERY">Free delivery</option></select></label><Input id="offer-value" label={form.type === 'PERCENTAGE' ? 'Percentage' : form.type === 'FIXED' ? 'Discount value' : 'Value'} type="number" min="0" max={form.type === 'PERCENTAGE' ? 100 : undefined} value={form.value} onChange={change('value')} disabled={form.type === 'FREE_DELIVERY'} /><Input id="offer-minimum" label="Minimum order" type="number" min="0" value={form.minOrder} onChange={change('minOrder')} /><Input id="offer-cap" label="Maximum discount (optional)" type="number" min="0" value={form.maxDiscount} onChange={change('maxDiscount')} disabled={form.type !== 'PERCENTAGE'} /><Input id="offer-limit" label="Usage limit (optional)" type="number" min="1" value={form.usageLimit} onChange={change('usageLimit')} /><Input id="offer-start" label="Starts at" type="datetime-local" value={form.startAt} onChange={change('startAt')} /><Input id="offer-end" label="Ends at" type="datetime-local" value={form.endAt} onChange={change('endAt')} /><label className="sm:col-span-2 grid gap-2 text-sm font-semibold">Description<textarea value={form.description} onChange={change('description')} maxLength={300} className="min-h-24 rounded-xl border border-[var(--color-border)] bg-white p-3" /></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={change('isActive')} /> Active immediately</label><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setOpenForm(false)}>Cancel</Button><Button type="submit" loading={saving}>{editingId ? 'Save changes' : 'Create offer'}</Button></div></form></Modal>}
      {deleteTarget && <Modal title="Delete offer" onClose={() => setDeleteTarget(null)}><p className="text-sm leading-6 text-[var(--color-muted)]">Delete <strong className="text-[var(--color-text)]">{deleteTarget.name}</strong>? Existing orders remain unchanged.</p><div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={remove}>Delete offer</Button></div></Modal>}
    </main>
  )
}
