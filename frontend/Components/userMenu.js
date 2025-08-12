'use client'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Divider from './Divider'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { logout } from '@/public/store/userSlice'
import { toast } from 'react-toastify'
import { RiDashboardLine, RiExternalLinkLine, RiHome2Line, RiLogoutBoxLine, RiMapPinLine, RiShoppingBag3Line } from "react-icons/ri";
import usePath from '@/hooks/usePath'
import isAdmin from '@/public/utils/isAdmin'
import useChangePath from '@/hooks/changePath'

const UserMenu = ({close}) => {
  const user = useSelector((state) => state.user)
  const admin = isAdmin(user.role)
  const dispatch = useDispatch()
  const isEditPage = usePath('/dashboard/profile')
  const changePath = useChangePath()

  const handleLogout = async () => {
    try {
        const response = await Axios({
            ...summaryApi.logout
        })

        if(response.data.success){
          if(close){
            close()
          }
          dispatch(logout())
          localStorage.clear()
          // window.history.back()
          changePath('/')
          toast.success(response.data.message)
        }
    } catch (error) {
        toast.error(error?.response?.data?.massage)
    }
  }

  const handleClose = () => {
    if ( close ) close()
  }

  return (
    <div className="p-4 md:rounded-lg bg-white shadow-md md:max-w-64">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <span className="font-semibold text-gray-700">My Account</span>
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 font-medium text-emerald-700 truncate hover:text-emerald-600"
        >
          {admin && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
          )}
          <span className="truncate">{user.name}</span>
        </Link>
        {admin && (
          <Link
            href="/admin"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-500 font-medium"
          >
            <RiDashboardLine size={14} /> Admin Dashboard
          </Link>
        )}
      </div>

      <Divider />

      {/* Menu Links */}
      <div className="grid text-sm gap-1 text-gray-600 mt-3">
        <Link 
          href="/dashboard/my-orders" 
          onClick={handleClose} 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-amber-100 hover:text-gray-900 transition"
        >
          <RiShoppingBag3Line size={16} /> My Orders
        </Link>

        <Link 
          href="/dashboard/address" 
          onClick={handleClose} 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-amber-100 hover:text-gray-900 transition"
        >
          <RiMapPinLine size={16} /> Saved Address
        </Link>

        {!isEditPage ? (
          <Link 
            href="/dashboard/profile" 
            onClick={handleClose} 
            className="flex items-center gap-2 p-2 rounded-md hover:bg-amber-100 hover:text-gray-900 transition"
          >
            <RiExternalLinkLine size={16} /> Edit Profile
          </Link>
        ) : (
          <Link 
            href="/" 
            onClick={handleClose} 
            className="flex items-center gap-2 p-2 rounded-md hover:bg-amber-100 hover:text-gray-900 transition"
          >
            <RiHome2Line size={16} /> Home
          </Link>
        )}

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 p-2 rounded-md text-red-600 hover:text-white hover:bg-red-500 transition text-left"
        >
          <RiLogoutBoxLine size={16} /> Log Out
        </button>
      </div>
    </div>
  )
}

export default UserMenu