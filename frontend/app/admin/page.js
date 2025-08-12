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
        setProducts(responseData?.data)
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
    { title: 'Menu Items', value: products || 0, icon: <PackageCheck className="text-amber-600" /> },
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
    <main className="px-4 py-6 space-y-8">
      {/* Mobile Back Button */}
      {isMobile && <BacktoHome />}

      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-6 text-white shadow-lg">
        {/* Background Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl"></div>

        <h2 className="text-3xl font-extrabold flex items-center gap-3 animate-fade-in">
          <Sparkles size={30} /> Hii, {user?.name || 'Admin'}! 👋
        </h2>
        <p className="mt-2 text-lg opacity-90">Welcome to <span className="font-semibold">Scan-My-Meal</span></p>
      </section>

      <Divider />

      {/* Stats Section */}
      <section>
        <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Dashboard Overview</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-md p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transform transition duration-300"
            >
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full group-hover:scale-110 transition duration-300">
                {stat.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">{stat.title}</h4>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links Section */}
      <section>
        <h3 className="text-xl font-bold mb-4 text-amber-600">⚡ Quick Actions</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-amber-400 hover:bg-amber-50 transition shadow-sm hover:shadow-md font-medium text-gray-700 hover:text-amber-700 flex items-center gap-2"
            >
              <span className="text-amber-500">➜</span> {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
