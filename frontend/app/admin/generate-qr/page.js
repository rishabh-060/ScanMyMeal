'use client'

import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Button, Card, EmptyState, Input, PageHeader, Skeleton, StatusBadge } from '@/Components/ui'

const TableQrPage = () => {
  const [tables, setTables] = useState([])
  const [tableNumber, setTableNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadTables = async () => {
    try {
      const response = await Axios(summaryApi.adminTables)
      setTables(response.data.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load tables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTables() }, [])

  const createTable = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await Axios({ ...summaryApi.createTable, data: { tableNumber } })
      setTableNumber('')
      await loadTables()
      toast.success('Table QR created')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create table')
    } finally {
      setSaving(false)
    }
  }

  const setActive = async (table) => {
    await Axios({ ...summaryApi.updateTable(table.publicId), data: { isActive: !table.isActive } })
    await loadTables()
  }

  const qrUrl = (table) => `${window.location.origin}/table/${table.publicId}`
  return (
    <main className="space-y-6">
      <PageHeader eyebrow="Dine-in setup" title="Tables and QR codes" description="Each code uses a private public identifier and is validated before a customer can order." />
      <Card className="p-5">
        <form onSubmit={createTable} className="flex flex-col items-end gap-3 sm:flex-row">
          <Input id="table-number" label="Table number" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} required className="w-full" />
          <Button type="submit" loading={saving}>Create table</Button>
        </form>
      </Card>
      {loading && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-80" />)}</div>}
      {!loading && tables.length === 0 && <EmptyState title="No tables yet" description="Create the first table to generate its secure QR code." />}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.publicId} className="grid place-items-center gap-4 p-5 text-center">
            <div className="flex w-full items-center justify-between"><strong>Table {table.tableNumber}</strong><StatusBadge value={table.isActive ? 'ACTIVE' : 'INACTIVE'} /></div>
            <div className="rounded-xl bg-white p-4"><QRCode value={qrUrl(table)} size={180} /></div>
            <code className="w-full overflow-hidden text-ellipsis text-xs text-neutral-500">{qrUrl(table)}</code>
            <Button variant={table.isActive ? 'danger' : 'secondary'} onClick={() => setActive(table)}>{table.isActive ? 'Deactivate' : 'Activate'}</Button>
          </Card>
        ))}
      </div>
    </main>
  )
}

export default TableQrPage
