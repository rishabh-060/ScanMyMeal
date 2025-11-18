'use client'
import RestrictUser from '@/Components/RestrictUser'
import isAdmin from '@/public/utils/isAdmin'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'
import { LayoutDashboard, Layers3, ListOrdered, PlusCircle, Users, ShoppingBag, Calendar, QrCode } from 'lucide-react'

const page = ({ children }) => {
  const user = useSelector((state) => state.user)
  const admin = isAdmin(user.role)
  const pathname = usePathname()

  if (!admin) {
    return <RestrictUser />
  }

  const links = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={16} /> },
    { label: 'Generate QR Code', href: '/admin/generate-qr', icon: <QrCode size={16} /> },
    { label: 'Category', href: '/admin/category', icon: <Layers3 size={16} /> },
    { label: 'Sub Category', href: '/admin/sub-category', icon: <ListOrdered size={16} /> },
    { label: 'Add Menu', href: '/admin/add-product', icon: <PlusCircle size={16} /> },
    { label: 'All Menu List', href: '/admin/products', icon: <ShoppingBag size={16} /> },
    { label: 'Upcoming Orders', href: '/admin/upcoming-orders', icon: <Calendar size={16} /> },
    { label: 'User List', href: '/admin/all-users', icon: <Users size={16} /> },
  ]

  return (
    <main className="container mx-auto grid lg:grid-cols-[250px_1fr] gap-4 min-h-[72vh] py-4">
      <aside className="sticky top-0 px-4 py-4 bg-neutral-100 border-r border-neutral-300 hidden lg:block rounded">
        <h3 className="text-amber-600 font-bold text-xl mb-4">Admin Panel</h3>
        <div className="grid gap-2 text-sm">
          {links.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium ${
                pathname === link.href
                  ? 'bg-amber-500 text-white'
                  : 'text-neutral-600 hover:bg-amber-100 hover:text-neutral-900'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </aside>

      <main className="p-4 bg-neutral-100 rounded">{children}</main>
    </main>
  )
}

export default page
