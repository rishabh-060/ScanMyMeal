'use client'
import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import useMobile from '@/hooks/useMobile'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Sparkles, LineChart, PackageCheck, Users, ShoppingCart, Layers, List } from 'lucide-react'
import Link from 'next/link'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'

const DashboardPage = () => {
  const [isMobile] = useMobile()
  const user = useSelector((state) => state.user)
  const categories = useSelector((state) => state.product.allCategory) || []
  const subCategories = useSelector((state) => state.product.allSubCategory) || []
  const [products, setProducts] = useState(0)
  const orders = useSelector((state) => state.orders.orders) || []
  const [users, setUsers] = useState(0)


  const fetchAllUsers = async () => {
    try {
      const response = await Axios({ ...summaryApi.getAllUsers })
      const { data: responseData } = response
      if (responseData.success) {
        setUsers(responseData.data.length)
      }
    } catch (error) {
    }
  }

  const fetchAllProducts = async () => {
    try {
      const response = await Axios({ ...summaryApi.productLength })
      const { data: responseData } = response
      if (responseData.success) {
        setProducts(responseData.data.length)
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    fetchAllUsers()
    fetchAllProducts()
  }, [])
  // Calculate total revenue from orders
  const totalRevenue = orders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0

  const stats = [
    { title: 'Registered Users', value: users, icon: <Users className="text-amber-600" /> },
    { title: 'Categories', value: categories.length, icon: <Layers className="text-amber-600" /> },
    { title: 'Subcategories', value: subCategories.length, icon: <List className="text-amber-600" /> },
    { title: 'Menu Items', value: products, icon: <PackageCheck className="text-amber-600" /> },
    { title: 'Total Orders', value: orders.length, icon: <ShoppingCart className="text-amber-600" /> },
    { title: 'Revenue (₹)', value: `₹${totalRevenue.toLocaleString()}`, icon: <LineChart className="text-amber-600" /> },
  ]

  const quickLinks = [
    { label: 'Add New Item', href: '/admin/add-product' },
    { label: 'Manage Categories', href: '/admin/category' },
    { label: 'Upcoming Orders', href: '/admin/upcoming-orders' },
    { label: 'View All Users', href: '/admin/all-users' },
  ]


  return (
    <main className="px-4 py-6">
      {isMobile && <BacktoHome />}

      <section className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 rounded-xl shadow-md text-white mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2 animate-fade-in">
          <Sparkles size={28} /> Welcome, {user?.name || 'Admin'}! 👋
        </h2>
        <p className="mt-2 text-lg">Your admin panel at a glance!</p>
      </section>

      <Divider />

      <section className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center gap-4 hover:shadow-lg transition duration-300">
            <div className="p-2 bg-amber-100 rounded-full">
              {stat.icon}
            </div>
            <div>
              <h4 className="text-lg font-semibold">{stat.title}</h4>
              <p className="text-amber-600 font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-amber-600">Quick Links</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickLinks.map((link, i) => (
            <Link key={i} href={link.href} className="p-3 rounded-lg bg-neutral-100 hover:bg-amber-100 transition text-amber-700 font-semibold shadow-sm">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
