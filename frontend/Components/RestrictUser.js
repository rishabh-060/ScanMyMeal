'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, ShieldX } from 'lucide-react'
import { Button, Card } from './ui'

const RestrictUser = () => {
  const router = useRouter()
  return (
    <main className="grid min-h-screen place-items-center bg-[#eff1ed] p-4">
      <Card className="w-full max-w-lg p-7 text-center sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-700"><ShieldX size={29} /></span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary)]">Access restricted</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">You do not have permission for this area</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">Ask an administrator to update your role or grant the required workspace permission.</p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row"><Button variant="outline" onClick={() => router.back()}><ArrowLeft size={16} /> Go back</Button><Button onClick={() => router.push('/')}><Home size={16} /> Restaurant home</Button></div>
      </Card>
    </main>
  )
}

export default RestrictUser
