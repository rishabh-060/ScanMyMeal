"use client"
import Axios from '@/public/utils/Axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { FaMobileScreen } from "react-icons/fa6";
import { toast } from 'react-toastify';
import summaryApi from '@/public/common/summaryApi';
import { Loader2 } from "lucide-react";
import useChangePath from '@/hooks/changePath';
import { useRouter } from 'next/router';


// export const metadata = {
//   title: "Scan My Meal",
//   description: "Scan My Meal is a food ordering web app",
// };


const forgotPassword = () => {
  const [data, setdata] = useState({
    email: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setdata((prev) => {
      return{
        ...prev,
        [name] : value
      }
    })
  }
  
  const changePath = useChangePath()
  const router = useRouter();

  const [loading, setLoading] = useState(false); // Add loading state

  const validValue = Object.values(data).every(el => el)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); // Start loading

    try {
      const response = await Axios({
        ...summaryApi.forgotPassword,
        data : data,
      })

      if(response.data.error){
        toast.error(response.data.message)
      }
      
      if(response.data.success){
        toast.success(response.data.message)

        router.push('/otp-verification', data.email)

        setdata({
          email: ""
        })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setLoading(false); // Stop loading after API response
    }
  }
  return (
    <section className='container w-full min-h-[65vh] lg:min-h-[68vh]  mx-auto px-4'>
      <div className='bg-white w-full my-4 lg:my-6 mx-auto rounded'>
        <p className='text-neutral-600 py-8 text-center text-lg lg:text-xl font-semibold'>Reset Password</p>


        <form className='grid gap-3 mt-2 lg:mt-4 pb-10' onSubmit={handleSubmit}>

          <div className='flex w-[80vw] lg:w-[42vh] mx-auto rounded-md overflow-hidden bg-slate-100'>
            <label className='flex items-center justify-center p-2 bg-green-700 text-amber-50' htmlFor='email'><FaMobileScreen size={25}/></label>
            <input
              type='email'
              id='email'
              autoFocus
              spellCheck="false"
              className='w-full outline-none text-green-700 font-semibold px-2'
              placeholder='Enter Your Email id'
              name='email'
              value={data.email}
              onChange={handleChange}
            />
          </div>

          <button 
            disabled={!validValue || loading} 
            className={`flex items-center justify-center w-[76vw] lg:w-[40vh] mx-auto rounded-full py-2 mt-3 lg:mt-5 text-amber-50 text-lg tracking-widest 
            ${validValue && !loading ? "bg-green-700 hover:bg-green-800" : "bg-gray-400 cursor-not-allowed"}`}>
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2"/> Processing...
              </>
            ) : "Forgot Password"}
          </button>
        </form>

        <p className='text-neutral-600 pt-4 pb-4 text-center lg:text-lg'>Back to <Link className='text-green-700 font-semibold' href={'/login'}>Login</Link> page</p>
      </div>
    </section>
  )
}

export default forgotPassword