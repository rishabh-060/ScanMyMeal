'use client'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { FaUserCircle, FaPhoneAlt } from 'react-icons/fa'
import { MdEmail, MdOutlineVerifiedUser } from 'react-icons/md'
import { HiOutlineUser } from 'react-icons/hi'
import { RiMoneyRupeeCircleLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { VscVerifiedFilled } from 'react-icons/vsc'
import useMobile from '@/hooks/useMobile'
import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import RestrictUser from '@/Components/RestrictUser'

const Dashboard = () => {
  const user = useSelector((state) => state.user)
  const [isMobile] = useMobile()
  
  useEffect(() => {
    // if user is not logged in, redirect to login page
    if (!user) {
        <RestrictUser />
    }
  }, [])

  return (
    <main className="px-4 py-6">
      {isMobile && <BacktoHome />}

      <h1 className="text-emerald-600 font-semibold text-center mb-4 text-xl">Account Dashboard</h1>
      <Divider />

      <section className="mt-6">
        <h2 className="text-2xl text-center font-bold text-amber-500 mb-10">
          Hello, {user?.name || "Foodie"}! 👋
        </h2>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-lg hover:shadow-xl transition">
            <div className="h-32 w-32 rounded-full overflow-hidden mb-4 hover:scale-105 transition-transform duration-300">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUserCircle size={100} className="text-neutral-300" />
              )}
            </div>
            <p className="text-neutral-700 font-semibold text-lg text-center">
              {user?.name}
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-amber-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-neutral-800 font-semibold text-center text-lg mb-4">User Info</h3>
            <Divider />

            <div className="space-y-4 mt-4">
              <div className="bg-emerald-200 px-4 py-2 rounded flex items-center gap-3 text-neutral-700 font-medium">
                <HiOutlineUser size={18} />
                <span>{user?.name}</span>
              </div>

              <div className="bg-emerald-200 px-4 py-2 rounded flex justify-between items-center text-neutral-700 font-medium">
                <div className="flex items-center gap-3">
                  <MdEmail size={18} />
                  <span className="truncate">{user?.email}</span>
                </div>

                {!user.verify_email ? (
                  <Link href="#" className="text-xs text-blue-700 underline hover:text-neutral-600">Verify</Link>
                ) : (
                  <VscVerifiedFilled size={20} className="text-blue-700" />
                )}
              </div>

              <div className="bg-emerald-200 px-4 py-2 rounded flex items-center gap-3 text-neutral-700 font-medium">
                <FaPhoneAlt size={16} />
                <span>{user.mobile || "Add mobile number"}</span>
              </div>
            </div>
          </div>

          {/* Order Info Card */}
          <div className="bg-amber-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <h3 className="text-neutral-800 font-semibold text-center text-lg mb-4">Order Info</h3>
            <Divider />

            <div className="mt-6 bg-emerald-200 px-4 py-2 rounded flex items-center justify-center gap-3 text-neutral-700 font-medium">
              <RiMoneyRupeeCircleLine size={22} />
              <span>Total Order ₹15,000/-</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
