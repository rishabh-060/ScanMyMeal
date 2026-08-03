import React from 'react'
import { IoCloseCircle } from 'react-icons/io5'

const ViewImage = ({url, close}) => {
  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-300/60 w-full h-full z-[100] flex flex-col items-center justify-center'>
            <div className='bg-neutral-50 w-full lg:w-128 flex flex-col items-center p-5 pb-8 rounded-lg gap-6'>
                <div className='flex items-center justify-end w-full'>
                    <button onClick={() => close()} className='text-neutral-700 font-bold block'>
                        <IoCloseCircle size={30} className='text-neutral-700 font-bold'/>
                    </button>
                </div>

                <div className="relative flex justify-center items-center bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-200">
                    <img 
                        src={url} 
                        width={220} 
                        height={220} 
                        className="rounded-xl border-4 border-gray-300 shadow-lg transition-transform duration-300 hover:scale-125"
                    />
                </div>
            </div>
    </section>
  )
}

export default ViewImage
