"use client"
import Image from 'next/image'
import Search from './Search'
import Link from 'next/link'
import { FaRegCircleUser } from 'react-icons/fa6'
import useMobile from '@/hooks/useMobile'
import usePath from '@/hooks/usePath'
import { BsCart4 } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import { FaAngleDown, FaAngleUp } from "react-icons/fa6"
import { useEffect, useRef, useState } from 'react'
import UserMenu from './userMenu'
import useChangePath from '@/hooks/changePath'
import { usePathname } from 'next/navigation'
import { useGlobalContext } from '@/provider/GlobalProvider'
import DisplayCartProduct from './DisplayCartProduct'

const Navbar = () => {
  const [ optionUserMenu, setOptionUserMenu ] = useState(false)
  const [ openCartComp, setOpenCartComp ] = useState(false)
  const [ isMobile ] = useMobile()
  const isSearchPage = usePath('/search')
  const changePath = useChangePath()
  const pathname = usePathname()

  const cartItem = useSelector(state => state.cartItem.cart)
  const { totalCartItem, totalCartPrice } = useGlobalContext()

  const user = useSelector((state) => state.user)
  const menuRef = useRef(null)
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOptionUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    // Close the menu when route changes
    setOptionUserMenu(false)
  }, [pathname])

  const handleMobileUser = () => {
    changePath(user?.id ? '/user-account' : '/login')
  }

  return (
    <header className='z-50 h-22 w-full lg:h-18 shadow-md lg:shadow-lg pr-5 lg:pr-10 lg:px-5 sticky top-0 flex flex-col justify-center bg-gray-50'>
      {
        !(isSearchPage && isMobile) && (
          <div className='flex items-center justify-between h-full w-full'>
            {/* LOGO part */}
            <Link href='/' className='flex items-end gap-2 h-fit'>
                <Image
                  className='rounded bg-center hidden lg:block'
                  src={`/assets/favicon.png`}
                  alt="Scan My Meal"
                  height={38}
                  width={38}
                />
                {/* mobile view */}
                <Image
                  className='rounded bg-center lg:hidden'
                  src={`/assets/favicon.png`}
                  alt="Scan My Meal"
                  height={24}
                  width={24}
                />
                <span className='text-base md:text-xl tracking-wider font-bold text-amber-600 border-b-2 border-b-amber-600'>Scan My Meal</span>
            </Link>

            {/* Search section */}
            <div
            className='hidden lg:block'
            >
              <Search />
            </div>

            {/* login & My cart */}
            <div>
              <button className='text-green-800 font-medium lg:hidden' onClick={handleMobileUser}>
                  {
                    !user.id ? (
                      <FaRegCircleUser size={22}/>
                    ) : (
                      <div className='h-8 w-8 border-amber-600 border-[1px] rounded-full overflow-hidden object-center object-cover'>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className='h-full w-full object-cover'
                          height={8}
                          width={8}
                        />
                      </div>
                    )
                  }
              </button>

              <div className='hidden lg:flex items-center gap-10 select-none'>
                { 
                  (!user?.id) ? (
                    <Link href={'/login'} className='text-amber-800 font-medium text-lg cursor-pointer'>Login</Link>
                  ) : (
                    <div className='relative' ref={menuRef}>
                      <div onClick={() => setOptionUserMenu(!optionUserMenu)} className='flex items-center gap-1.5 text-green-800 font-medium text-lg cursor-pointer'>
                      <span className='h-8 w-8 hover:h-9 hover:w-9 border-emerald-600 border-[1px] rounded-full overflow-hidden object-center object-cover'>
                        <img
                          src={user.avatar || ''}
                          alt={user.name}
                          className='h-full w-full object-cover'
                          height={8}
                          width={8}
                        />
                      </span>
                      {user.name}
                      { optionUserMenu ? <FaAngleUp /> : <FaAngleDown /> }
                      </div>
                      {optionUserMenu && (
                        <div className='absolute right-0 top-16'>
                          <div className='bg-neutral-50 rounded p-4 min-w-52'>
                            <UserMenu close={() => setOptionUserMenu(false)} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
                
                <button onClick={() => setOpenCartComp(true)} className='flex items-center gap-2 bg-green-700 hover:bg-green-600 px-2 py-1 rounded text-neutral-50'>
                  <div className='animate-bounce transition-transform duration-700'>
                    <BsCart4 size={21}/>
                  </div>
                  {
                    cartItem.length > 0 ? (
                      <div className='text-sm leading-4 text-slate-100 flex flex-col items-start'>
                        <p>{totalCartItem} item</p>
                        <p>₹ {totalCartPrice}/- total</p>
                      </div>
                    ) : (
                      <div className='text-sm leading-4 text-slate-100 flex flex-col items-start'>
                        <p>My Cart</p>
                      </div>
                    )
                  }
                </button>
              </div>
            </div>
          </div>
        )
      }

      

      {/* Search section */}
      <div
        className='lg:hidden ml-4 mb-2'
      >
        <Search />
      </div>

      {
        openCartComp && <DisplayCartProduct close={() => setOpenCartComp(false)}/>
      }
    </header>
  )
}

export default Navbar