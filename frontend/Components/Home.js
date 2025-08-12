'use client'
import useChangePath from "@/hooks/changePath";
import { ValidUrlConvert } from "@/public/utils/ValidUrlConvert";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryWiseProduct from "./CategoryWiseProduct";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { setTableId } from "@/public/store/addressSlice";
import Loader from "./Loader";

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)

  const changePath = useChangePath()
  const dispatch = useDispatch();
  const params = useSearchParams()
  const tableNo = params.get('tableId') || '';

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    dispatch(setTableId(tableNo))
  }, [tableNo])

  const handleRedirectProductList = (id, cat) => {
    setLoading(true)
    const subCategory = subCategoryData.find((sub) => {
      const filterData = sub.category.some((c) => c._id === id)
        return filterData ? true : null
    })

    if(!subCategory) return toast.warning("No subcategory found")

    const url = `/category/${ValidUrlConvert(cat)}-${id}/subcategory/${ValidUrlConvert(subCategory.name)}-${subCategory._id}`
    changePath(url)
    setLoading(false)
  }

  return (
    <section className="container mx-auto rounded-lg">
      {loading && <Loader />}
      {/* Responsive Banner */}
      <div className={`w-full h-32 md:min-h-64 rounded-lg overflow-hidden bg-amber-100 shadow-lg`}>
        <picture>
          <source media="(min-width: 1024px)" srcSet="/assets/banner2.png" />
          <img
            src="/assets/banner2.png"
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* Category Section */}
      <div className="w-full mt-3 lg:mt-7 mb-2 lg:mb-4 px-1.5">
        <h1 className="text-lg lg:text-2xl font-bold text-amber-700 capitalize tracking-wide">
          🍱Browse by Category
        </h1>
      </div>

      {/* Category Grid */}
      <div className="w-full md:mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-0 md:gap-1 min-w-max snap-x snap-mandatory overflow-x-auto">
          {
            loadingCategory || categoryData.length === 0 ? (
              new Array(20).fill(null).map((_, index) => (
                <div key={index} className="rounded-lg p-1.5 min-h-36 w-32 flex-shrink-0 grid gap-2.5 animate-pulse transition">
                  <div className="bg-amber-100 rounded-full h-26 w-26 mx-auto" />
                  <div className="bg-amber-100 rounded-full h-8 w-full" />
                </div>
              ))
            ) : (
              categoryData.map((c, index) => (
                <div
                  key={index}
                  onClick={() => handleRedirectProductList(c._id, c.name)}
                  className="bg-transparent rounded-lg p-1.5 lg:p-3 h-fit w-32 flex-shrink-0 grid gap-2.5 items-center justify-center cursor-pointer hover:bg-amber-50 transition snap-center"
                >
                  <div className="bg-amber-100 rounded-full overflow-hidden w-26 h-26 border-2 p-1 border-amber-600">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover rounded-full hover:scale-105 transition-transform duration-150"
                    />
                  </div>
                  <div className="bg-amber-100 rounded min-h-8 max-h-10 flex items-center justify-center p-0.5 hover:scale-105 transition-transform duration-150 overflow-hidden snap-center">
                    <h3 className="text-sm font-medium text-ellipsis whitespace-nowrap overflow-hidden text-amber-800 px-1.5">
                      {c.name}
                    </h3>
                  </div>
                </div>
              ))
            )
          }
        </div>
      </div>

      {/* Display category products */}
      {
        categoryData?.map((c, index) => {
          return <CategoryWiseProduct key={index+"productList"} id={c._id} name={c.name}/>
        })
      }
    </section>
  );
};

export default Home;