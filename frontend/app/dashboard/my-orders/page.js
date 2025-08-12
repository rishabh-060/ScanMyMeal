'use client'

import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import useMobile from '@/hooks/useMobile'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { PackageCheckIcon, ChevronsUp, ChevronsDown, CreditCardIcon, MapPinCheck, PhoneIcon, User2 } from 'lucide-react'
import RestrictUser from '@/Components/RestrictUser'

{/* Small Detail Row Component */}
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-amber-600 mt-0.5">{icon}</span>
    <p className="font-medium text-emerald-700">
      <span className="text-gray-700 font-semibold">{label}:</span> {value}
    </p>
  </div>
);

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

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center text-amber-600 mb-4 lg:mb-8">
        My Orders
      </h1>
      <Divider />

      {/* Orders Section */}
      <section className="rounded-xl shadow-inner w-full my-6 p-4 lg:p-6 bg-gradient-to-br from-amber-50 via-white to-amber-50">
        {orders.length > 0 ? (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white/80 backdrop-blur-md p-5 rounded-xl shadow-md border border-amber-100 hover:shadow-lg transition duration-300"
              >
                {/* Top Row */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    {/* Order ID */}
                    <div className="flex items-center gap-2">
                      <PackageCheckIcon size={20} className="text-amber-600" />
                      <h2 className="text-base font-semibold text-gray-800">
                        Order ID:
                        <span className="text-emerald-600 font-bold ml-1">
                          {order.orderId}
                        </span>
                      </h2>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span className="text-sm font-semibold text-gray-700 mr-1">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.order_status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : order.order_status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.order_status || "Pending"}
                      </span>
                    </div>

                    {/* Product Row */}
                    <div className="flex items-center gap-5 w-full">
                      {order.product_details?.image?.[0] && (
                        <img
                          src={order.product_details.image[0]}
                          alt={order.product_details.name}
                          className="w-16 h-16 object-cover rounded-lg border border-amber-200 shadow-sm"
                        />
                      )}
                      <div>
                        <h4 className="text-amber-800 text-base font-semibold">
                          {order.product_details?.name}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Total:{" "}
                          <span className="font-semibold">
                            ₹ {order.totalAmt || "N/A"}
                          </span>
                        </p>
                        <p className="text-gray-700 text-sm">
                          Date:{" "}
                          <span className="font-semibold">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleOrder(order._id)}
                    className="text-amber-600 hover:text-amber-800 transition"
                  >
                    {openOrders.includes(order._id) ? (
                      <ChevronsUp size={22} />
                    ) : (
                      <ChevronsDown size={22} />
                    )}
                  </button>
                </div>

                {/* Expandable Details */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openOrders.includes(order._id) ? "max-h-96 mt-4" : "max-h-0"
                  }`}
                >
                  <div className="bg-amber-50/50 rounded-lg p-4 border border-dashed border-amber-200 space-y-3 text-sm">
                    <DetailRow
                      icon={<CreditCardIcon size={16} />}
                      label="Payment Status"
                      value={order.payment_status || "N/A"}
                    />
                    <DetailRow
                      icon={<MapPinCheck size={16} />}
                      label="Address"
                      value={`${order.delivery_address?.address_line}, ${order.delivery_address?.city}, ${order.delivery_address?.pincode}`}
                    />
                    <DetailRow
                      icon={<PhoneIcon size={16} />}
                      label="Contact No"
                      value={order.delivery_address?.mobile || "N/A"}
                    />
                    <DetailRow
                      icon={<PackageCheckIcon size={16} />}
                      label="Order No"
                      value={order.orderId}
                    />
                    <DetailRow
                      icon={<PackageCheckIcon size={16} />}
                      label="Product ID"
                      value={order.productId}
                    />
                    <DetailRow
                      icon={<User2 size={16} />}
                      label="User ID"
                      value={order.userId}
                    />
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
