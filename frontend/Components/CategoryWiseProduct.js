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

const CategoryWiseProduct = ({ id, name }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
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
    <div className="container w-full mt-3 lg:mt-7 mb-2 lg:mb-4 px-1.5">
      <div className="flex justify-between items-center gap-3 border-b-2 border-amber-700">
        <h1 className="text-base lg:text-xl font-semibold text-amber-700 pl-1">{name}</h1>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            const redirectUrl = handleRedirectProductList()
            if (redirectUrl) {
              changePath(redirectUrl)
            }
          }}
          className="text-sm lg:text-base font-semibold text-amber-900 cursor-pointer hover:scale-105 transition-transform duration-150 pr-5"
        >
          See All
        </Link>
      </div>

      <section className="w-full py-5 mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
        {
          loading ? (
            new Array(10).fill(null).map((_, index) => (
              <CardLoading key={index + "loadComp"} />
            ))
          ) : data.length > 0 ? (
            data.map((item, index) => {
              if (!item._id) return null
              return <CardProduct key={index + "catWiseProduct"} data={item} />
            })
          ) : (
            <NoData />
          )
        }
      </section>
    </div>
  )
}

export default CategoryWiseProduct
