'use client'
import AddAddress from '@/Components/AddAddress'
import useChangePath from '@/hooks/changePath'
import { useGlobalContext } from '@/provider/GlobalProvider'
import summaryApi from '@/public/common/summaryApi'
import AlertMessage from '@/public/utils/AlertMessage'
import Axios from '@/public/utils/Axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoCloseCircle } from 'react-icons/io5'
import { MdOutlinePayments, MdOutlineLocationOn } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { loadStripe } from '@stripe/stripe-js'
import { useSearchParams } from 'next/navigation'

const Page = () => {
  const address = useSelector(state => state?.addresses?.addressList)
  const tableId = useSelector(state => state?.addresses?.tableId)
  const [openAddress, setOpenAddress] = useState(false)
  const [SelectedAddress, setSelectedAddress] = useState(null)
  const [activeTab, setActiveTab] = useState('delivery')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();
  const params = useSearchParams()
  const tableNo = params.get('tableId') || '';

  const {
    cartItem,
    totalCartPrice,
    fetchCartItem,
    fetchOrder
  } = useGlobalContext()

  const user = useSelector(state => state.user)
  const changePath = useChangePath()

  useEffect(() => {
    if (!user.id) changePath('/')
  }, [user, changePath])

  const handleCashOnDeliveryButton = async () => {
    setLoading(true)
    if(activeTab === 'delivery'){
      if (!SelectedAddress) {
        toast.error('Please select an address')
        setLoading(false)
        return
      }
    }else if (activeTab === 'table') {
      if(!tableNo) {
        toast.error('Please select an address')
        setLoading(false)
        return
      }
    }
    try {
      if(activeTab === 'delivery') {
        const response = await Axios({
          ...summaryApi.CodOrder,
          data: {
            list_item: cartItem,
            addressId: address[SelectedAddress]?._id,
            totalAmt: totalCartPrice,
            subTOtalAmt: totalCartPrice,
          }
        })

        const { data: responseData } = response

        if (responseData.success) {
          if (fetchCartItem) fetchCartItem()
          if (fetchOrder) fetchOrder()

          changePath('/success?text=Order')
          AlertMessage('Successfully', responseData?.message, 'success')
          dispatch(setOrderSuccess('Order'))
        }
      }
      if(activeTab === 'table'){
        const response = await Axios({
          ...summaryApi.CodOrder,
          data: {
            list_item: cartItem,
            tableId: tableId,
            totalAmt: totalCartPrice,
            subTOtalAmt: totalCartPrice,
          }
        })

        const { data: responseData } = response

        if (responseData.success) {
          if (fetchCartItem) fetchCartItem()
          if (fetchOrder) fetchOrder()

          changePath('/success?text=Order')
          AlertMessage('Successfully', responseData?.message, 'success')
          dispatch(setOrderSuccess('Order'))
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleOnlinePaymentButton = async () => {
    setLoading(true)
    if (!SelectedAddress) {
      toast.error('Please select an address')
      setLoading(false)
      return
    }
    try {
      const StripePublishKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHED_KEY
      if (!StripePublishKey) throw new Error("Stripe publishable key not found")

      const stripePromise = loadStripe(StripePublishKey)
      const stripe = await stripePromise

      const response = await Axios({
        ...summaryApi.paymentUrl,
        data: {
          list_item: cartItem,
          addressId: address[SelectedAddress]?._id,
          totalAmt: totalCartPrice,
          subTOtalAmt: totalCartPrice,
        }
      })
      const { data: responseData } = response

      if (!responseData?.id) throw new Error("Invalid session ID")

      await stripe.redirectToCheckout({ sessionId: responseData.id })

      if (fetchCartItem) fetchCartItem()
      if (fetchOrder) fetchOrder()
      toast.success('Redirecting to payment page')
      if (fetchCartItem) fetchCartItem()
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }


  return (
    <section className="flex items-center justify-center px-4 py-6">
      <div className="w-full h-full max-h-4xl lg:max-h-142 bg-gray-50 rounded-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold text-neutral-800 tracking-wide">
            Choose Pickup Option
          </h2>
          <Link href="/">
            <IoCloseCircle size={28} className="text-neutral-700 hover:text-red-500 transition" />
          </Link>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 w-full max-w-xl mx-auto bg-neutral-100 p-1 rounded-full text-sm font-medium">
          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-2 px-4 rounded-full transition-all duration-300 ${
              activeTab === 'delivery'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Delivery to Doorstep
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`py-2 px-4 rounded-full transition-all duration-300 ${
              activeTab === 'table'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Dine-in Table
          </button>
        </div>

        <div className='grid grid-rows-2 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            {/* Content Section */}
            {activeTab === 'delivery' && (
              <div className="space-y-4">
                <button onClick={() => setOpenAddress(true)} className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium border border-dashed border-amber-600 py-2.5 rounded-md text-center transition-colors duration-100">
                  + Add New Address
                </button>

                <div className="max-h-74 min-h-52 overflow-y-auto no-scrollbar space-y-3">
                  { address.length > 0 && <h3 className='text-neutral-500 font-semibold text-sm lg:text-base'>Choose pickup address</h3> }
                  {address.length > 0 ? (
                    address.map((item, idx) => (
                      <label htmlFor={'address' + idx} key={idx} className={`w-full grid gap-3 cursor-pointer ${ !item.status && 'hidden' }`}>
                        <div
                          className="border border-neutral-200 p-3 rounded-md shadow-sm hover:bg-amber-50 bg-neutral-50 transition flex gap-3"
                        >
                          <div>
                            <input
                              type="radio"
                              name="address"
                              value={idx}
                              id={'address' + idx}
                              onChange={(e) => setSelectedAddress(e.target.value)}
                              className="w-4 h-4 text-amber-600 border-neutral-300 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <p className='text-neutral-500 font-semibold text-sm lg:text-base'>{item.address_line}</p>
                            <p className='text-neutral-500 font-semibold text-sm lg:text-base'>{item.city} - {item.state}</p>
                            <p className='text-neutral-500 font-semibold text-sm lg:text-base'>{item.country} - {item.pincode}</p>
                            <p className='text-neutral-500 font-semibold text-sm lg:text-base'>{item.mobile}</p>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-center text-neutral-500 py-6 font-medium">No saved address yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'table' && (
              <div className="bg-amber-100 p-4 rounded-md border border-amber-600 border-dashed text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Selected Table No:
                  <span className={`${tableId? 'text-amber-700 text-xl' : 'text-neutral-700'} font-bold ml-2 min-w-44 w-44 max-w-44 text-center py-1 px-6 rounded-lg border-2 border-amber-700 `}>{tableId ? tableId : 'Scan QR'}</span>
                </p>
              </div>
            )}
          </div>

          <div className='grid gap-4'>
            {/* Order Summary */}
            <div className="bg-neutral-50 p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Order Summary</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm lg:text-base font-semibold text-neutral-700">Total Items:</p>
                <p className="text-sm lg:text-base font-medium text-neutral-800">{cartItem.length}</p>
              </div>

              {activeTab === 'delivery' && (
                <div className="flex items-center justify-between">
                  <p className="text-sm lg:text-base font-semibold text-neutral-700">Delivery Charges:</p>
                  <p className="text-sm lg:text-base font-medium text-neutral-800">Free</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm lg:text-base font-semibold text-neutral-700">Subtotal:</p>
                <p className="text-sm lg:text-base font-medium text-neutral-800">₹ {totalCartPrice}</p>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => handleOnlinePaymentButton()}
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full mx-auto py-2.5 rounded-lg font-semibold transition ${
                  loading ? 'bg-neutral-300 text-neutral-700 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                <MdOutlinePayments size={20} />
                {loading ? 'Processing...' : 'Pay Online'}
              </button>

              <button
                onClick={handleCashOnDeliveryButton}
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full mx-auto border-4 py-1.5 rounded-lg font-semibold transition ${
                  loading
                    ? 'bg-neutral-700 text-neutral-300 border-neutral-300 cursor-not-allowed'
                    : 'hover:bg-amber-600 hover:text-white text-amber-600 border-amber-600'
                }`}
              >
                <MdOutlineLocationOn size={20} />
                {loading ? 'Processing...' : 'Cash on Delivery'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {
        openAddress && <AddAddress close={() => setOpenAddress(false)}/>
      }
    </section>
  )
}

export default Page
