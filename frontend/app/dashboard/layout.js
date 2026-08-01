'use client'

import { useSelector } from 'react-redux'
import RestrictUser from '@/Components/RestrictUser'
import UserMenu from '@/Components/userMenu'

export default function DashboardLayout({ children }) {
  const user = useSelector((state) => state.user)
  if (!user?.id) return <RestrictUser />
  return (
    <main className="page-container py-6 lg:py-10">
      <div className="mb-5 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white p-2 shadow-sm lg:hidden"><UserMenu compact /></div>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-24 hidden h-fit rounded-[var(--radius-card)] border border-black/[0.06] bg-white p-3 shadow-[var(--shadow-card)] lg:block"><UserMenu /></aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  )
}
