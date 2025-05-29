'use client'
import CardProduct from '@/Components/CardProduct';
import summaryApi from '@/public/common/summaryApi';
import Axios from '@/public/utils/Axios';
import { ValidUrlConvert } from '@/public/utils/ValidUrlConvert';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const page = () => {
  const params = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const subCategorySlug = params.sub_cat.split('-').slice(0, -1).join('-')
  const categorySlug = params.cat_id.split('-').slice(0, -1).join('-')
  const ALLSubCategory = useSelector(state => state.product.allSubCategory)
  const AllCategory = useSelector(state => state.product.allCategory)
  const [displaySubcategory, setDisplaySubcategory] = useState([])

  const categoryId = params.cat_id.split('-').slice(-1)[0]
  const subCategoryId = params.sub_cat.split('-').slice(-1)[0]

  const fetchProductData = async () => {
    try {
      setLoading(true);
      // console.log('categoryId', categoryId, 'subCategoryId', subCategoryId, 'page', page)
      
      const response = await Axios({
        ...summaryApi.getProductByCategorySubcategory,
        data:{
          category: categoryId,
          subCategory: subCategoryId,
          page: page,
          limit: 15
        }
      })

      const {data : responseData} = response

      if (responseData?.error) {
        toast.error(responseData?.message || "Something went wrong")
        return
      }

      if (responseData.success) {
        if(page === 1){
          setData(responseData.data)
        }else{
          setData((prev) => [...prev, ...responseData.data])
        }
      }else{
        toast.error(responseData?.message || "Something went wrong")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [params])

  useEffect(() => {
    const sub = ALLSubCategory.filter(s => {
      const filterData = s.category.some(c => c._id === categoryId)
      return filterData ? filterData : null
    })
    setDisplaySubcategory(sub)
    if(!sub.length) return toast.warning("No subcategory found")
  }, [params, ALLSubCategory])

  return (
    <main className='bg-amber-50 min-h-[74vh] max-h-[74vh] sticky top-22 lg:top-18'>
      <section className="container grid grid-cols-[100px_1fr] md:grid-cols-[260px_1fr] lg:grid-cols-[200px_1fr] gap-5 mx-auto px-0 lg:gap-5 bg-amber-100">
        {/* sub category */}
        <aside className='sticky top-22 lg:top-18 min-h-[74vh] max-h-[74vh] flex flex-col min-w-31 max-w-33 items-center justify-start overflow-scroll no-scrollbar px-2.5 py-2.5 gap-2.5'>
          {
            displaySubcategory.map((s, index) => {
              const url = `/category/${ValidUrlConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/subcategory/${ValidUrlConvert(s?.name)}-${s?._id}`
              return (
                <Link href={url} key={index} className={`${subCategoryId === s._id ? "bg-amber-100 hover:bg-amber-50" : "bg-white hover:bg-amber-100"} rounded-lg p-1.5 lg:p-3 min-h-36 min-w-24 max-w-28 mx-auto grid gap-2 hover:shadow-lg cursor-pointer`}>
                  <div className="bg-amber-100 rounded h-26">
                    <img
                      src={s.image}
                      className="w-full h-full object-cover rounded hover:scale-105 transition-transform duration-150"
                    />
                    <h3 className="text-base font-medium text-ellipsis line-clamp-1 text-amber-800 px-2.5">{s.name}</h3>
                  </div>
                </Link>
              )
            })
          }
        </aside>

        {/* product */}
        <div className='min-h-[74vh] max-h-[74vh] w-full bg-amber-100 overflow-scroll no-scrollbar'>
          <div className='sticky z-30 top-1 py-2.5 md:py-2.5 bg-amber-100 w-full px-3'>
            <h1 className='text-lg md:text-xl lg:text-2xl font-semibold text-amber-700 text-center'>{categorySlug} - {subCategorySlug}</h1> 
          </div>

          <div className="container min-h-68 mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-10 gap-3 px-3 my-3">
            {
              loading || data.length === 0 ? (
                new Array(20).fill(null).map((c, index) => {
                  return (
                    <div key={index} className="bg-white rounded-lg p-1.5 min-h-36 grid gap-1.5 hover:shadow-lg animate-pulse">
                      <div className="bg-amber-100 rounded min-h-26"></div>
                      <div className="bg-amber-100 rounded min-h-8"></div>
                    </div>
                  )
                })
              ) : (
                data.map((c, index) => {
                  return (
                    <CardProduct key={index} data={c} />
                  )
                })
              )
            }
          </div>
        </div>
      </section>
    </main>
  )
}

export default page