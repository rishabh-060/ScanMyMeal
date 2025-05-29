'use client'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const SuccessPage = () => {
  const successStatus = useSelector((state) => state.orderStatus.status)

//   if (!successStatus) {
//     return (
//       <section className="min-h-[72vh] flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <h2 className="text-xl font-bold text-red-600">Invalid Access</h2>
//           <Link href="/" className="text-blue-600 underline">
//             Go back to home
//           </Link>
//         </div>
//       </section>
//     )
//   }

  return (
    <section className="min-h-[72vh] flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 px-4">
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
          <CheckCircle className="text-green-500" size={80} strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold text-green-700">
          {successStatus} Successful!
        </h1>

        <p className="text-neutral-600 text-sm md:text-base">
          Your {successStatus?.toLowerCase()} has been placed successfully. Thank you for choosing us!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link href="/" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition">
            Go to Home
          </Link>
          <Link href="dashboard/my-orders" className="border border-green-600 hover:bg-green-100 text-green-700 px-6 py-2 rounded-lg text-sm font-semibold transition">
            View Orders
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default SuccessPage
