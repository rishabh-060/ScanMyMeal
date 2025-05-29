'use client'
import { useGlobalContext } from '@/provider/GlobalProvider'
import Link from 'next/link'
import React, { useState } from 'react'
import { BsCart4 } from 'react-icons/bs'
import { IoCloseCircle } from 'react-icons/io5'
import AddToCartButton from './AddToCartButton'
import { useSelector } from 'react-redux'
import useChangePath from '@/hooks/changePath'
import { toast } from 'react-toastify'

const DisplayCartProduct = ({ close }) => {
  const {
    cartItem,
    deleteCartItem,
    totalCartPrice,
    nonDiscPrice,
  } = useGlobalContext()
  const user = useSelector(state => state.user)
  const changePath = useChangePath()
  

  const handleRedirectPage = () => {
    if(user?.id){
      changePath('/place-order')
      if(close) close()
      return
    }
    toast.error('Login required')
  }

  return (
    <section className="fixed top-22 lg:top-0 inset-0 z-40 bg-neutral-300/60 backdrop-blur-sm overflow-y-auto">
      <div className="ml-auto h-full w-full lg:w-[32rem] bg-white p-6 flex flex-col gap-6 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b pb-3">
          <h1 className="text-xl lg:text-2xl font-semibold text-neutral-700 flex items-center gap-2">
            <BsCart4 className="text-amber-500 animate-bounce transition-all duration-300" />
            My Cart
          </h1>

          <div className="flex items-center gap-2">
            {/* For Mobile View */}
            <Link href="/" className="lg:hidden block">
              <IoCloseCircle size={28} className="text-neutral-700 hover:text-red-500" />
            </Link>
            {/* For Desktop View */}
            <button onClick={close} className="hidden lg:block">
              <IoCloseCircle size={28} className="text-neutral-700 hover:text-red-500 transition" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 w-full overflow-y-auto pr-2 space-y-4 no-scrollbar gap-1 lg:gap-2">
          {cartItem.length > 0 ? (
            cartItem.map((item, idx) => (
              <div
                key={item.product._id || idx}
                className="flex items-start gap-4 p-3 rounded-lg bg-neutral-50 shadow hover:shadow-md transition"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded border-2 border-neutral-200"
                />
                <div className="flex flex-col gap-1 text-sm w-full">
                  <div className="flex justify-between items-start gap-1">
                    <p className="text-base font-semibold text-amber-600 text-ellipsis line-clamp-1">{item.product.name}</p>
                    
                  </div>
                  <p className="text-neutral-600 text-xs lg:text-sm">Quantity: {item.quantity}</p>
                  <p className="text-neutral-600 text-xs lg:text-sm">Price: ₹{item.product.price}</p>
                  {/* <p className="text-neutral-600">{item.product.unit}</p> */}
                  {item.product.discount > 0 && (
                    <p className="text-emerald-600">Discount: {item.product.discount}%</p>
                  )}

                  <div className='flex items-center justify-between gap-2 pt-2'>
                    <AddToCartButton data={item.product}/>

                    <button
                      onClick={() => deleteCartItem(item._id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-neutral-500 font-medium py-10">No item is in the cart.</p>
          )}
        </div>

        {/* Footer */}
        {cartItem.length > 0 && (
          <div className="w-full border-t pt-4 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-sm lg:text-base font-semibold text-neutral-700">
              <span>Total</span>
              <span>₹ {nonDiscPrice}/-</span>
            </div>

            <div className="flex justify-between items-center text-sm lg:text-base font-semibold text-neutral-700">
              <span>Discount</span>
              <span className='line-through'>₹ {nonDiscPrice-totalCartPrice}/-</span>
            </div>

            {/* <div className="flex justify-between items-center text-sm lg:text-base font-semibold text-neutral-700">
              <span>Delivery Charges</span>
              <span>free</span>
            </div> */}
            
            <div className="flex justify-between items-center text-sm lg:text-base font-semibold text-neutral-700">
              <span>Payable</span>
              <span>₹ {totalCartPrice}/-</span>
            </div>
            <button onClick={handleRedirectPage} className="bg-amber-500 hover:bg-amber-600 text-white py-2 mt-1.5 rounded-lg font-semibold transition">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default DisplayCartProduct
