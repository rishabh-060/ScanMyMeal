"use client"
import Axios from '@/public/utils/Axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { FaUnlockKeyhole, FaRegEyeSlash, FaRegEye, FaMobileScreen } from "react-icons/fa6";
import { toast } from 'react-toastify';
import summaryApi from '@/public/common/summaryApi';
import useChangePath from '@/hooks/changePath';
import { Loader2 } from "lucide-react";
import fetchUserDetails from '@/public/utils/fetchUserDetails';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from '@/public/store/userSlice';
import { useRouter } from 'next/navigation';


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
      toast.error(error?.response?.data?.message)
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="container w-full min-h-[65vh] lg:min-h-[68vh] mx-auto overflow-hidden relative px-4 flex items-center justify-center bg-[url('https://media.istockphoto.com/id/816774502/photo/indian-cuisine.webp?a=1&b=1&s=612x612&w=0&k=20&c=7OmRDK5H4ScpIAtsNnpzpG3qobfo_Q5SAO6_-a3d0F0=')] bg-cover bg-center">
  
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent backdrop-blur-sm"></div>
      
      {/* Animated glow behind the form */}
      <div className="absolute w-72 h-72 bg-amber-500/30 blur-3xl rounded-full animate-pulse -z-0"></div>

      <div className="relative backdrop-blur-lg bg-white/30 w-full sm:w-[90%] md:w-[450px] my-4 lg:my-6 mx-auto rounded-xl shadow-2xl border border-white/40 animate-fade-in">
        
        {/* Heading */}
        <p className="text-gray-900 py-6 text-center lg:text-2xl font-bold tracking-wide border-b border-white/20">
          <span className="text-amber-500 drop-shadow">Login</span> to Continue
        </p>

        <form className="grid gap-4 mt-4 pb-10 px-6" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="flex items-center rounded-lg overflow-hidden bg-white/20 border border-white/40 shadow-sm focus-within:border-amber-500 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]">
            <label className="flex items-center justify-center p-3 bg-amber-500 text-white transition-transform duration-200 hover:scale-110">
              <FaMobileScreen size={22} />
            </label>
            <input
              type="email"
              id="email"
              autoFocus
              spellCheck="false"
              className="w-full outline-none text-amber-700 font-medium px-3 py-2 bg-transparent placeholder-gray-200"
              placeholder="Enter your Email"
              name="email"
              value={data.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <div className="flex items-center rounded-lg overflow-hidden bg-white/20 border border-white/40 shadow-sm focus-within:border-amber-500 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]">
              <label className="flex items-center justify-center p-3 bg-amber-500 text-white transition-transform duration-200 hover:scale-110">
                <FaUnlockKeyhole size={20} />
              </label>
              <input
                type={showPass ? "text" : "password"}
                id="password"
                spellCheck="false"
                className="w-full outline-none text-amber-700 font-medium px-3 py-2 bg-transparent placeholder-gray-200"
                placeholder="Enter your Password"
                name="password"
                value={data.password}
                onChange={handleChange}
              />
              <div
                onClick={() => setshowPass(!showPass)}
                className="flex items-center justify-center p-3 text-amber-500 hover:text-amber-600 cursor-pointer transition-transform duration-200 hover:scale-110"
              >
                {showPass ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-amber-500 text-right pr-1 pt-1 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            disabled={!validValue || loading}
            className={`relative overflow-hidden flex items-center justify-center rounded-full py-2 mt-3 lg:mt-4 text-white text-lg tracking-wide shadow-lg transition-all duration-300
              ${validValue && !loading
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 hover:shadow-amber-500/50"
                : "bg-gray-400 cursor-not-allowed"}`}
          >
            {/* Shimmer effect */}
            {validValue && !loading && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></span>
            )}
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-gray-900 py-4 text-center text-sm border-t border-white/20">
          Not a member?{" "}
          <Link className="text-amber-500 font-semibold hover:underline" href="/signup">
            Signup
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Login