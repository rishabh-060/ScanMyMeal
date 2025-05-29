'use client'
import UserMenu from '@/Components/userMenu'
import React from 'react'
import { useSelector } from 'react-redux'
import BacktoHome from '@/Components/BacktoHome'

const page = () => {
  const user = useSelector((state) => state.user)
  if(!user?.id){
    window.history.back()
  }

  const handleCroosBtn = () => {
    window.history.back()
  }
  return (
    <section className='container w-full min-h-[65vh] lg:min-h-[68vh] mx-auto px-4 py-6 bg-neutral-50'>
        <BacktoHome/>
        <div>
            <UserMenu />
        </div>
    </section>
  )
}

export default page