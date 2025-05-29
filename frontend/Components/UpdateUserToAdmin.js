'use client'
import summaryApi from '@/public/common/summaryApi'
import AlertMessage from '@/public/utils/AlertMessage'
import Axios from '@/public/utils/Axios'
import React, { useState } from 'react'
import { FaEnvelope, FaPhone, FaUser, FaUserShield } from 'react-icons/fa6'
import { IoCloseCircle } from 'react-icons/io5'

const UpdateUserToAdmin = ({data, close, fetchAllUsers}) => {
  const [loading, setLoading] = useState(false)
  
  const handleConvertToUser = async () => {
    setLoading(true)
    try {
        const response = await Axios({
            ...summaryApi.makeUser,
            data: {
                userEmail: data.email
            }
        })

        const { data: responseData } = response;
        if (responseData.success) {
            AlertMessage('Successfull' ,'Admin role updated as user')
            if(close) close()
            if(fetchAllUsers) fetchAllUsers()
        } else {
            AlertMessage('Failed' ,'Failed to update user role')
        }
    } catch (error) {
        AlertMessage('Failed' ,'Server error, please try again later')
    } finally {
        setLoading(false)
    }
  }
  
  const handleConvertToAdmin = async () => {
    setLoading(true)
    try {
        const response = await Axios({
            ...summaryApi.makeAdmin,
            data: {
                userEmail: data.email
            }
        })

        const { data: responseData } = response;
        if (responseData.success) {
            AlertMessage('Successfull' ,'User role updated as ADMIN user')
            if(close) close()
            if(fetchAllUsers) fetchAllUsers()
        } else {
            AlertMessage('Failed' ,'Failed to update user role')
        }
    } catch (error) {
        AlertMessage('Failed' ,'Server error, please try again later')
    } finally {
        setLoading(false)
    }
  }

  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-300/60 w-full h-full flex flex-col z-40 items-center justify-center'>
        <div className='bg-neutral-50 w-full lg:w-128 flex flex-col items-center p-5 pb-8 rounded-lg gap-6'>
            <div className='flex items-center justify-between w-full'>
                <h1 className='text-lg lg:text-xl font-bold text-neutral-700'>Update User Role</h1>
                <button onClick={() => close()} className='text-neutral-700 font-bold block'>
                    <IoCloseCircle size={30} className='text-neutral-700 font-bold'/>
                </button>
            </div>

            <div className='flex flex-col items-center gap-3 p-4 border rounded-lg bg-neutral-100'>
            <img
                src={data.avatar || 'https://img.freepik.com/free-vector/man-profile-account-picture_24908-81754.jpg?semt=ais_hybrid&w=740'}
                alt={data.name}
                className='w-20 h-20 rounded-full object-cover border-2 border-amber-500'
            />
            <h2 className='text-lg font-bold text-amber-700'>{data.name}</h2>
            <p className='text-sm text-neutral-700 flex items-center gap-2'>
                <FaEnvelope /> {data.email}
            </p>
            {data.mobile && (
                <p className='text-sm text-neutral-700 flex items-center gap-2'>
                <FaPhone /> {data.mobile}
                </p>
            )}
            <p className={`text-sm font-semibold ${data.role === 'ADMIN' ? 'text-emerald-600' : 'text-neutral-700'} flex items-center gap-2`}>
                {data.role === 'ADMIN' ? <FaUserShield /> : <FaUser />} {data.role}
            </p>
            </div>

            <div className='mt-6 flex flex-col items-center gap-3'>
            {
                data.role === 'ADMIN' ? (
                    <p className='text-sm text-emerald-600 font-semibold'>This user is already an ADMIN.</p>
                ) : (
                    <p className='text-sm text-neutral-700'>Click the button below to convert this user to ADMIN.</p>
                )
            }
            <div className='w-full grid grid-col-2 gap-4'>
                <button
                    onClick={handleConvertToAdmin}
                    disabled={loading || data.role === 'ADMIN'}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-white ${data.role === 'ADMIN' ? 'bg-neutral-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}  transition ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Updating...' : 'Convert to ADMIN'}
                </button>
                
                <button
                    onClick={handleConvertToUser}
                    disabled={loading || data.role === 'USER'}
                    className={`px-6 py-2.5 rounded-lg font-semibold text-white ${data.role === 'USER' ? 'bg-neutral-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'}  transition ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Updating...' : 'Convert to USER'}
                </button>
            </div>
            </div>
        </div>
    </section>
  )
}

export default UpdateUserToAdmin