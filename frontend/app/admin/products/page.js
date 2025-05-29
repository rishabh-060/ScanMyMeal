'use client'
import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import MiniLoader from '@/Components/MiniLoader'
import ProductComponent from '@/Components/ProductComponent'
import ResponsiveWarning from '@/Components/ResponsiveWarning'
import RestrictUser from '@/Components/RestrictUser'
import useMobile from '@/hooks/useMobile'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import isAdmin from '@/public/utils/isAdmin'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { SiSlashdot } from "react-icons/si"
import { IoSearch } from 'react-icons/io5'

const ProductList = () => {
  const user = useSelector((state) => state.user)
  const [isMobile] = useMobile()
  
  if(!isAdmin(user.role)){
    return <RestrictUser />
  }

  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [totalPageCount, setTotalPageCount] = useState(1)
  const dispatch = useDispatch()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...summaryApi.getProduct,
        data : {
          page : page,
          limit : 15,
          search : search,
        }
      })

      const { data : responseData } = response
      if (responseData.success) {
        setProducts(responseData.data)
        setTotalPageCount(responseData.totalNoPage)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page])

  useEffect(() => {
    let flag = true
    const interval = setTimeout(() => {
      if(flag){
        fetchProducts()
        flag = false
      }
    }, 300)

    return () => clearTimeout(interval)
  }, [search])

  const handleNext = () => {
    if (page < totalPageCount) {
      setPage(page + 1)
    }
  }

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  return (
    <main className='px-2 lg:px-5'>
      {
        isMobile && <BacktoHome />
      }

      {
        isMobile && <ResponsiveWarning />
      }
      <h1 className='text-emerald-600 font-bold text-center my-2 lg:my-6 text-2xl'>Menu Items</h1>

      <Divider />
      
      <div className='w-full flex items-center justify-center'>
        <div className='w-full flex items-center mt-4 justify-center max-w-108 bg-white/90 px-5 py-2 border border-gray-300 rounded-full'>
          <input
            type="text"
            autoFocus
            placeholder="Search for products..."
            className="w-full bg-transparent text-base lg:text-lg text-neutral-600 focus-within:outline-none placeholder:text-neutral-400"
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />
          <IoSearch className='text-neutral-600' size={22}/>
        </div>
      </div>

      <section className="bg-amber-400 rounded-lg w-full min-h-52 my-6 p-3 lg:p-5">

        <h1 className='text-amber-700 font-bold text-center mb-2 lg:mb-6 text-2xl'>Menu Item List</h1>

        <div className="relative w-full h-full bg-white/80 rounded-lg shadow-md overflow-hidden">
          {
            loading && <MiniLoader />
          }
          <div className="min-h-[450px] overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4">
            {
              products.map((((product, index) => {
                return <ProductComponent key={index} data={product} fetchProducts={fetchProducts}/>
              })))
            }
          </div>
        </div>
        
        <div className="flex justify-center items-center my-4 w-full gap-8">
          <button onClick={() => handlePrev()} className='bg-white/80 py-1.5 px-5 rounded font-medium text-neutral-500 hover:scale-105 cursor-pointer'>prev</button>
          
          <div className='w-fit flex justify-center items-center gap-1.5'>
            <span className='bg-white/80 py-1.5 px-3 rounded font-medium text-neutral-500 hover:scale-105 border border-amber-500'>{page}</span>
            <span><SiSlashdot size={25} className='text-neutral-500 font-light'/></span>
            <span className='bg-white/80 py-1.5 px-3 rounded font-medium text-neutral-500 hover:scale-105'>{totalPageCount}</span>
          </div>

          <button onClick={() => handleNext()} className='bg-white/80 py-1.5 px-5 rounded font-medium text-neutral-500 hover:scale-105 cursor-pointer'>next</button>
        </div>
      </section>
    </main>
  )
}

export default ProductList