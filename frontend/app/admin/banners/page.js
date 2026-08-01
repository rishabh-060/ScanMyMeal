'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Film, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import uploadImage from '@/public/utils/uploadImage'
import { Button, Card, EmptyState, Input, Modal, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const emptyForm = { title: '', subtitle: '', altText: '', ctaText: '', ctaUrl: '', desktopMediaUrl: '', desktopMediaPublicId: '', mobileMediaUrl: '', mobileMediaPublicId: '', mediaType: 'IMAGE', isActive: true, autoSlideMs: 5000, startAt: '', endAt: '' }

const BannerMedia = ({ banner, className = '' }) => banner.mediaType === 'VIDEO'
  ? <video src={banner.desktopMediaUrl} className={className} muted loop autoPlay playsInline aria-label={banner.altText || banner.title} />
  : <img src={banner.desktopMediaUrl} alt={banner.altText || banner.title} className={className} />

const BannerAdminPage = () => {
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try { setBanners((await Axios(summaryApi.adminBanners)).data.data || []) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load banners') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  const upload = async (event, target) => {
    const file = event.target.files?.[0]
    if (!file) return
    const mediaType = file.type === 'video/mp4' ? 'VIDEO' : file.type === 'image/gif' ? 'GIF' : 'IMAGE'
    if (target === 'mobile' && form.desktopMediaUrl && form.mediaType !== mediaType) {
      event.target.value = ''
      return toast.error('Desktop and mobile files must use the same media type')
    }
    setUploading(target)
    try {
      const result = await uploadImage(file)
      if (!result.data?.success) return toast.error(result.response?.data?.message || 'Upload failed')
      const media = result.data.data
      setForm((current) => ({
        ...current,
        [`${target}MediaUrl`]: media.secure_url || media.url,
        [`${target}MediaPublicId`]: media.public_id,
        mediaType,
        ...(target === 'desktop' && current.mobileMediaUrl && current.mediaType !== mediaType ? { mobileMediaUrl: '', mobileMediaPublicId: '' } : {}),
      }))
    } finally { setUploading('') }
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const request = editingId ? summaryApi.updateBanner(editingId) : summaryApi.createBanner
      await Axios({ ...request, data: { ...form, autoSlideMs: Number(form.autoSlideMs), startAt: form.startAt || null, endAt: form.endAt || null } })
      toast.success(editingId ? 'Banner updated' : 'Banner created')
      setEditingId(''); setForm(emptyForm); await load()
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to save banner') }
    finally { setSaving(false) }
  }

  const edit = (banner) => {
    setEditingId(banner._id)
    setForm({ ...emptyForm, ...banner, startAt: banner.startAt?.slice(0, 16) || '', endAt: banner.endAt?.slice(0, 16) || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const remove = async () => { await Axios(summaryApi.deleteBanner(deleteTarget._id)); setDeleteTarget(null); await load() }
  const move = async (index, direction) => {
    const next = [...banners]; const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setBanners(next)
    await Axios({ ...summaryApi.reorderBanners, data: { order: next.map((banner) => banner._id) } })
  }
  const toggle = async (banner) => { await Axios({ ...summaryApi.setBannerStatus(banner._id), data: { isActive: !banner.isActive } }); await load() }

  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Storefront content" title="Homepage banners" description="Publish images, GIFs, or looping MP4 videos with responsive media and campaign scheduling." />
      <Card className="overflow-hidden">
        <div className="border-b border-black/[0.06] bg-[var(--color-surface-soft)]/60 p-5"><h2 className="font-black">{editingId ? 'Edit banner' : 'Create a banner'}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Use concise copy and high-quality landscape media.</p></div>
        <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
          <Input id="banner-title" label="Title" required value={form.title} onChange={change('title')} />
          <Input id="banner-alt" label="Alternative text" required value={form.altText} onChange={change('altText')} />
          <Input id="banner-subtitle" label="Subtitle" value={form.subtitle} onChange={change('subtitle')} />
          <Input id="banner-cta-text" label="CTA text" value={form.ctaText} onChange={change('ctaText')} />
          <Input id="banner-cta-url" label="CTA URL" value={form.ctaUrl} onChange={change('ctaUrl')} placeholder="/category/... or https://..." />
          <Input id="banner-speed" label="Slide duration (milliseconds)" type="number" min="2000" max="30000" value={form.autoSlideMs} onChange={change('autoSlideMs')} />
          <Input id="banner-start" label="Start date (optional)" type="datetime-local" value={form.startAt} onChange={change('startAt')} />
          <Input id="banner-end" label="End date (optional)" type="datetime-local" value={form.endAt} onChange={change('endAt')} />
          <label className="grid gap-2 text-sm font-semibold">Desktop image, GIF, or MP4<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" onChange={(event) => upload(event, 'desktop')} required={!form.desktopMediaUrl} disabled={Boolean(uploading)} /><span className="text-xs font-normal text-[var(--color-muted)]">Landscape media up to 25 MB. Videos play muted and loop.</span></label>
          <label className="grid gap-2 text-sm font-semibold">Mobile media (optional)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" onChange={(event) => upload(event, 'mobile')} disabled={Boolean(uploading)} /><span className="text-xs font-normal text-[var(--color-muted)]">Use the same file type as the desktop media.</span></label>
          {uploading && <p className="text-sm font-bold text-[var(--color-primary)] md:col-span-2">Uploading {uploading} media…</p>}
          {form.desktopMediaUrl && <div className="relative overflow-hidden rounded-2xl bg-[#19221d] md:col-span-2"><BannerMedia banner={form} className="h-56 w-full object-cover" /><span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white">{form.mediaType === 'VIDEO' ? <Film size={14} /> : <ImageIcon size={14} />}{form.mediaType}</span></div>}
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={change('isActive')} /> Active</label>
          <div className="flex justify-end gap-2 md:col-span-2">{editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(''); setForm(emptyForm) }}>Cancel edit</Button>}<Button type="submit" loading={saving} disabled={Boolean(uploading)}>{editingId ? 'Update banner' : 'Create banner'}</Button></div>
        </form>
      </Card>
      {loading && <div className="grid gap-4">{[1,2].map((item) => <Skeleton key={item} className="h-36" />)}</div>}
      {!loading && !banners.length && <EmptyState title="No banners" description="The homepage will use its built-in fallback until a banner is created." />}
      <div className="grid gap-4">{banners.map((banner, index) => <Card key={banner._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><BannerMedia banner={banner} className="h-28 w-full rounded-2xl bg-[#19221d] object-cover sm:w-48" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="truncate">{banner.title}</strong><StatusBadge value={banner.isActive ? 'ACTIVE' : 'INACTIVE'} /><StatusBadge value={banner.mediaType} /></div><p className="mt-1 line-clamp-2 text-sm text-neutral-600">{banner.subtitle || 'No subtitle'} · {(banner.autoSlideMs / 1000).toFixed(1)} seconds</p></div><div className="flex flex-wrap gap-2"><Button variant="ghost" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={18} /></Button><Button variant="ghost" aria-label="Move down" disabled={index === banners.length - 1} onClick={() => move(index, 1)}><ArrowDown size={18} /></Button><Button variant="outline" onClick={() => toggle(banner)}>{banner.isActive ? 'Deactivate' : 'Activate'}</Button><Button variant="ghost" aria-label="Edit banner" onClick={() => edit(banner)}><Pencil size={18} /></Button><Button variant="danger" aria-label="Delete banner" onClick={() => setDeleteTarget(banner)}><Trash2 size={18} /></Button></div></Card>)}</div>
      {deleteTarget && <Modal title="Delete banner" onClose={() => setDeleteTarget(null)}><p>Delete “{deleteTarget.title}” and its managed media? This cannot be undone.</p><div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={remove}>Delete</Button></div></Modal>}
    </main>
  )
}

export default BannerAdminPage
