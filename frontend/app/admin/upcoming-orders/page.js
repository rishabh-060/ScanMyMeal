'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import ManageOrder from '@/Components/ManageOrder'
import { Card, EmptyState, Input, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)

  const loadOrders = useCallback(async () => {
    try {
      const response = await Axios({ ...summaryApi.upcomingOrders, params: { search: search || undefined, status: status || undefined, limit: 50 } })
      setOrders(response.data.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load orders')
    } finally { setLoading(false) }
  }, [search, status])

  useEffect(() => {
    const debounce = window.setTimeout(loadOrders, 250)
    const poll = window.setInterval(loadOrders, 10_000)
    return () => { window.clearTimeout(debounce); window.clearInterval(poll) }
  }, [loadOrders])

  return (
    <main className="space-y-5">
      <PageHeader eyebrow="Live service" title="Orders" description="Grouped checkouts refresh automatically every 10 seconds." />
      <Card className="grid gap-3 p-4 sm:grid-cols-2">
        <Input id="order-search" label="Search order ID" value={search} onChange={(event) => setSearch(event.target.value)} />
        <label className="grid gap-1.5 text-sm font-medium">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-lg border border-neutral-300 px-3"><option value="">All statuses</option>{['PLACED','CONFIRMED','PREPARING','READY','SERVED','COMPLETED','CANCELLED'].map((value) => <option key={value}>{value}</option>)}</select></label>
      </Card>
      {loading && <div className="grid gap-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-28" />)}</div>}
      {!loading && !orders.length && <EmptyState title="No matching orders" description="New checkouts will appear here automatically." />}
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order._id} className="cursor-pointer p-5 hover:border-amber-400" onClick={() => setSelected(order)}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="font-bold text-emerald-800">{order.publicOrderId || order.orderId}</h2><p className="text-sm text-neutral-600">{order.orderType || 'LEGACY'} · {order.items?.length || 1} distinct items · {new Date(order.createdAt).toLocaleString()}</p><p className="mt-1 text-sm">{order.table?.tableNumber ? `Table ${order.table.tableNumber}` : order.deliveryAddress?.addressLine || 'Takeaway'}</p></div><div className="flex items-start gap-2"><StatusBadge value={order.payment?.status || order.payment_status} /><StatusBadge value={order.status || order.order_status} /></div></div>
            <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3"><span>{order.userId?.name || 'Customer'}</span><strong>₹{order.pricing?.grandTotal ?? order.totalAmt}</strong></div>
          </Card>
        ))}
      </div>
      {selected && <ManageOrder data={selected} close={() => setSelected(null)} fetchUpcomingOrders={loadOrders} />}
    </main>
  )
}

export default AdminOrdersPage
