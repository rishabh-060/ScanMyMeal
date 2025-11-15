'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Axios from '@/public/utils/Axios';
import summaryApi from '@/public/common/summaryApi';

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('code');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [countdown, setCountdown] = useState(3);

  const verifyEmail = async () => {
    setStatus('loading');
    if (!token) {
      setStatus('error');
      toast.error('Invalid verification link');
      return;
    }

    try {
      const res = await Axios({
        ...summaryApi.verifyEmail,
        data: {
          code: token
        }
      });

      if (res.data.success) {
        setStatus('success');
        // toast.success('Email verified successfully!');
      } else {
        setStatus('error');
        // toast.error(res.data.message || 'Verification failed');
      }
    } catch (err) {
      setStatus('error');
      // toast.error('Something went wrong during verification');
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [token]);

  // Redirect after success
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            router.push('/login');
            clearInterval(timer);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <section className="flex items-center justify-center min-h-[70vh] bg-white px-4">
      <div className="relative w-full max-w-md bg-gray-200 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center animate-fadeInUp">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 animate-fadeIn">
            <Loader2 className="animate-spin text-yellow-400 w-12 h-12" />
            <p className="text-gray-600 mt-2">Verifying your email...</p>
            <div className="w-3/4 h-1 bg-gray-500 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 animate-loadingBar"></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 animate-fadeIn">
            <CheckCircle className="text-green-400 w-16 h-16 drop-shadow-lg" />
            <h1 className="text-2xl font-semibold">Email Verified!</h1>
            <p className="text-gray-600 max-w-sm mx-auto">
              Your email has been successfully verified.
              <br />Redirecting to login in {countdown}s...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 animate-fadeIn">
            <XCircle className="text-red-400 w-16 h-16 drop-shadow-lg" />
            <h1 className="text-2xl font-semibold">Verification Failed</h1>
            <p className="text-gray-600 max-w-sm mx-auto">
              The verification link is invalid or expired. Please request a new one.
            </p>
            <button
              onClick={() => verifyEmail()}
              className="mt-4 px-6 py-2 rounded-lg bg-yellow-400 text-black font-medium hover:bg-yellow-300 transition-transform hover:scale-105"
            >
              Retry Verification
            </button>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-loadingBar {
          animation: loadingBar 1.5s ease-in-out infinite;
        }
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
};

export default VerifyEmail;
