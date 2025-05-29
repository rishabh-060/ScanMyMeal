'use client'
import React from 'react'
import { IoCaretBackSharp } from "react-icons/io5";
import Divider from './Divider';

const BacktoHome = () => {
  
  const handleCroosBtn = () => {
    window.history.back()
  }

  return (
     <div className='w-full text-right py-2'>
      <button className='text-right text-neutral-800 px-2' onClick={handleCroosBtn}><IoCaretBackSharp size={22} className='text-neutral-600 font-extrabold'/></button>

      <Divider />
      </div>
  )
}

export default BacktoHome