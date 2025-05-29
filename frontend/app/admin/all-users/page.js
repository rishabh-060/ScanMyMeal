'use client'

import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import RestrictUser from '@/Components/RestrictUser'
import useMobile from '@/hooks/useMobile'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaUserShield, FaUser, FaEnvelope, FaPhone, FaBoxOpen } from 'react-icons/fa'
import UpdateUserToAdmin from '@/Components/UpdateUserToAdmin'
import AccoutSuspention from '@/Components/AccoutSuspention'

const Page = () => {
  const [isMobile] = useMobile()
  const user = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [openEditUser, setOpenEditUser] = useState(false)
  const [openSuspentionTab, setOpenSuspentionTab] = useState(false)
  const [editUserData, setEditUserData] = useState(null)

  if (!isAdmin(user.role)) {
    return <RestrictUser />
  }

  const fetchAllUsers = async () => {
    setLoading(true)
    try {
      const response = await Axios({ ...summaryApi.getAllUsers })
      const { data: responseData } = response
      if (responseData.success) {
        setAllUsers(responseData.data)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [openEditUser])

  return (
    <main className='px-2 lg:px-5'>
      {isMobile && <BacktoHome />}
      <h1 className='text-emerald-600 font-bold text-center my-2 lg:my-6 text-2xl'>All User List</h1>

      <Divider />

      <section className='bg-amber-400 rounded-lg w-full min-h-52 my-6 p-3 lg:p-5'>
        <h1 className='text-amber-700 font-bold text-center my-2 lg:my-6 text-2xl'>Users List</h1>

        {loading ? (
          <p className='text-center text-amber-800 font-semibold'>Loading...</p>
        ) : allUsers.length === 0 ? (
          <p className='text-center text-amber-800 font-semibold'>No users found</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 2xl:grid-cols-2 3xl:grid-col-3 gap-4'>
            {allUsers.map((user) => {
              const isSuspended = user.status === 'Suspended' // Assuming a 'status' field exists
              return (
                <div
                  key={user._id}
                  className={`relative bg-white rounded-xl p-4 shadow-md flex items-start gap-4 transition-transform duration-300 ${
                    isSuspended ? 'opacity-80 grayscale' : 'cursor-pointer hover:bg-amber-100 hover:shadow-lg'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-16 h-16 rounded-full object-cover border-2 border-amber-500'
                  />
                  <div className='flex-1'>
                    <h2 className='text-lg font-bold text-amber-700'>{user.name}</h2>
                    <p className='text-sm text-gray-700 flex items-center gap-2'>
                      <FaEnvelope className='text-amber-600' /> {user.email}
                    </p>
                    {user.mobile && (
                      <p className='text-sm text-gray-700 flex items-center gap-2'>
                        <FaPhone className='text-amber-600' /> {user.mobile}
                      </p>
                    )}
                    <p
                      className={`text-sm font-semibold ${
                        user.role === 'ADMIN' ? 'text-emerald-600' : 'text-gray-700'
                      } flex items-center gap-2`}
                    >
                      {user.role === 'ADMIN' ? <FaUserShield /> : <FaUser />} {user.role}
                    </p>
                    <p className='text-sm text-gray-700 flex items-center gap-2'>
                      <FaBoxOpen className='text-amber-600' /> Orders: {user.order_history?.length || 0}
                    </p>
                  </div>

                  
                  <div className='flex flex-col gap-2'>
                    <button
                      className='text-xs bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-600 transition'
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditUserData(user)
                        setOpenEditUser(true)
                      }}
                    >
                      Edit User Role
                    </button>
                    <button
                      className={`text-xs ${ isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600' } text-white px-3 py-1 rounded transition`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenSuspentionTab(true)
                        setEditUserData(user)
                      }}
                    >
                      { isSuspended ? 'Remove Suspension' : 'Suspend User' }
                    </button>
                  </div>
                  
                </div>
              )
            })}
          </div>
        )}
      </section>

      {openEditUser && (
        <UpdateUserToAdmin
          data={editUserData}
          close={() => setOpenEditUser(false)}
          fetchAllUsers={fetchAllUsers}
        />
      )}

      {
        openSuspentionTab && (
          <AccoutSuspention
            data={editUserData}
            close={() => setOpenSuspentionTab(false)}
            fetchAllUsers={fetchAllUsers}
          />
        )
      }
    </main>
  )
}

export default Page
