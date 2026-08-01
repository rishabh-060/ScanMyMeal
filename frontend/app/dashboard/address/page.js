'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import AddAddress from '@/Components/AddAddress'
import EditAddress from '@/Components/EditAddress'
import { useGlobalContext } from '@/provider/GlobalProvider'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import { Button, Card, EmptyState, PageHeader } from '@/Components/ui'

export default function Address() {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const addresses = useSelector((state) => state.addresses.addressList).filter((item) => item.status)
  const { fetchAddress } = useGlobalContext()
  const remove = async (id) => {
    try { const response = await Axios({ ...summaryApi.deleteAddress, data: { _id: id } }); toast.success(response.data.message || 'Address removed'); await fetchAddress?.() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to remove address') }
  }
  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Delivery details" title="Saved addresses" description="Keep your usual delivery locations ready for a quicker checkout." action={<Button onClick={() => setAdding(true)}><Plus size={18} /> Add address</Button>} />
      {!addresses.length ? <EmptyState title="No saved addresses" description="Add your home, office, or another delivery location." action={<Button onClick={() => setAdding(true)}><Plus size={18} /> Add your first address</Button>} /> : <div className="grid gap-4 md:grid-cols-2">{addresses.map((address, index) => <Card key={address._id} className="group p-5"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff1eb] text-[var(--color-primary)]"><MapPin size={20} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--color-muted)]">Address {index + 1}</p><h2 className="mt-1 font-black">{address.address_line}</h2></div><div className="flex gap-1"><button onClick={() => setEditing(address)} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]" aria-label="Edit address"><Pencil size={17} /></button><button onClick={() => remove(address._id)} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-error)] hover:bg-red-50" aria-label="Remove address"><Trash2 size={17} /></button></div></div><p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{address.city}, {address.state} {address.pincode}<br />{address.country} · {address.mobile}</p></div></div></Card>)}</div>}
      {adding && <AddAddress close={() => setAdding(false)} />}
      {editing && <EditAddress close={() => setEditing(null)} editData={editing} />}
    </main>
  )
}
