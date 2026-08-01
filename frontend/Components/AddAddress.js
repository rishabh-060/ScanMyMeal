'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { useGlobalContext } from '@/provider/GlobalProvider'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import { Button, Input, Modal } from './ui'

const AddAddress = ({ close }) => {
  const [data, setData] = useState({ address_line: '', mobile: '', city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', pincode: '' })
  const [loading, setLoading] = useState(false)
  const { fetchAddress } = useGlobalContext()
  const change = (event) => setData((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try { const response = await Axios({ ...summaryApi.addAddress, data }); toast.success(response.data.message || 'Address added'); await fetchAddress?.(); close?.() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to add address') }
    finally { setLoading(false) }
  }
  return <Modal title="Add delivery address" onClose={close}><form onSubmit={submit} className="grid gap-4"><Input id="new-address-line" label="Street address" name="address_line" value={data.address_line} onChange={change} placeholder="House number, street, landmark" required /><Input id="new-address-mobile" label="Mobile number" name="mobile" type="tel" inputMode="numeric" value={data.mobile} onChange={change} placeholder="10-digit mobile number" required /><div className="grid gap-4 sm:grid-cols-2"><Input id="new-address-city" label="City" name="city" value={data.city} onChange={change} required /><Input id="new-address-pin" label="PIN code" name="pincode" inputMode="numeric" minLength={6} maxLength={6} value={data.pincode} onChange={change} required /><Input id="new-address-state" label="State" name="state" value={data.state} onChange={change} required /><Input id="new-address-country" label="Country" name="country" value={data.country} onChange={change} required /></div><div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={close}>Cancel</Button><Button type="submit" loading={loading}>Save address</Button></div></form></Modal>
}

export default AddAddress
