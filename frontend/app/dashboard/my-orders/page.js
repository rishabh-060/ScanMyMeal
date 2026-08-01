'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, EmptyState, PageHeader, StatusBadge } from '@/Components/ui'

const normalizedItems = (order) => order.items?.length ? order.items : [{
  nameSnapshot: order.product_details?.name,
  imageSnapshot: order.product_details?.image || [],
  quantity: 1,
  subtotal: order.totalAmt,
}]

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.orders)
  const [openOrder, setOpenOrder] = useState('')
  return (
    <main className="space-y-5 p-2 lg:p-5">
      <PageHeader eyebrow="Order history" title="My orders" description="Track each complete checkout and expand it to review every item." />
      {!orders.length && <EmptyState title="No orders yet" description="Your completed checkouts will appear here." />}
      <div className="space-y-4">
        {orders.map((order) => {
          const items = normalizedItems(order)
          const quantity = items.reduce((total, item) => total + Number(item.quantity || 1), 0)
          const id = order.publicOrderId || order.orderId
          const expanded = openOrder === order._id
          return (
            <Card key={order._id} className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Order ID</p>
                  <h2 className="font-bold text-emerald-800">{id}</h2>
                  <p className="mt-1 text-sm text-neutral-600">{new Date(order.createdAt).toLocaleString()} · {order.orderType || 'LEGACY'} · {items.length} item{items.length === 1 ? '' : 's'} / {quantity} total</p>
                  <p className="mt-1 text-sm text-neutral-600">{order.orderType === 'DINE_IN' ? `Table ${order.table?.tableNumber || ''}` : order.deliveryAddress?.addressLine || order.delivery_address?.address_line || 'Takeaway'}</p>
                </div>
                <div className="flex items-start gap-2"><StatusBadge value={order.payment?.status || order.payment_status} /><StatusBadge value={order.status || order.order_status} /></div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
                <strong>₹{order.pricing?.grandTotal ?? order.totalAmt}</strong>
                <button onClick={() => setOpenOrder(expanded ? '' : order._id)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-semibold text-amber-700" aria-expanded={expanded}>{expanded ? 'Hide details' : 'View details'}{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
              </div>
              {expanded && <div className="mt-3 grid gap-3 border-t border-dashed border-neutral-300 pt-4">{items.map((item, index) => <div key={`${item.product || index}`} className="flex items-center gap-3"><img src={item.imageSnapshot?.[0] || '/assets/favicon.png'} alt="" className="h-14 w-14 rounded-lg object-cover" /><div className="flex-1"><p className="font-semibold">{item.nameSnapshot}</p><p className="text-sm text-neutral-600">Quantity: {item.quantity || 1}</p></div><strong>₹{item.subtotal}</strong></div>)}</div>}
            </Card>
          )
        })}
      </div>
    </main>
  )
}

export default MyOrders
