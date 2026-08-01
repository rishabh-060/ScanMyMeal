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
    const [serverUnavailable, setServerUnavailable] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [cartItemDetail, setCartItemDetail] = useState()
    const canAdd = data?.publish !== false && data?.isAvailable !== false && Number(data?.stock || 0) > 0 && !serverUnavailable

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
        if (error?.response?.data?.code === 'PRODUCT_UNAVAILABLE') {
          setServerUnavailable(true)
        }
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
        if(response?.success) {
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
      if(response?.success) {
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

    useEffect(() => {
      setServerUnavailable(false)
    }, [data?._id, data?.stock, data?.isAvailable, data?.publish])

  return (
    <div>
      {
        isAvailable ? (
          <div className="flex items-center justify-center gap-1 rounded-xl bg-[var(--color-surface-soft)] p-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[var(--color-text)] shadow-sm hover:bg-[#fff1eb] hover:text-[var(--color-primary)]"
            onClick={handleDecreaseItem}
            aria-label="Decrease quantity"
          >
            <HiMinus />
          </button>

          <p className="w-6 text-center text-sm font-black">{quantity}</p>

          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-strong)] disabled:opacity-40"
            onClick={handleIncreaseItem}
            disabled={loading || quantity >= Number(data.stock || 0)}
            aria-label="Increase quantity"
          >
            <HiPlus />
          </button>
          </div>
        ) : (
          <button
          onClick={handleAddToCart}
          disabled={loading || !canAdd}
          className="flex min-h-9 min-w-18 items-center justify-center rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-strong)] disabled:opacity-50"
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
            <span>{canAdd ? 'Add' : 'Unavailable'}</span>
            )
          }
          </button>
        )
      }
    </div>
  )
}

export default AddToCartButton
