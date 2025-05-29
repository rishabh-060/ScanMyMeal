'use client'
import Image from 'next/image';
import React, { useState } from 'react'
import { FaUserCircle } from 'react-icons/fa';
import { IoCloseCircleSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux'
import { MdOutlineFileUpload } from "react-icons/md"
import { Loader2 } from "lucide-react";
import Axios from '@/public/utils/Axios';
import summaryApi from '@/public/common/summaryApi';
import { toast } from 'react-toastify';
import { updateAvatar } from '@/public/store/userSlice';

const UserProfileAvatarEdit = ({ close }) => {
  const user = useSelector(state => state.user)
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()


  const handleUploadAvatar = async (e) => {
    try {
      const file = e.target.files[0]

      if(!file){
        return
      }

      const formData = new FormData()
      formData.append('avatar', file)

      setLoading(true)

      const response = await Axios({
        ...summaryApi.uploadAvatar,
        data : formData
      })

      
      dispatch(updateAvatar(response.data.data.avatar))
      close()
      toast.success(response?.data?.data?.massage)
    } catch (error) {
      toast.error(error?.response?.data?.massage)
    } finally {
      setLoading(false)
      window.history.back()
    }
  }

  return (
    <section className='fixed lg:top-20 top-5 lg:bottom-20 bottom-5 lg:right-20 right-5 lg:left-20 left-5 bg-neutral-800/60 p-4 '>
      <div className='w-full text-right'>
        <button onClick={ close } className='text-neutral-50'><IoCloseCircleSharp size={35}/></button>
      </div>

      <div className='flex flex-col justify-center items-center w-full pt-18 gap-5'>
        <div className='h-40 w-40 bg-amber-100 rounded-full flex justify-center items-center overflow-hidden drop-shadow-sm'>
          {
            user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className='h-full w-full object-cover'
                height={60}
                width={60}
              />
            ) : (
              <FaUserCircle size={80} className='text-neutral-400'/>
            )
          }
        </div>

        <form>
          <input
            type='file'
            id='uploadProfile'
            className='hidden'
            accept="image/*"
            onChange={handleUploadAvatar}
          />

          <label htmlFor='uploadProfile' className='text-center cursor-pointer'>
            <div className='text-sm mt-2 min-w-22 text-center text-neutral-600 hover:text-neutral-800 font-medium px-4 py-1 bg-amber-100 hover:bg-amber-200 rounded-md'>
              {loading ? (
                <span className='flex justify-center items-center bg-amber-200'>
                  <Loader2 className="animate-spin h-5 w-5 mr-2 inline"/> Uploading...
                </span>
              ) : (
                <div>Upload <MdOutlineFileUpload size={17} className='inline font-extrabold'/></div>
              )
              }
            </div>
          </label>
        </form>

      </div>
    </section>
  )
}

export default UserProfileAvatarEdit