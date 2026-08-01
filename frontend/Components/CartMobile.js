'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import usePath from '@/hooks/usePath'
import { useGlobalContext } from '@/provider/GlobalProvider'

const CartMobile = () => {
  const { totalCartPrice, totalCartItem } = useGlobalContext()
  const isCartPage = usePath('/dashboard/cart')
  if (!totalCartItem || isCartPage) return null
  return <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3 lg:hidden"><Link href="/dashboard/cart" className="pointer-events-auto mx-auto flex max-w-lg items-center justify-between gap-4 rounded-2xl bg-[#19221d] p-2.5 pl-4 text-white shadow-[var(--shadow-float)]"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><ShoppingBag size={19} /></span><span><strong className="block text-sm">{totalCartItem} item{totalCartItem === 1 ? '' : 's'}</strong><span className="text-xs text-white/60">₹{totalCartPrice} total</span></span></span><span className="inline-flex items-center gap-1 rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-bold">View cart <ArrowRight size={15} /></span></Link></div>
}

export default CartMobile
