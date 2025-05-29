'use client'
import DisplayCartProduct from '@/Components/DisplayCartProduct'
import RestrictUser from '@/Components/RestrictUser'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

const Cart = () => {
  const user = useSelector((state) => state.user)
  
  useEffect(() => {
    // if user is not logged in, redirect to login page
    if (!user) {
        <RestrictUser />
    }
  }, [])

  return (
    <DisplayCartProduct />
  )
}

export default Cart