'use client'
import useChangePath from "@/hooks/changePath";
import { ValidUrlConvert } from "@/public/utils/ValidUrlConvert";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import CategoryWiseProduct from "./CategoryWiseProduct";
import { toast } from "react-toastify";

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)

  const changePath = useChangePath()

  const handleRedirectProductList = (id, cat) => {
    const subCategory = subCategoryData.find((sub) => {
      const filterData = sub.category.some((c) => c._id === id)
        return filterData ? true : null
    })

    if(!subCategory) return toast.warning("No subcategory found")

    const url = `/category/${ValidUrlConvert(cat)}-${id}/subcategory/${ValidUrlConvert(subCategory.name)}-${subCategory._id}`
    changePath(url)
  }

  return (
    <section className="container mx-auto rounded-lg">
      {/* Responsive Banner */}
      <div className={`w-full rounded-lg overflow-hidden bg-amber-200 shadow-lg`}>
        <picture>
          <source media="(min-width: 1024px)" srcSet="/assets/banner2.png" />
          <img
            src="/assets/banner2.png"
            alt="Banner"
            className="w-full h-auto object-cover"
          />
        </picture>
      </div>

      {/* Category Section */}
      <div className="w-full mt-3 lg:mt-7 mb-2 lg:mb-4 px-1.5">
        <h1 className="text-base lg:text-xl font-semibold text-amber-700">
          Browse by Category
        </h1>
      </div>

      {/* Category Grid */}
      <div className="container min-h-68 mx-auto grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 3xl:grid-cols-12 gap-3">
        {
          loadingCategory || categoryData.length === 0 ? (
            new Array(20).fill(null).map((c, index) => {
              return (
                <div key={index} className="bg-white rounded-lg p-1.5 min-h-36 grid gap-2.5 hover:shadow-lg animate-pulse">
                  <div className="bg-amber-100 rounded min-h-26"></div>
                  <div className="bg-amber-100 rounded min-h-8"></div>
                </div>
              )
            })
          ) : (
            categoryData.map((c, index) => {
              return (
                <div key={index} className="bg-white rounded-lg p-1.5 lg:p-3 h-fit grid gap-2.5 hover:shadow-lg cursor-pointer" onClick={() => handleRedirectProductList(c._id, c.name)}>
                  <div className="bg-amber-100 rounded h-26">
                    <img
                      src={c.image}
                      className="w-full h-full object-cover rounded hover:scale-105 transition-transform duration-150"
                    />
                  </div>
                  <div className="bg-amber-100 rounded min-h-8 max-h-10 flex items-center justify-center p-0.5 hover:scale-105 transition-transform duration-150 overflow-hidden">
                    <h3 className="text-base font-medium text-ellipsis line-clamp-1 text-amber-800 px-1.5">{c.name}</h3>
                  </div>
                </div>
              )
            })
          )
        }
      </div>

      {/* Display category products */}
      {
        categoryData.map((c, index) => {
          return <CategoryWiseProduct key={index+"productList"} id={c._id} name={c.name}/>
        })
      }
    </section>
  );
};

export default Home;