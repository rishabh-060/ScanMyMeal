import usePath from '@/hooks/usePath'
import { useGlobalContext } from '@/provider/GlobalProvider'
import Link from 'next/link'
import React from 'react'
import { BsCart4 } from 'react-icons/bs'
import { FaCaretRight } from 'react-icons/fa6'

const CartMobile = () => {
  const { totalCartPrice, totalCartItem } = useGlobalContext()
  const isCartPage = usePath('/dashboard/cart')

  return (
    <div className='fixed w-full bottom-3 p-3'>
        {
            (totalCartItem > 0 && !isCartPage)&& (
                <div className='px-2 py-1 bg-amber-500 rounded-md lg:hidden flex gap-4 items-center justify-between'>
                    <div className='flex items-center gap-4 px-2 py-1 rounded text-neutral-50'>
                        <div className='animate-bounce transition-transform duration-700'>
                            <BsCart4 size={23}/>
                        </div>

                        <div className='text-xs leading-4 text-slate-100 flex flex-col items-start'>
                            <p>{totalCartItem} item</p>
                            <p>₹ {totalCartPrice}/- total</p>
                        </div>
                    </div>

                    <Link href={'/dashboard/cart'} className='flex items-center px-2 py-1 rounded text-sm leading-4 text-slate-100'>
                        <span>view cart</span>
                        <FaCaretRight size={15}/>
                    </Link>
                </div> 
            )
        }
    </div>
  )
}

export default CartMobile