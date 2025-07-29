'use client'
import { ValidUrlConvert } from '@/public/utils/ValidUrlConvert'
import Link from 'next/link'
import React, { useState } from 'react'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({data}) => {
  if(!data) return null
  if(!data._id) return null

  const url = `/product/${ValidUrlConvert(data.name)}-${data._id}`
  

  return (
        <Link href={url} className="w-52 border-2 border-amber-700 rounded-lg p-2.5 min-h-36 max-h-66 grid gap-1.5 hover:shadow-lg shrink-0 transition-transform duration-150 cursor-pointer">
            <div className="bg-white rounded h-32 relative overflow-hidden">
              <img 
                src={data?.image[0]}
                alt={data?.name}
                className="w-full h-full object-cover rounded overflow-hidden hover:scale-105 transition-transform duration-150"
              />

              {data.discount && parseFloat(data.discount) > 0 && (
                <span className="absolute top-2 left-0 bg-red-500 text-white text-xs px-2 py-1 shadow-md animate-bounce transition-transform duration-300">
                  {data.discount}% OFF
                </span>
              )}
            </div>
            
            <div className="text-ellipsis line-clamp-1 text-sm font-medium text-neutral-800 leading-3.5 max-h-8 mt-1.5">{data?.name}</div>

            <div className="text-ellipsis line-clamp-1 text-xs font-medium text-neutral-600 leading-3.5 h-7 flex items-center gap-2 justify-between">
              <h3>{data?.unit}</h3>
              <h3 className={`${data?.stock ? "bg-emerald-200 text-emerald-700" : "bg-red-200 text-red-700"} px-1.5 py-0.5 rounded`}>{data?.stock > 0 ? "available" : "unavailable"}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
                <div className="text-sm font-medium text-neutral-800">
                  {data?.price+" ₹"}
                </div>

                <div>
                  {
                    data?.stock > 0 ? (
                      <AddToCartButton data={data}/>
                    ) : (
                      <span className='text-xs font-medium w-fit text-red-600'>"Out of Stock"</span>
                    )
                  }
                </div>
            </div>
        </Link>
  )
}

export default CardProduct