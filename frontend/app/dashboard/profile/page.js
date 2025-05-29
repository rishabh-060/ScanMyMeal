'use client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaUserCircle } from "react-icons/fa"
import { LuPencil } from "react-icons/lu"
import UserProfileAvatarEdit from '@/Components/UserProfileAvatarEdit'
import { Loader2 } from "lucide-react";
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import { toast } from 'react-toastify'
import fetchUserDetails from '@/public/utils/fetchUserDetails'
import useChangePath from '@/hooks/changePath'
import useMobile from '@/hooks/useMobile'
import BacktoHome from '@/Components/BacktoHome'

const Profile = () => {
  const user = useSelector((state) => state.user)
  const [showAvatarEdit, setShowAvatarEdit] = useState(false)
  const [loading, setLoading] = useState(false); // Add loading state
  const dispatch = useDispatch()
  const changePath = useChangePath()
  const [ isMobile ] = useMobile()
  
  const [userData, setUserData] = useState({
    name : user.name,
    mobile : user.mobile || ''
  })

  useEffect(() => {
    setUserData({
      name : user.name,
      mobile : user.mobile || '',
    })
  }, [user])
  

  const validValue = Object.values(userData).every(el => el);
  
  const handleOnChange = (e) => {
    const { name, value } = e.target

    setUserData((prev) => {
      return {
        ...prev,
        [name] : value
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true)
      const response = await Axios({
        ...summaryApi.updateUser,
        data : userData
      })

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        const userData = await fetchUserDetails()
        changePath('/dashboard');
        dispatch(setUserData(userData?.data))
      }

    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    {
      isMobile && <BacktoHome />
    }
    <h1 className="text-2xl font-bold text-amber-500">
      Edit Profile
    </h1>

    <main className='h-full w-full lg:grid lg:grid-cols-[200px_1fr]'>
      {/* Change profile */}
      <div>
        <div className='w-[200px] mx-auto gap-3 flex flex-col items-center justify-center py-12'>
          <div className='h-32 w-32 bg-amber-500 rounded-full flex justify-center items-center overflow-hidden drop-shadow-sm hover:scale-125 cursor-pointer'>
            {
              user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className='h-full w-full object-cover'
                  height={35}
                  width={35}
                  />
                ) : (
                  <FaUserCircle size={80} className='text-neutral-300'/>
              )
            }
          </div>

          <button onClick={() => setShowAvatarEdit(true)} className='text-sm mt-2 min-w-22 text-neutral-800 hover:text-neutral-950 font-medium px-4 py-1 bg-amber-500 hover:bg-amber-600 rounded-md'>Edit profile <LuPencil size={15} className='inline font-extrabold'/></button>
        </div>

        {
          showAvatarEdit && (
            <UserProfileAvatarEdit close={() => setShowAvatarEdit(false)}/>
          )
        }
      </div>

      {/* change other info name mobile email password */}
      <div className='pt-0 pb-12  lg:py-8'>
        <form onSubmit={handleSubmit}>
          <div className='grid'>
            <label className='text-neutral-900 font-medium px-2' htmlFor='name'>Name</label>
            <input
              type='text'
              id='name'
              placeholder='Update Your Name'
              className='px-2 py-1 rounded bg-emerald-100 outline-none text-neutral-700 font-medium mx-auto lg:mx-0 w-72 lg:w-108'
              value={userData.name}
              name='name'
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='grid mt-6'>
            <label className='text-neutral-900 font-medium px-2' htmlFor='mobile'>Mobile</label>
            <input
              type='text'
              id='mobile'
              placeholder='Update Mobile no.'
              className='px-2 py-1 rounded bg-emerald-100 outline-none text-neutral-700 font-medium mx-auto lg:mx-0 w-72 lg:w-108'
              value={userData.mobile}
              name='mobile'
              onChange={handleOnChange}
              required
            />
          </div>

          <button 
            disabled={!validValue || loading}
            className={`flex items-center justify-center mx-auto lg:mx-0 w-72 lg:w-108 rounded-full py-1 mt-10 text-amber-50 text-lg tracking-widest 
              ${validValue && !loading ? "bg-green-700 hover:bg-green-800" : "bg-gray-400 cursor-not-allowed"}`}>
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2"/> Processing...
              </>
            ) : "Update Data"}
          </button>
        </form>
      </div>

    </main>
    </>
  )
}

export default Profile