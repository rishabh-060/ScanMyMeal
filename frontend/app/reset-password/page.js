'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import useChangePath from '@/hooks/changePath'
import { AuthShell, PasswordInput } from '@/Components/AuthShell'
import { Button } from '@/Components/ui'

export default function ResetPassword() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const resetToken = params.get('token') || ''
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const changePath = useChangePath()
  useEffect(() => { if (!resetToken) { toast.error('This reset link is not valid'); changePath('/forgot-password') } }, [resetToken])
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try { const response = await Axios({ ...summaryApi.resetPassword, data: { email, resetToken, ...form } }); toast.success(response.data.message || 'Password updated'); changePath('/login') }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to reset password') }
    finally { setLoading(false) }
  }
  return (
    <AuthShell eyebrow="Almost there" title="Choose a new password" description="Use a strong password you don’t reuse elsewhere." footer={<>Back to <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">sign in</Link></>}>
      <form onSubmit={submit} className="grid gap-5"><PasswordInput id="new-password" label="New password" name="password" value={form.password} onChange={update} placeholder="Enter a new password" autoComplete="new-password" required /><PasswordInput id="confirm-password" label="Confirm new password" name="confirmPassword" value={form.confirmPassword} onChange={update} placeholder="Repeat the new password" autoComplete="new-password" required /><Button type="submit" size="lg" loading={loading} className="w-full">Update password</Button></form>
    </AuthShell>
  )
}
