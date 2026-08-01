'use client'

import { useState } from 'react'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Button, Modal, StatusBadge } from '@/Components/ui'

const ACTIONS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']

const ManageOrder = ({ close, data, fetchUpcomingOrders }) => {
  const [selectedStatus, setSelectedStatus] = useState(data.status || data.order_status?.toUpperCase())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await Axios({ ...summaryApi.manageOrder, data: { orderId: data.publicOrderId || data.orderId, action: selectedStatus } })
      await fetchUpcomingOrders()
      close()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update order')
    } finally { setLoading(false) }
  }
  return (
    <Modal title="Manage order" onClose={close}>
      <p className="font-semibold">{data.publicOrderId || data.orderId}</p>
      <div className="my-3 flex gap-2"><StatusBadge value={data.payment?.status || data.payment_status} /><StatusBadge value={data.status || data.order_status} /></div>
      <div className="space-y-2">{data.items?.map((item) => <p key={item.product} className="text-sm">{item.quantity} x {item.nameSnapshot}</p>)}</div>
      <form onSubmit={submit} className="mt-5 grid gap-3">
        <label className="grid gap-1 text-sm font-medium" htmlFor="status">Order status<select id="status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="min-h-11 rounded-lg border border-neutral-300 px-3">{ACTIONS.map((action) => <option key={action}>{action}</option>)}</select></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={loading}>Update status</Button>
      </form>
    </Modal>
  )
}

export default ManageOrder
