'use client'
import { useGlobalContext } from '@/provider/GlobalProvider'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { HiPlus } from "react-icons/hi"
import { HiMinus } from "react-icons/hi"

const AddToCartButton = ({ data }) => {
    const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const [isAvailable, setIsAvailable] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [cartItemDetail, setCartItemDetail] = useState()

    const handleAddToCart = async (e) => {
      e.preventDefault()
      e.stopPropagation()
  
      try {
        setLoading(true)
  
        const response = await Axios({
          ...summaryApi.addToCart,
          data : {
            productId : data?._id
          }
        })
  
        const { data : responseData } = response
  
        if (responseData.success) {
          toast.success(responseData?.message)
        }
      } catch (error) {
        toast.error(error?.response?.data?.message)
      } finally {
        if(fetchCartItem) fetchCartItem()
        setLoading(false)
      }
    }

    const handleIncreaseItem = async (e) => {
        e.preventDefault()
        e.stopPropagation()
    
        const response = await updateCartItem(cartItemDetail?._id, quantity + 1)
        if(response.success) {
          toast.success('Item added successfully')
          setQuantity(quantity + 1)
        } else {
          toast.error(response?.data?.message)
        }
    }

    const handleDecreaseItem = async (e) => {
      e.preventDefault()
      e.stopPropagation()
    
      if ( quantity === 1) {
        deleteCartItem(cartItemDetail?._id)
        setIsAvailable(false)
        setQuantity(1)
        return
      }

      const response = await updateCartItem(cartItemDetail?._id, quantity - 1)
      if(response.success) {
        toast.success('Item removed successfully')
        setQuantity(quantity - 1)
      } else {
        toast.error(response?.data?.message)
      }
    }

    useEffect(()=>{
        const checkingItem = cartItem.some(item => item.product._id === data._id)
        const checkingQuantity = cartItem.find(item => item.product._id === data._id)

        setIsAvailable(checkingItem)
        setQuantity(checkingQuantity?.quantity)

        setCartItemDetail(checkingQuantity)
    }, [ data, cartItem ])

  return (
    <div>
      {
        isAvailable ? (
          <div className="flex items-center gap-0.5 rounded-md justify-center bg-white">
          <button
            className="w-8 h-8 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold rounded transition-transform hover:scale-105"
            onClick={handleDecreaseItem}
            aria-label="Decrease quantity"
          >
            <HiMinus />
          </button>

          <p className="w-6 text-center font-medium">{quantity}</p>

          <button
            className="w-8 h-8 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold rounded transition-transform hover:scale-105"
            onClick={handleIncreaseItem}
            aria-label="Increase quantity"
          >
            <HiPlus />
          </button>
          </div>
        ) : (
          <button
          onClick={handleAddToCart}
          className="w-full py-2 bg-amber-500 text-white rounded hover:bg-amber-700 hover:scale-105 transition-transform font-medium text-sm flex items-center justify-center"
          >
          {
            loading ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8.009 8.009 0 0 1 12 20Z"/>
            </svg>
            ) : (
            <span>Add</span>
            )
          }
          </button>
        )
      }
    </div>
  )
}

export default AddToCartButton