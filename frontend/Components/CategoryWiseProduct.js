import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import CardLoading from './CardLoading'
import CardProduct from './CardProduct'
import NoData from './NoData'
import useChangePath from '@/hooks/changePath'
import { useSelector } from 'react-redux'
import { ValidUrlConvert } from '@/public/utils/ValidUrlConvert'
import Loader from './Loader'

const CategoryWiseProduct = ({ id, name }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageChange, setPageChange] = useState(false)
  const subCategoryData = useSelector(state => state.product.allSubCategory)

  const changePath = useChangePath()

  const handleRedirectProductList = () => {
    const subCategory = subCategoryData.find((sub) => {
      return sub.category.some((c) => c._id === id)
    })

    if (!subCategory) {
      toast.warning("No subcategory found")
      return null
    }

    const url = `/category/${ValidUrlConvert(name)}-${id}/subcategory/${ValidUrlConvert(subCategory.name)}-${subCategory._id}`
    return url
  }

  const fetchCategoryWiseProduct = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...summaryApi.getProductByCategory,
        data: { id: id }
      })

      const { data: responseData } = response

      if (responseData.success) {
        setData(responseData?.data)
      }
    } catch (error) {
      toast.error(error?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategoryWiseProduct()
  }, [])

  return (
    <div className="container w-full mt-4 lg:mt-8 mb-3 lg:mb-5 px-2">
      {pageChange && <Loader />}
      {/* Header */}
      <div className="flex justify-between items-center gap-2 border-b border-amber-700 pb-2">
        <h1 className="text-lg lg:text-2xl font-bold text-amber-700 capitalize tracking-wide">
          {name}
        </h1>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPageChange(true)
            const redirectUrl = handleRedirectProductList();
            if (redirectUrl) changePath(redirectUrl);
            setPageChange(false)
          }}
          className="text-sm lg:text-base font-semibold text-amber-800 hover:text-amber-600 transition-colors duration-200 px-2"
        >
          See All →
        </Link>
      </div>

      {/* Scrollable Product Row */}
      <section className="w-full py-5 flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory no-scrollbar">
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <div key={`load-${index}`} className="snap-start flex-shrink-0 w-48">
              <CardLoading />
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((item, index) => (
            item._id && (
              <div key={`product-${index}`} className="snap-start flex-shrink-0 w-52">
                <CardProduct data={item} />
              </div>
            )
          ))
        ) : (
          <NoData />
        )}
      </section>
    </div>
  )
}

export default CategoryWiseProduct
