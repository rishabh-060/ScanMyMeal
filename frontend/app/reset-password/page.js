"use client"
import Axios from '@/public/utils/Axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { FaUnlockKeyhole, FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { toast } from 'react-toastify';
import summaryApi from '@/public/common/summaryApi';
import useChangePath from '@/hooks/changePath';
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';


// export const metadata = {
//   title: "Scan My Meal",
//   description: "Scan My Meal is a food ordering web app",
// };


const resetPassword = () => {
  const [data, setdata] = useState({
    email : "",
    password: "",
    confirmPassword: ""
  })

  const searchParams = useSearchParams()
  const router = useRouter()
  const changePath = useChangePath();
  const [loading, setLoading] = useState(false);

// get the data from the query params
  useEffect(() => {
      const receivedData = searchParams.get("email");
      const receivedDataStatus = searchParams.get("status")

      if(!receivedDataStatus){
        changePath('/forgot-password')
        toast.error('Unauthorized request')
      }
      if (receivedData) {
        setdata((prev) => {
          return{
            ...prev,
            email : receivedData
          }
        })
      }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target

    setdata((prev) => {
      return{
        ...prev,
        [name] : value
      }
    })
  }

  const [showPass, setshowPass] = useState(true)
  const [showConfirmPass, setshowConfirmPass] = useState(true)

  const validValue = Object.values(data).every(el => el)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if(data.password !== data.confirmPassword){
      toast.error('password and confirm password must be same')

      return
    }

    try {
      // console.log(data.)
      const response = await Axios({
        ...summaryApi.resetPassword,
        data : data
      })

      if(response.data.error){
        toast.error(response.data.message)
      }

      if(response.data.success){
        toast.success(response.data.message)

        setdata({
          email: "",
          password: "",
          confirmPassword: ""
        })

        changePath('/login')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className='container w-full min-h-[65vh] lg:min-h-[68vh]  mx-auto px-4'>
      <div className='bg-white w-full my-4 lg:my-6 mx-auto rounded'>
        <p className='text-neutral-600 py-8 text-center lg:text-xl font-semibold'>Reset Your Password</p>


        <form className='grid gap-3 mt-2 lg:mt-4 pb-10' onSubmit={handleSubmit}>

          <div className='flex w-[80vw] lg:w-[42vh] mx-auto rounded-md overflow-hidden bg-slate-100'>
            <label className='flex items-center justify-center p-2 bg-green-700 text-amber-50' htmlFor='password'><FaUnlockKeyhole size={22}/></label>
            <input
              type={ (showPass)?('password'):('text') }
              id='password'
              spellCheck="false"
              className='w-full outline-none text-green-700 font-semibold px-2'
              placeholder='Enter Your New Password'
              name='password'
              value={data.password}
              onChange={handleChange}
            />
            <div onClick={() => {setshowPass(!showPass)}} className='flex items-center justify-center p-2 mr-1 text-green-800 font-semibold'>
              { (showPass)?(<FaRegEyeSlash size={18}/>):(<FaRegEye size={18}/>) }
            </div>
          </div>

          <div className='flex w-[80vw] lg:w-[42vh] mx-auto rounded-md overflow-hidden bg-slate-100'>
            <label className='flex items-center justify-center p-2 bg-green-700 text-amber-50' htmlFor='confirmPassword'><FaUnlockKeyhole size={22}/></label>
            <input
              type={ (showConfirmPass)?('password'):('text') }
              id='confirmPassword'
              spellCheck="false"
              className='w-full outline-none text-green-700 font-semibold px-2'
              placeholder='confirm Password'
              name='confirmPassword'
              value={data.confirmPassword}
              onChange={handleChange}
            />
            <div onClick={() => {setshowConfirmPass(!showConfirmPass)}} className='flex items-center justify-center p-2 mr-1 text-green-800 font-semibold'>
              { (showConfirmPass)?(<FaRegEyeSlash size={18}/>):(<FaRegEye size={18}/>) }
            </div>
            </div>

            <button
              disabled={!validValue || loading}
              className={`flex items-center justify-center w-[76vw] lg:w-[40vh] mx-auto rounded-full py-2 mt-3 lg:mt-5 text-amber-50 text-lg tracking-widest ${
                validValue && !loading
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
        </form>

        <p className='text-neutral-600 pt-4 pb-4 text-center lg:text-lg'>Back to <Link className='text-green-700 font-semibold' href={'/login'}>Login</Link> page</p>
      </div>
    </section>
  )
}

export default resetPassword