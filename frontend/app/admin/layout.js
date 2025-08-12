'use client'
import RestrictUser from '@/Components/RestrictUser'
import isAdmin from '@/public/utils/isAdmin'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'
import { LayoutDashboard, Layers3, ListOrdered, PlusCircle, Users, ShoppingBag, Calendar } from 'lucide-react'

const page = ({ children }) => {
  const user = useSelector((state) => state.user)
  const admin = isAdmin(user.role)
  const pathname = usePathname()

  if (!admin) {
    return <RestrictUser />
  }

  const links = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={16} /> },
    { label: 'Category', href: '/admin/category', icon: <Layers3 size={16} /> },
    { label: 'Sub Category', href: '/admin/sub-category', icon: <ListOrdered size={16} /> },
    { label: 'Add Menu', href: '/admin/add-product', icon: <PlusCircle size={16} /> },
    { label: 'All Menu List', href: '/admin/products', icon: <ShoppingBag size={16} /> },
    { label: 'Upcoming Orders', href: '/admin/upcoming-orders', icon: <Calendar size={16} /> },
    { label: 'User List', href: '/admin/all-users', icon: <Users size={16} /> },
  ]

  return (
    <main className="container mx-auto grid lg:grid-cols-[260px_1fr] gap-6 min-h-[80vh] py-6">
      {/* Sidebar */}
      <aside
        className="sticky top-4 px-5 py-6 
                  bg-white/30 backdrop-blur-md border border-white/20 shadow-lg 
                  hidden lg:flex flex-col rounded-2xl"
      >
        <h3 className="text-amber-500 font-extrabold text-2xl mb-6 tracking-tight">
          Admin Panel
        </h3>

        <div className="grid gap-2 text-sm">
          {links.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-300
                ${
                  pathname === link.href
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-neutral-700 hover:bg-amber-100 hover:text-neutral-900"
                }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <section
        className="p-6 bg-white/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
      >
        {children}
      </section>
    </main>
  )
}

export default page
