'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import useChangePath from '@/hooks/changePath'
import { AuthInput, AuthShell } from '@/Components/AuthShell'
import { Button } from '@/Components/ui'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const changePath = useChangePath()
  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try { const response = await Axios({ ...summaryApi.forgotPassword, data: { email } }); toast.success(response.data.message || 'Check your inbox'); changePath(`/otp-verification?email=${encodeURIComponent(email)}`) }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to start password reset') }
    finally { setLoading(false) }
  }
  return (
    <AuthShell eyebrow="Account recovery" title="Reset your password" description="Enter your account email and we’ll send a secure one-time code." footer={<>Remembered it? <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">Back to sign in</Link></>}>
      <form onSubmit={submit} className="grid gap-5"><AuthInput id="recovery-email" label="Email address" icon={Mail} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /><div className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">For your security, the response is the same whether or not an account exists.</div><Button type="submit" size="lg" loading={loading} className="w-full">Send recovery code</Button></form>
    </AuthShell>
  )
}
