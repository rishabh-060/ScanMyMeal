'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const RestrictUser = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if (countdown === 0) {
      router.push('/');
    }

    return () => clearInterval(interval);
  }, [countdown, router]);

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-3xl flex flex-col items-center justify-center z-50"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-3xl w-full max-w-md p-6 md:p-8 rounded-lg shadow-xl text-center border border-white/20"
      >
        <h2 className="text-2xl font-bold text-red-600 mb-4">🚫 Unauthorized Access</h2>
        <p className="text-gray-300 text-sm md:text-base">
          You do not have permission to view this page. Redirecting in <span className="font-bold text-white">{countdown}</span> seconds...
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <button
            className="border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white text-lg py-2 px-4 rounded-lg transition-all transform hover:scale-105"
            onClick={() => router.back()}
          >
            🔙 Go Back
          </button>
          <button
            className="border-2 border-gray-400 text-gray-300 hover:bg-gray-400 hover:text-black text-lg py-2 px-4 rounded-lg transition-all transform hover:scale-105"
            onClick={() => router.push('/')}
          >
            🏠 Homepage
          </button>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default RestrictUser;