'use client'

import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import useMobile from '@/hooks/useMobile'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronDown, ChevronUp, Phone, MapPin, CreditCard, PackageCheck, User } from 'lucide-react'
import RestrictUser from '@/Components/RestrictUser'

const MyOrder = () => {
  const [isMobile] = useMobile()
  const orders = useSelector(state => state.orders.orders)
  const user = useSelector((state) => state.user)

  useEffect(() => {
    if (!user) {
      <RestrictUser />
    }
  }, [])

  const [openOrders, setOpenOrders] = useState([])

  const toggleOrder = (id) => {
    setOpenOrders(prev =>
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    )
  }

  return (
    <main className="px-2 lg:px-5 pt-4 lg:pt-8">
      {isMobile && <BacktoHome />}
      <h1 className="text-3xl font-bold text-center text-emerald-600 mb-2 lg:mb-6">My Orders</h1>
      <Divider />

      <section className="bg-amber-300 rounded-xl shadow-md w-full my-6 p-4 lg:p-6">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-4 lg:p-5 rounded-lg shadow flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <PackageCheck size={20} className="text-amber-700" />
                      <h2 className="text-base font-semibold text-amber-900">
                        Order ID: <span className='text-emerald-600 font-bold text-lg'>{order.orderId}</span>
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-5 w-full">
                      <div>
                        {
                          order.product_details?.image?.[0] && (
                            <img
                              src={order.product_details.image[0]}
                              alt={order.product_details.name}
                              className="w-16 h-16 object-cover rounded-md border border-amber-300"
                            />
                          )
                        }
                      </div>

                      <div>
                        <h4 className="text-amber-800 text-base font-semibold">{order.product_details?.name}</h4>
                        <p className="text-amber-800 text-sm">
                          Total: <span className="font-semibold">₹ {order.totalAmt || 'N/A'}</span>
                        </p>
                        <p className="text-amber-800 text-sm">
                          Date: <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleOrder(order._id)}
                    className="text-amber-700 hover:text-amber-900"
                  >
                    {openOrders.includes(order._id) ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </button>
                </div>

                {/* Expandable Section */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openOrders.includes(order._id) ? 'max-h-96 mt-3' : 'max-h-0'
                  }`}
                >
                  <div className="text-amber-900 space-y-3 text-sm border-t border-dashed border-amber-300 pt-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-amber-700" />
                      <p className="font-medium text-emerald-600">
                        <span className="text-amber-700 font-semibold">Payment Status:</span> {order.payment_status || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-amber-700 mt-0.5" />
                      <p className="font-medium text-emerald-600">
                        <span className="text-amber-700 font-semibold">Address:</span> {order.delivery_address?.address_line}, {order.delivery_address?.city}, {order.delivery_address?.pincode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-amber-700" />
                      <p className="font-medium text-emerald-600">
                        <span className="text-amber-700 font-semibold">Contact No:</span> {order.delivery_address?.mobile || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <PackageCheck size={16} className="text-amber-700" />
                      <p className="font-medium text-emerald-600">
                        <span className="text-amber-700 font-semibold">Order No:</span> {order.orderId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <PackageCheck size={16} className="text-amber-700" />
                      <p className="font-medium text-emerald-600">
                        <span className="text-amber-700 font-semibold">Product ID:</span> {order.productId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} className="text-amber-700" />
                      <p className="font-medium text-emerald-600">
                        <span className="text-amber-700 font-semibold">User ID:</span> {order.userId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No orders found.</p>
        )}
      </section>
    </main>
  )
}

export default MyOrder
