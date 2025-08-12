"use client";
import Axios from "@/public/utils/Axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaUnlockKeyhole,
  FaRegEyeSlash,
  FaRegEye,
  FaMobileScreen,
} from "react-icons/fa6";
import { toast } from "react-toastify";
import summaryApi from "@/public/common/summaryApi";
import useChangePath from "@/hooks/changePath";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [data, setdata] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const user = useSelector((state) => state.user);

  const changePath = useChangePath();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      router.back()
    }
  }, [])

  const [loading, setLoading] = useState(false); // Add loading state
  const [showPass, setshowPass] = useState(true);
  const [showConfirmPass, setshowConfirmPass] = useState(true);

  const validValue = Object.values(data).every((el) => el);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error("Password and confirm password must be same");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await Axios({
        ...summaryApi.signup,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setdata({ name: "", email: "", password: "", confirmPassword: "" });
        changePath("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false); // Stop loading after API response
    }
  };

  return (
    <section className="container w-full min-h-[65vh] lg:min-h-[68vh] mx-auto px-4 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1650&q=80')] bg-cover bg-center relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent backdrop-blur-sm"></div>

      {/* Soft Glow */}
      <div className="absolute w-72 h-72 bg-amber-500/30 blur-3xl rounded-full animate-pulse -z-0"></div>

      {/* Glass Card */}
      <div className="relative backdrop-blur-lg bg-white/30 w-full sm:w-[90%] md:w-[480px] my-4 lg:my-6 mx-auto rounded-xl shadow-2xl border border-white/40 animate-fade-in">
        
        {/* Heading */}
        <p className="text-gray-900 py-6 text-center lg:text-2xl font-bold tracking-wide border-b border-white/20">
          <span className="text-amber-500 drop-shadow">Sign Up</span> to Scan My Meal
        </p>

        <form className="grid gap-4 mt-4 pb-10 px-6" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="flex items-center rounded-lg overflow-hidden bg-white/20 border border-white/40 shadow-sm focus-within:border-amber-500 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]">
            <label className="flex items-center justify-center p-3 bg-amber-500 text-white transition-transform duration-200 hover:scale-110">
              <FaUserPlus size={22} />
            </label>
            <input
              type="text"
              id="name"
              autoFocus
              spellCheck="false"
              className="w-full outline-none text-amber-700 font-medium px-3 py-2 bg-transparent placeholder-gray-200"
              placeholder="Enter Your Name"
              name="name"
              value={data.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="flex items-center rounded-lg overflow-hidden bg-white/20 border border-white/40 shadow-sm focus-within:border-amber-500 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]">
            <label className="flex items-center justify-center p-3 bg-amber-500 text-white transition-transform duration-200 hover:scale-110">
              <FaMobileScreen size={22} />
            </label>
            <input
              type="email"
              id="email"
              spellCheck="false"
              className="w-full outline-none text-amber-700 font-medium px-3 py-2 bg-transparent placeholder-gray-200"
              placeholder="Enter Your Email"
              name="email"
              value={data.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="flex items-center rounded-lg overflow-hidden bg-white/20 border border-white/40 shadow-sm focus-within:border-amber-500 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]">
            <label className="flex items-center justify-center p-3 bg-amber-500 text-white transition-transform duration-200 hover:scale-110">
              <FaUnlockKeyhole size={20} />
            </label>
            <input
              type={showPass ? "text" : "password"}
              id="password"
              spellCheck="false"
              className="w-full outline-none text-amber-700 font-medium px-3 py-2 bg-transparent placeholder-gray-200"
              placeholder="Enter Your Password"
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

          {/* Confirm Password */}
          <div className="flex items-center rounded-lg overflow-hidden bg-white/20 border border-white/40 shadow-sm focus-within:border-amber-500 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]">
            <label className="flex items-center justify-center p-3 bg-amber-500 text-white transition-transform duration-200 hover:scale-110">
              <FaUnlockKeyhole size={20} />
            </label>
            <input
              type={showConfirmPass ? "text" : "password"}
              id="confirmPassword"
              spellCheck="false"
              className="w-full outline-none text-amber-700 font-medium px-3 py-2 bg-transparent placeholder-gray-200"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={data.confirmPassword}
              onChange={handleChange}
            />
            <div
              onClick={() => setshowConfirmPass(!showConfirmPass)}
              className="flex items-center justify-center p-3 text-amber-500 hover:text-amber-600 cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              {showConfirmPass ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={!validValue || loading}
            className={`relative overflow-hidden flex items-center justify-center rounded-full py-2 mt-3 lg:mt-4 text-white text-lg tracking-wide shadow-lg transition-all duration-300
              ${validValue && !loading
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 hover:shadow-amber-500/50"
                : "bg-gray-400 cursor-not-allowed"}`}
          >
            {validValue && !loading && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></span>
            )}
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-gray-900 py-4 text-center text-sm border-t border-white/20">
          Already a member?{" "}
          <Link className="text-amber-500 font-semibold hover:underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Signup;
