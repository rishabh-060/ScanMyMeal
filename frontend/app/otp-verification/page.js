"use client";
import Axios from "@/public/utils/Axios";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import summaryApi from "@/public/common/summaryApi";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import useChangePath from "@/hooks/changePath";

const OtpVerification = () => {
  const [data, setData] = useState(["", "", "", "", "", ""]);

  const router = useRouter();
  const [email, setEmail] = useState(null);

  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [showResend, setShowResend] = useState(false); // Resend OTP visibility

  const inputRef = useRef([]);
  const validValue = data.every((el) => el);
  const searchParams = useSearchParams();
  const changePath = useChangePath()

  // ⏳ Countdown Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setShowResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // ⏳ Format time (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ✅ Get email from query params instead of router.state
  useEffect(() => {
    const receivedEmail = searchParams.get("email");
    if (receivedEmail) {
      setEmail(receivedEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Email is missing!");
      setLoading(false);
      return;
    }

    if (timeLeft <= 0) {
      toast.error("OTP expired! Please request a new one.");
      setLoading(false);
      return;
    }

    try {
      const response = await Axios({
        ...summaryApi.forgotPasswordOtpVerification,
        data: {
          otp: data.join(""),
          email: email
        },
      });

      if (response.data.success) {
        const success = response.data.success
        router.push(`/reset-password?email=${encodeURIComponent(email)}&status=${encodeURIComponent(success)}`);
        toast.success(response.data.message);
        setData(["", "", "", "", "", ""]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Resend OTP Function
  const handleResendOTP = async () => {
    try {
      const response = await Axios({
        ...summaryApi.forgotPassword,
        data: { email },
      });

      if (response.data.success) {
        toast.success("New OTP sent to your email!");
        setTimeLeft(600); // Reset timer
        setShowResend(false);
        setData(["", "", "", "", "", ""]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  return (
    <section className="container w-full min-h-[65vh] lg:min-h-[68vh] mx-auto px-4">
      <div className="bg-white w-full my-4 lg:my-6 mx-auto rounded">
        <p className="text-neutral-600 py-8 text-center text-lg lg:text-xl font-semibold">
          Verify Your OTP
        </p>

        {/* 🔥 Countdown Timer UI */}
        <p
          className={`text-center text-lg font-bold ${
            timeLeft > 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          Time Left: {formatTime(timeLeft)}
        </p>

        <form className="grid gap-3 mt-2 lg:mt-4 pb-10" onSubmit={handleSubmit}>
          <div className="w-[76vw] lg:w-[40vh] mx-auto overflow-hidden px-8">
            <div className="flex items-center gap-1 lg:gap-4 w-full">
              {data.map((elem, index) => (
                <input
                  key={index}
                  type="text"
                  id="otp"
                  ref={(ref) => (inputRef.current[index] = ref)}
                  maxLength={1}
                  spellCheck="false"
                  className="w-full max-w-22 h-full outline-none rounded-md text-green-800 p-2 bg-slate-100 text-center text-xl font-extrabold"
                  name="otp"
                  value={data[index]}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newData = [...data];
                    newData[index] = value;
                    setData(newData);

                    if (value && index < 5) {
                      inputRef.current[index + 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* 🚀 Verify OTP Button */}
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
              "Verify OTP"
            )}
          </button>
        </form>

        {/* 🔄 Resend OTP Button */}
        {showResend && (
          <div className="text-center mt-4">
            <button onClick={handleResendOTP} className="text-blue-800 font-semibold">
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing...
                </>
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
        )}

        <p className="text-neutral-600 pt-4 pb-4 text-center lg:text-lg">
          Back to{" "}
          <Link className="text-green-700 font-semibold" href={"/login"}>
            Login
          </Link>{" "}
          page
        </p>
      </div>
    </section>
  );
};

export default OtpVerification;
