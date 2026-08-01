'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, LogOut, MapPin, Package, Settings, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { logout } from '@/public/store/userSlice'
import isAdmin from '@/public/utils/isAdmin'
import useChangePath from '@/hooks/changePath'

const links = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My orders', href: '/dashboard/my-orders', icon: Package },
  { label: 'Addresses', href: '/dashboard/address', icon: MapPin },
  { label: 'Profile settings', href: '/dashboard/profile', icon: Settings },
]

const UserMenu = ({ close, compact = false }) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const pathname = usePathname()
  const changePath = useChangePath()
  const admin = isAdmin(user.role)

  const handleLogout = async () => {
    try { await Axios(summaryApi.logout); dispatch(logout()); close?.(); changePath('/'); toast.success('Signed out') }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to sign out') }
  }

  return (
    <div className={compact ? '' : 'space-y-4'}>
      <div className={`flex items-center gap-3 ${compact ? 'border-b border-black/[0.06] p-2 pb-4' : 'rounded-2xl bg-[var(--color-surface-soft)] p-4'}`}><span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white font-black text-[var(--color-secondary)] shadow-sm">{user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name?.slice(0, 1)?.toUpperCase()}</span><div className="min-w-0"><strong className="block truncate text-sm">{user.name || 'Your account'}</strong><span className="block truncate text-xs text-[var(--color-muted)]">{user.email}</span></div></div>
      <nav className={`grid gap-1 ${compact ? 'pt-3' : ''}`} aria-label="Account navigation">{links.map(({ label, href, icon: Icon }) => { const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={close} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${active ? 'bg-[#19221d] text-white shadow-md' : 'text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-text)]'}`}><Icon size={18} />{label}</Link> })}{admin && <Link href="/admin" onClick={close} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[var(--color-secondary)] hover:bg-emerald-50"><ShieldCheck size={18} />Admin workspace</Link>}</nav>
      <button onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-[var(--color-error)] hover:bg-red-50"><LogOut size={18} />Sign out</button>
    </div>
  )
}

export default UserMenu
