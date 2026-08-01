'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import useChangePath from '@/hooks/changePath'
import { AuthShell } from '@/Components/AuthShell'
import { Button } from '@/Components/ui'

export default function VerifyEmail() {
  const token = useSearchParams().get('code')
  const [status, setStatus] = useState('loading')
  const [countdown, setCountdown] = useState(3)
  const changePath = useChangePath()

  const verify = async () => {
    if (!token) return setStatus('error')
    setStatus('loading')
    try { const response = await Axios({ ...summaryApi.verifyEmail, data: { code: token } }); setStatus(response.data.success ? 'success' : 'error') }
    catch { setStatus('error') }
  }
  useEffect(() => { verify() }, [token])
  useEffect(() => {
    if (status !== 'success') return
    const timer = window.setInterval(() => setCountdown((value) => { if (value <= 1) { window.clearInterval(timer); changePath('/login'); return 0 } return value - 1 }), 1000)
    return () => window.clearInterval(timer)
  }, [status])

  return (
    <AuthShell eyebrow="Email verification" title={status === 'loading' ? 'Checking your link' : status === 'success' ? 'You’re verified' : 'Link not accepted'} description={status === 'loading' ? 'Please keep this page open for a moment.' : status === 'success' ? 'Your account is ready for sign in.' : 'This link may be invalid, expired, or already used.'} footer={<Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">Return to sign in</Link>}>
      <div className="grid min-h-56 place-items-center text-center">{status === 'loading' && <div><Loader2 className="mx-auto animate-spin text-[var(--color-primary)]" size={52} /><p className="mt-5 font-bold">Verifying securely…</p></div>}{status === 'success' && <div><CheckCircle2 className="mx-auto text-[var(--color-secondary)]" size={64} /><p className="mt-5 font-bold">Redirecting to sign in in {countdown}s</p></div>}{status === 'error' && <div><XCircle className="mx-auto text-[var(--color-error)]" size={64} /><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--color-muted)]">Request another verification email from the sign-in screen, or retry if the link was opened before the page finished loading.</p><Button className="mt-5" onClick={verify}>Try this link again</Button></div>}</div>
    </AuthShell>
  )
}
