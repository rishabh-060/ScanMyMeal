'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import useChangePath from '@/hooks/changePath'
import { AuthShell } from '@/Components/AuthShell'
import { Button } from '@/Components/ui'

export default function OtpVerification() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(600)
  const [loading, setLoading] = useState(false)
  const refs = useRef([])
  const params = useSearchParams()
  const email = params.get('email') || ''
  const changePath = useChangePath()

  useEffect(() => { const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer) }, [])
  const format = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
  const update = (index, value) => { const digit = value.replace(/\D/g, '').slice(-1); setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item)); if (digit && index < 5) refs.current[index + 1]?.focus() }

  const verify = async (event) => {
    event.preventDefault()
    if (!email || timeLeft === 0) return toast.error(timeLeft === 0 ? 'This code has expired' : 'Email is missing')
    setLoading(true)
    try { const response = await Axios({ ...summaryApi.forgotPasswordOtpVerification, data: { otp: digits.join(''), email } }); const token = response.data.data?.resetToken; toast.success('Code verified'); changePath(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`) }
    catch (error) { toast.error(error.response?.data?.message || 'The code could not be verified') }
    finally { setLoading(false) }
  }

  const resend = async () => {
    setLoading(true)
    try { await Axios({ ...summaryApi.forgotPassword, data: { email } }); setDigits(['', '', '', '', '', '']); setTimeLeft(600); toast.success('A new code has been sent') }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to resend code') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell eyebrow="Security check" title="Enter your 6-digit code" description={<>We sent a one-time code to <strong className="text-[var(--color-text)]">{email || 'your email'}</strong>.</>} footer={<>Wrong email? <Link href="/forgot-password" className="font-bold text-[var(--color-primary)] hover:underline">Start again</Link></>}>
      <form onSubmit={verify} className="grid gap-6"><div className="flex justify-between gap-2">{digits.map((digit, index) => <input key={index} ref={(element) => { refs.current[index] = element }} value={digit} onChange={(event) => update(index, event.target.value)} onKeyDown={(event) => event.key === 'Backspace' && !digit && index > 0 && refs.current[index - 1]?.focus()} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} aria-label={`Digit ${index + 1}`} className="h-14 min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-center text-xl font-black outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-orange-100" />)}</div><div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-soft)] p-4 text-sm"><span className="text-[var(--color-muted)]">Code expires in</span><strong className={timeLeft ? 'text-[var(--color-secondary)]' : 'text-[var(--color-error)]'}>{format}</strong></div><Button type="submit" size="lg" loading={loading} disabled={!digits.every(Boolean)} className="w-full">Verify code</Button>{timeLeft === 0 && <Button type="button" variant="outline" onClick={resend} loading={loading} className="w-full">Send a new code</Button>}</form>
    </AuthShell>
  )
}
