'use client'
import React from 'react'
import { IoCloseCircle } from "react-icons/io5"


const AddMoreDetails = ({close, value, onChange, handleSubmit}) => {

  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-300/60 w-full h-full flex flex-col z-40 items-center justify-center'>
        <div className='bg-neutral-50 w-full lg:w-128 flex flex-col items-center p-5 pb-8 rounded-lg gap-6'>
            <div className='flex items-center justify-between w-full'>
                <h1 className='text-lg lg:text-xl font-bold text-neutral-700'>Add More Details</h1>
                <button onClick={() => close()} className='text-neutral-700 font-bold block'>
                    <IoCloseCircle size={30} className='text-neutral-700 font-bold'/>
                </button>
            </div>
            
            <form className='my-3 grid gap-2.5 lg:my-5 w-full'>
                <div className='grid gap-1'>
                    <input
                        className='bg-neutral-200 outline-none px-3 py-1.5 text-amber-600 text-base font-medium w-full rounded'
                        autoFocus
                        placeholder='Enter Category Name'
                        onChange={onChange}
                        type='text'
                        value={value}
                    />
                </div>

                <div>
                    <button
                        onClick={handleSubmit}
                        className={`font-medium px-6 py-1.5 rounded text-neutral-700 bg-amber-50 border-amber-600 border-2 hover:bg-amber-600 hover:text-amber-100 w-fit`}
                    >
                        Add Field
                    </button>
                </div>
            </form>
        </div>
    </section>
  )
}

export default AddMoreDetails