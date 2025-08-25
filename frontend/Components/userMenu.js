'use client'
import Link from 'next/link'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Divider from './Divider'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { logout } from '@/public/store/userSlice'
import { toast } from 'react-toastify'
import { RiExternalLinkLine } from "react-icons/ri";
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
    <div>
        <div className='font-medium text-neutral-600'>My Account</div>
        <Link href={'/dashboard'} className='font-medium text-emerald-700 max-w-48 text-ellipsis line-clamp-1 hover:bg-emerald-300 px-0.5'>
          {
            admin && <span className='font-bold text-xs text-red-600 pr-1'>ADMIN</span>
          }
          {user.name}
        </Link>
        {
          admin && (
            <div className='text-xs text-neutral-600 cursor-pointer px-1 mb-4'>
              <Link href={'/admin'} className='hover:text-amber-500 font-medium'>Admin Dashboard</Link>
            </div>
          )
        }
        <Divider/>

        <div className='grid text-sm gap-1 text-neutral-600 cursor-pointer'>
            <Link href={'/dashboard/my-orders'} onClick={handleClose} className='hover:text-neutral-900 font-medium hover:bg-amber-500 p-1'>My Orders</Link>
            <Link href={'/dashboard/address'} onClick={handleClose} className='hover:text-neutral-900 font-medium hover:bg-amber-500 p-1'>Save Address</Link>

            {
              (!isEditPage) ? (
                <Link href={'/dashboard/profile'} onClick={handleClose} className='hover:text-neutral-900 font-medium hover:bg-amber-500 p-1'>Edit Profile <RiExternalLinkLine size={15} className='inline'/></Link>
              ) : (
                <Link href={'/'} onClick={handleClose} className=' hover:text-neutral-900 font-medium hover:bg-amber-500 p-1'>Home <RiExternalLinkLine size={15} className='inline'/></Link>
              )
            }
            <button onClick={() => handleLogout()} className='text-red-600 hover:text-neutral-700 font-medium text-left hover:bg-red-500 p-1'>Log Out</button>
        </div>
    </div>
  )
}

export default UserMenu