'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Button, Card, EmptyState, Input, Modal, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const InventoryPage = () => {
  const [products, setProducts] = useState([])
  const [target, setTarget] = useState(null)
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try { setProducts((await Axios(summaryApi.adminInventory)).data.data || []) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load inventory') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const adjust = async (event) => {
    event.preventDefault()
    try {
      await Axios({ ...summaryApi.adjustInventory(target._id), data: { delta: Number(delta), reason } })
      toast.success('Inventory adjusted')
      setTarget(null); setDelta(''); setReason('')
      await load()
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to adjust inventory') }
  }
  return (
    <main className="space-y-5">
      <PageHeader eyebrow="Stock control" title="Inventory" description="Every manual adjustment requires a reason and is recorded in the audit log." />
      {loading && <div className="grid gap-3">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-24" />)}</div>}
      {!loading && !products.length && <EmptyState title="No products" />}
      <div className="grid gap-3">
        {products.map((product) => <Card key={product._id} className="flex items-center gap-4 p-4"><img src={product.image?.[0] || '/assets/favicon.png'} alt="" className="h-14 w-14 rounded-lg object-cover" /><div className="flex-1"><strong>{product.name}</strong><div className="mt-1"><StatusBadge value={product.stock === 0 ? 'OUT OF STOCK' : product.stock <= 5 ? 'LOW STOCK' : 'AVAILABLE'} /></div></div><div className="text-right"><p className="text-2xl font-bold">{product.stock}</p><p className="text-xs text-neutral-500">units</p></div><Button variant="outline" onClick={() => setTarget(product)}>Adjust</Button></Card>)}
      </div>
      {target && <Modal title={`Adjust ${target.name}`} onClose={() => setTarget(null)}><form onSubmit={adjust} className="grid gap-4"><Input id="stock-delta" label="Quantity change" type="number" value={delta} onChange={(event) => setDelta(event.target.value)} placeholder="Use -2 to remove or 5 to add" required /><Input id="stock-reason" label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} required /><Button type="submit">Save adjustment</Button></form></Modal>}
    </main>
  )
}

export default InventoryPage
