'use client'
import CardLoading from '@/Components/CardLoading'
import CardProduct from '@/Components/CardProduct'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useSearchParams } from 'next/navigation'


const Search = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const loadingArrayCard = new Array(10).fill(null) || []
  const [page, setPage] =useState(1)
  const [totalpage, setTotalpage] = useState(1)
  const params = useSearchParams()
  const searchQuery = params.get('q') || ""

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await Axios({
        ...summaryApi.searchProduct,
        data: {
          search : searchQuery,
          page : page,
          limit : 16
        }
      })
      const {data : responseData} = response

      if(responseData.success){
        if(responseData.page == 1){
          setData(responseData.data)
        }else{
          setData((prev) => {
            return [
              ...prev,
              ...responseData.data
            ]
          })
        }
        setTotalpage(responseData.totalPage)
      }
    } catch (error) {
      toast.error(error?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  },[page, searchQuery])

  const handleFetchMore = () => {
    if(totalpage > page){
      setPage(prev => prev + 1)
    }
  }

  return (
    <main className="min-h-[75vh] w-full bg-amber-50 p-4">
        <section className='container mx-auto p-4 w-full bg-amber-100 rounded'>
          <p className='text-neutral-700 font-medium text-base lg:text-lg'>Search Results : {data.length}</p>
          
          <InfiniteScroll
            dataLength={data.length}
            hasMore={true}
            next={handleFetchMore}
          >

          <div className='grid w-full items-center justify-around grid-cols-2 md:grid-col-4 lg:grid-cols-8 gap-3 lg:gap-5 px-1 py-5 lg:py-8 lg:px-5'>
              {
                data.map((p, idx) => {
                  return (
                    <CardProduct data={p} key={idx+'kkkn229i9i'}/>
                  )
                })
              }

              {
                loading && (
                  loadingArrayCard.map((_, idx) => {
                    return (
                      <CardLoading key={idx+'jvvbjb26262'}/>
                    )
                  })
                )
              }
          </div>
          </InfiniteScroll>
        </section>
    </main>
  )
}

export default Search