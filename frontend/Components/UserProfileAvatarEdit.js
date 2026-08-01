'use client'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { updateAvatar } from '@/public/store/userSlice'
import { Button, Modal } from './ui'

const UserProfileAvatarEdit = ({ close }) => {
  const user = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData(); formData.append('avatar', file); setLoading(true)
    try { const response = await Axios({ ...summaryApi.uploadAvatar, data: formData }); dispatch(updateAvatar(response.data.data.avatar)); toast.success('Profile photo updated'); close?.() }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to upload photo') }
    finally { setLoading(false) }
  }
  return <Modal title="Change profile photo" onClose={close}><div className="grid place-items-center gap-6"><div className="grid h-40 w-40 place-items-center overflow-hidden rounded-[2rem] bg-[var(--color-surface-soft)] text-5xl font-black text-[var(--color-secondary)]">{user.avatar ? <img src={user.avatar} alt="Current profile" className="h-full w-full object-cover" /> : user.name?.slice(0,1)?.toUpperCase()}</div><p className="max-w-sm text-center text-sm leading-6 text-[var(--color-muted)]">Use a square JPEG, PNG, WebP, or GIF under the upload limit.</p><label className="cursor-pointer"><input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} /><span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 font-bold text-white shadow-lg"><Upload size={18} />{loading ? 'Uploading…' : 'Choose photo'}</span></label><Button variant="ghost" onClick={close}>Cancel</Button></div></Modal>
}

export default UserProfileAvatarEdit
