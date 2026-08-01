'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Mail, UserRound } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import useChangePath from '@/hooks/changePath'
import { AuthInput, AuthShell, PasswordInput } from '@/Components/AuthShell'
import { Button } from '@/Components/ui'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const user = useSelector((state) => state.user)
  const router = useRouter()
  const changePath = useChangePath()
  useEffect(() => { if (user?.id) router.replace('/') }, [router, user?.id])
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try { const response = await Axios({ ...summaryApi.signup, data: form }); toast.success(response.data.message || 'Account created'); changePath('/login') }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to create account') }
    finally { setLoading(false) }
  }
  return (
    <AuthShell eyebrow="Join the table" title="Create your account" description="Set up your profile once and make every future order faster." footer={<>Already have an account? <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">Sign in</Link></>}>
      <form onSubmit={submit} className="grid gap-4"><AuthInput id="name" label="Full name" icon={UserRound} name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" required /><AuthInput id="email" label="Email address" icon={Mail} type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required /><PasswordInput id="password" label="Password" name="password" value={form.password} onChange={update} placeholder="Create a strong password" autoComplete="new-password" required /><PasswordInput id="confirmPassword" label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={update} placeholder="Repeat your password" autoComplete="new-password" required /><p className="text-xs leading-5 text-[var(--color-muted)]">By creating an account, you agree to use Scan My Meal responsibly and keep your sign-in details secure.</p><Button type="submit" size="lg" loading={loading} className="w-full">Create account</Button></form>
    </AuthShell>
  )
}
