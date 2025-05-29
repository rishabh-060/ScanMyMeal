'use client'
import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

const CancelPage = () => {
  return (
    <section className="min-h-[72vh] flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 px-4">
      <motion.div
        className="bg-white shadow-2xl rounded-3xl p-8 max-w-md text-center space-y-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="flex justify-center"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
        >
          <XCircle className="text-red-500" size={80} strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold text-red-700">
          Payment Cancelled!
        </h1>

        <p className="text-neutral-600 text-sm md:text-base">
          Your payment was cancelled or failed. If this was a mistake, please try again or contact support.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition"
          >
            Go to Home
          </Link>
          {/* <Link
            href="/contact"
            className="border border-red-600 hover:bg-red-100 text-red-700 px-6 py-2 rounded-lg text-sm font-semibold transition"
          >
            Contact Support
          </Link> */}
        </div>
      </motion.div>
    </section>
  )
}

export default CancelPage
