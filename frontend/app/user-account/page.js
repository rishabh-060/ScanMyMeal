'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import UserMenu from '@/Components/userMenu'
import { PageHeader } from '@/Components/ui'

export default function UserAccount() {
  const user = useSelector((state) => state.user)
  const router = useRouter()
  useEffect(() => { if (!user?.id) router.replace('/login') }, [router, user?.id])
  if (!user?.id) return null
  return <main className="page-container min-h-[70vh] py-8"><div className="mx-auto max-w-xl space-y-6"><PageHeader eyebrow="Account" title="Where would you like to go?" description="Manage orders, delivery details, and your personal information." /><section className="rounded-[var(--radius-card)] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)]"><UserMenu /></section></div></main>
}
