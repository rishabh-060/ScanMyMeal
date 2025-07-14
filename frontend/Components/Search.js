"use client"
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import { FaArrowLeft } from 'react-icons/fa'
import { TypeAnimation } from 'react-type-animation'
import usePath from '@/hooks/usePath'
import useChangePath from '@/hooks/changePath'
import { useSearchParams } from 'next/navigation'

const Search = () => {

  const [url, setUrl] = useState('')
  const isSearch = usePath('/search')
  const changePath = useChangePath()
  const {q} = useSearchParams()
  
  const debounce = (func, delay) => {
    let timeOutId;
    return (...arg) => {
      clearTimeout(timeOutId);
      timeOutId = setTimeout(() => func(...arg), delay)
    }
  }

  const handleSearchQuery = debounce((args) => {setUrl(`/search?q=${args}`)}, 150)
  
  const handleOnchange = (e) => {
    const value = e.target.value
    handleSearchQuery(value)
  }

  useEffect(() => {
    changePath(url)
  }, [url])

  return (
    <div className='w-full min-w-[300px] lg:min-w-[420px] h-9 lg:h-12 text-sm lg:text-md rounded-full border border-neutral-100 bg-slate-100 overflow-hidden flex items-center cursor-pointer'>
        {
            !(isSearch) ? (
                <Link href={'/search'} className='flex justify-center items-center h-full p-3 text-neutral-500'>
                    <IoSearch size={20}/>
                </Link>
            ) : ( 
                <Link href={'/'} className='flex justify-center items-center h-full p-3 text-neutral-500'>
                    <FaArrowLeft size={18}/>
                </Link>
            )
        }
        
        <div className='h-full w-full flex items-center'>
            {
                !isSearch ? (
                    <Link href={'/search'} className='text-neutral-400'>
                        <TypeAnimation
                            sequence={[
                                'Search "Tea, Coffee & Shakes"',
                                1000,
                                'Search "Momos, Fries, Rolls etc.."',
                                1000,
                                'Search "Chocolates, Cookies, Pastry etc.."',
                                1000,
                                'Search "Chips, Kurkure , Soft drinks, etc.."',
                                1000
                            ]}
                            wrapper='span'
                            speed={50}
                            repeat={Infinity}
                        />
                    </Link>
                ) : (
                    <div className='text-neutral-400 h-full w-full'>
                        <input
                            type='text'
                            placeholder='Search Your Meal Here'
                            className='bg-transparent outline-none h-full w-full'
                            autoFocus
                            onChange={handleOnchange}
                        />
                    </div>
                )
            }
        </div>
        
    </div>
  )
}

export default Search
