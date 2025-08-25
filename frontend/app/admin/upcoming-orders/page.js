'use client'
import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import RestrictUser from '@/Components/RestrictUser'
import useMobile from '@/hooks/useMobile'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Loader } from 'lucide-react'
import ManageOrder from '@/Components/ManageOrder'

const Page = () => {
  const [isMobile] = useMobile()
  const user = useSelector((state) => state.user)
  const [upcomingOrders, setUpcomingOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [openManageOrder, setOpenManageOrder] = useState(false)
  const [manageOrderData, setManageOrderData] = useState(null)

  // Restrict access to non-admin users
  if (!isAdmin(user.role)) {
    return <RestrictUser />
  }

  // Fetch upcoming orders
  const fetchUpcomingOrders = async () => {
    setLoading(true)
    try {
      const response = await Axios({
        ...summaryApi.upcomingOrders,
      })
      const { data: responseData } = response

      if (responseData.success) {
        setUpcomingOrders(responseData.data)
      }
    } catch (error) {
      toast.error('Failed to fetch upcoming orders')
    } finally {
      setLoading(false)
    }
  }

  // Fetch orders on component mount
  useEffect(() => {
    fetchUpcomingOrders()
  }, [])

  return (
    <main className='px-2 lg:px-5'>
      {isMobile && <BacktoHome />}

      <h1 className='text-emerald-600 font-bold text-center my-4 text-2xl'>
        Upcoming Orders
      </h1>

      <Divider />

      <section className='my-6 bg-amber-400 rounded-lg w-full min-h-52 p-3 lg:p-5 text-neutral-800'>
        <h1 className='text-amber-700 font-bold text-center my-2 lg:my-6 text-2xl'>Order List</h1>
        {loading ? (
          <div className='flex justify-center items-center min-h-52'>
            <Loader className='animate-spin text-emerald-600' size={48} />
          </div>
            ) : upcomingOrders.length === 0 ? (
            <div className='bg-yellow-100 text-yellow-700 text-center p-4 rounded-lg'>
                No upcoming orders found.
            </div>
            ) : (
            <div className='grid gap-4 grid-cols-1'>
                {upcomingOrders.map((order, idx) => (
                <div
                    key={'bhhhbbh'+idx}
                    className='bg-white rounded-lg shadow-md p-4 border border-neutral-300 hover:shadow-lg transition'
                    onClick={() => {
                      setOpenManageOrder(true)
                      setManageOrderData(order)
                    }}
                >
                    <h2 className='font-semibold text-sm mb-2'>
                        Product: <span className='text-lg text-amber-500'>{order.product_details?.name || 'N/A'}</span>
                    </h2>
                    {
                      order.product_details?.image && (
                        <img
                          src={order.product_details.image}
                          alt={order.product_details.name}
                          className='w-16 h-16 object-cover rounded-md mb-2'
                        />
                      )
                    }
                    <p className='font-semibold text-xs text-gray-600 mb-1'>
                        Order ID: <span className='text-base font-semibold'>{order._id}</span>
                    </p>
                    <p className='font-semibold text-xs text-gray-600 mb-1'>
                        Order status: <span className={`text-base font-semibold ${order.order_status == 'pending' ? 'text-amber-600' : order.order_status == 'completed' ? 'text-green-600' : 'text-red-600'}`}>{order.order_status || 'N/A'}</span>
                    </p>
                    <p className='font-semibold text-xs text-gray-600 mb-1'>
                        Payment Status: <span className={`text-base font-semibold ${order.payment_status == 'paid' ? 'text-emerald-600':'text-red-600'}`}>{order.payment_status || 'N/A'}</span>
                    </p>
                    <p className='font-semibold text-xs text-gray-600 mb-1'>
                        Amount: <span className='text-sm'>₹{order.totalAmt}</span>
                    </p>
                    <p className='font-semibold text-xs text-gray-600'>
                        Date: <span className='text-sm'>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </p>
                </div>
                ))}
            </div>
            )}

            {
              openManageOrder && <ManageOrder data={manageOrderData} fetchUpcomingOrders={() => fetchUpcomingOrders()} close={() => setOpenManageOrder(false)} />
            }
      </section>
    </main>
  )
}

export default Page
