'use client'
import React from 'react'
import { IoCloseCircle } from "react-icons/io5"

const ConfirmBox = ({cancel, confirm, close}) => {
  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-300/60 w-full h-full z-50 flex flex-col items-center justify-center'>
        <div className='bg-neutral-50 w-full lg:w-128 flex flex-col p-5 pb-8 rounded-lg gap-6'>
            <div className='flex items-center justify-between w-full'>
                <h1 className='text-lg lg:text-2xl font-bold text-neutral-700'>Delete Category</h1>
                <button onClick={() => close()} className='text-neutral-700 font-bold block'>
                    <IoCloseCircle size={30} className='text-neutral-700 font-bold'/>
                </button>
            </div>

            <p className='text-lg lg:text-xl text-neutral-700 font-medium mt-3'>Are you sure to delete permanentaly?</p>

            <div className='flex items-center gap-5 w-full'>
                <button 
                    className='text-red-800 bg-red-400 text-lg py-1.5 font-bold px-3.5 rounded transition-transform transform hover:scale-105'
                    onClick={() => cancel()}
                >
                    Cancel
                </button>
                <button 
                    className='text-emerald-800 bg-emerald-400 text-lg font-bold py-1.5 px-3.5 rounded transition-transform transform hover:scale-105'
                    onClick={() => confirm()}
                >
                    Confirm
                </button>
            </div>
        </div>
    </section>
  )
}

export default ConfirmBox