'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import fetchUserDetails from '@/public/utils/fetchUserDetails'
import { setUserDetails } from '@/public/store/userSlice'
import useChangePath from '@/hooks/changePath'
import { AuthInput, AuthShell, PasswordInput } from '@/Components/AuthShell'
import { Button, Modal } from '@/Components/ui'
import { isStaff } from '@/public/utils/isAdmin'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [resending, setResending] = useState(false)
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const router = useRouter()
  const changePath = useChangePath()

  useEffect(() => { if (user?.id) router.replace(isStaff(user.role) ? '/admin' : '/') }, [router, user?.id, user.role])
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try {
      const response = await Axios({ ...summaryApi.login, data: form })
      if (!response.data.success) throw new Error(response.data.message)
      const details = await fetchUserDetails()
      dispatch(setUserDetails(details.data))
      toast.success('Welcome back')
      changePath(isStaff(details.data.role) ? '/admin' : '/')
    } catch (error) {
      const response = error.response
      if (response?.status === 403 && response.data?.email) setVerificationEmail(response.data.email)
      toast.error(response?.data?.message || error.message || 'Unable to sign in')
    } finally { setLoading(false) }
  }

  const resend = async () => {
    setResending(true)
    try { await Axios({ ...summaryApi.resendVerificationMail, data: { email: verificationEmail } }); toast.success('Verification email sent') }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to resend email') }
    finally { setResending(false) }
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to your table" description="Access saved addresses, order history, and a faster checkout." footer={<>New to Scan My Meal? <Link href="/signup" className="font-bold text-[var(--color-primary)] hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="grid gap-5"><AuthInput id="email" label="Email address" icon={Mail} type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required /><PasswordInput id="password" label="Password" name="password" value={form.password} onChange={update} placeholder="Enter your password" autoComplete="current-password" required /><div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-bold text-[var(--color-secondary)] hover:underline">Forgot password?</Link></div><Button type="submit" size="lg" loading={loading} className="w-full">Sign in</Button></form>
      {verificationEmail && <Modal title="Verify your email" onClose={() => setVerificationEmail('')}><p className="leading-6 text-[var(--color-muted)]">Your account is ready, but the email address <strong className="text-[var(--color-text)]">{verificationEmail}</strong> still needs verification.</p><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setVerificationEmail('')}>Not now</Button><Button loading={resending} onClick={resend}>Resend email</Button></div></Modal>}
    </AuthShell>
  )
}
