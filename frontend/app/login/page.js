"use client"
import Axios from '@/public/utils/Axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { FaUnlockKeyhole, FaRegEyeSlash, FaRegEye, FaMobileScreen, FaEnvelope } from "react-icons/fa6";
import { toast } from 'react-toastify';
import summaryApi from '@/public/common/summaryApi';
import useChangePath from '@/hooks/changePath';
import { Loader2 } from "lucide-react";
import fetchUserDetails from '@/public/utils/fetchUserDetails';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from '@/public/store/userSlice';
import { useRouter } from 'next/navigation';
import { IoCloseCircle } from 'react-icons/io5';


const Login = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)

  const changePath = useChangePath()
  const router = useRouter()

  useEffect(() => {
    if (user?.id) {
      router.back()
    }
  }, [])

  const [data, setdata] = useState({
    email: "",
    password: ""
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

  const [loading, setLoading] = useState(false); // Add loading state

  const [showPass, setshowPass] = useState(true)
  const [showMailVericationNotification, setShowMailVerificationNotification] = useState(false);
  const [verificationMailId, setVerificationMailId] = useState('');
  const [requesting, setRequesting] = useState(false);

  const validValue = Object.values(data).every(el => el)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true); // Start loading

    try {
      const response = await Axios({
        ...summaryApi.login,  //
        data : data
      })

      if(response.data.error){
        if(response?.status) {
          setVerificationMailId(response?.data?.email);
          setShowMailVerificationNotification(true);
        }
        toast.error(response.data.message)
        // setLoading(false);
        // return;
      }
      
      if(response.data.success){
        toast.success(response.data.message)

        localStorage.setItem('accessToken', response.data.data.accessToken)
        localStorage.setItem('refreshToken', response.data.data.refreshToken)

        const userDetails = await fetchUserDetails()

        dispatch(setUserDetails(userDetails.data))

        setdata({
          email: "",
          password: ""
        })

        changePath('/')
      }
    } catch (error) {
      if(error?.response?.status) {
        setVerificationMailId(error?.response?.data?.email);
        setShowMailVerificationNotification(true);
      }
      toast.error(error?.response?.data?.message)
    } finally {
      setLoading(false);
    }
  }

  const requestForVerificationMail = async () => {
    try {
      setRequesting(true);
      const response = await Axios({
        ...summaryApi.resendVerificationMail,
        data : {
          email: verificationMailId
        }
      })
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setRequesting(false);
    }
  }

  return (
    <section className='container w-full min-h-[65vh] lg:min-h-[68vh] mx-auto px-4'>
      {showMailVericationNotification && (
        <div className='fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4'>
          <div className='bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6 md:p-8'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='bg-amber-100 text-amber-600 rounded-full p-3'>
                  <FaEnvelope size={18} />
                </div>
                <h2 className='text-lg font-semibold text-neutral-700'>Email Verification Required</h2>
              </div>

              <button onClick={() => setShowMailVerificationNotification(false)} className='text-neutral-400 hover:text-neutral-700'>
                <IoCloseCircle size={26} />
              </button>
            </div>

            <p className='text-sm text-gray-600 mt-4'>Please verify your email address to continue. A verification link was sent to:</p>
            <p className='text-sm font-medium text-green-700 mt-2 break-all'>{verificationMailId || '—'}</p>

            <p className='text-sm text-gray-600 mt-4'>Didn't receive it? Click the button below to resend the verification email.</p>

            <div className='mt-6 grid justify-around items-center w-full'>
              {/* <button
                onClick={() => setShowMailVerificationNotification(false)}
                className='py-2 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold'>
                Cancel
              </button> */}

              <button
                onClick={() => requestForVerificationMail()}
                disabled={requesting}
                className={`flex items-center justify-center gap-2 py-2 px-6 rounded-full text-white font-semibold ${requesting ? 'bg-gray-300 cursor-not-allowed text-gray-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                {requesting ? (
                  <>
                    <Loader2 className='animate-spin h-4 w-4' />
                    Resending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='bg-white w-full my-4 lg:my-6 mx-auto rounded'>
        <p className='text-neutral-600 py-8 text-center lg:text-xl font-semibold'>Login</p>

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

          <div className='flex flex-col mx-auto'>
            <div className='flex w-[80vw] lg:w-[42vh] mx-auto rounded-md overflow-hidden bg-slate-100'>
              <label className='flex items-center justify-center p-2 bg-green-700 text-amber-50' htmlFor='password'><FaUnlockKeyhole size={22}/></label>
              <input
                type={ (showPass)?('password'):('text') }
                id='password'
                spellCheck="false"
                className='w-full outline-none text-green-700 font-semibold px-2'
                placeholder='Enter Your Password'
                name='password'
                value={data.password}
                onChange={handleChange}
              />
              <div onClick={() => {setshowPass(!showPass)}} className='flex items-center justify-center p-2 mr-1 text-green-800 font-semibold'>
                { (showPass)?(<FaRegEyeSlash size={18}/>):(<FaRegEye size={18}/>) }
              </div>
            </div>
            <Link href={'/forgot-password'} className='text-sm text-green-700 text-right pr-1 pt-1'>Forgot Password?</Link>
          </div>

          <button 
            disabled={!validValue || loading} 
            className={`flex items-center justify-center w-[76vw] lg:w-[40vh] mx-auto rounded-full py-2 mt-3 lg:mt-5 text-amber-50 text-lg tracking-widest 
            ${validValue && !loading ? "bg-green-700 hover:bg-green-800" : "bg-gray-400 cursor-not-allowed"}`}>
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2"/> Processing...
              </>
            ) : "Login"}
          </button>
        </form>

        <p className='text-neutral-600 pt-4 pb-4 text-center lg:text-lg'>Not a member ? <Link className='text-green-700 font-semibold' href={'/signup'}>Signup</Link></p>
      </div>
    </section>
  )
}

export default Login