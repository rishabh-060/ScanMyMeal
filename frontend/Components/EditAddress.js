'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { useGlobalContext } from '@/provider/GlobalProvider'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import { Button, Input, Modal } from './ui'

const EditAddress = ({ close, editData }) => {
  const [data, setData] = useState({ _id: editData?._id, address_line: editData?.address_line || '', mobile: editData?.mobile || '', city: editData?.city || '', state: editData?.state || '', country: editData?.country || '', pincode: editData?.pincode || '' })
  const [loading, setLoading] = useState(false)
  const { fetchAddress } = useGlobalContext()
  const change = (event) => setData((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try { const response = await Axios({ ...summaryApi.updateAddress, data }); toast.success(response.data.message || 'Address updated'); await fetchAddress?.(); close?.() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to update address') }
    finally { setLoading(false) }
  }
  return <Modal title="Edit delivery address" onClose={close}><form onSubmit={submit} className="grid gap-4"><Input id="edit-address-line" label="Street address" name="address_line" value={data.address_line} onChange={change} required /><Input id="edit-address-mobile" label="Mobile number" name="mobile" type="tel" value={data.mobile} onChange={change} required /><div className="grid gap-4 sm:grid-cols-2"><Input id="edit-address-city" label="City" name="city" value={data.city} onChange={change} required /><Input id="edit-address-pin" label="PIN code" name="pincode" inputMode="numeric" minLength={6} maxLength={6} value={data.pincode} onChange={change} required /><Input id="edit-address-state" label="State" name="state" value={data.state} onChange={change} required /><Input id="edit-address-country" label="Country" name="country" value={data.country} onChange={change} required /></div><div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={close}>Cancel</Button><Button type="submit" loading={loading}>Update address</Button></div></form></Modal>
}

export default EditAddress
