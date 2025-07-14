'use client'
import CardProduct from '@/Components/CardProduct';
import summaryApi from '@/public/common/summaryApi';
import Axios from '@/public/utils/Axios';
import { ValidUrlConvert } from '@/public/utils/ValidUrlConvert';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Page = () => {
  const params = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const categoryId = params.cat_id?.split('-').at(-1);
  const subCategoryId = params.sub_cat?.split('-').at(-1);
  const categorySlug = params.cat_id?.split('-').slice(0, -1).join('-');
  const subCategorySlug = params.sub_cat?.split('-').slice(0, -1).join('-');

  const ALLSubCategory = useSelector((state) => state.product.allSubCategory);
  const displaySubcategory = ALLSubCategory.filter((s) =>
    s.category.some((c) => c._id === categoryId)
  );

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...summaryApi.getProductByCategorySubcategory,
        data: {
          category: categoryId,
          subCategory: subCategoryId,
          page,
          limit: 15,
        },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        setData((prev) => (page === 1 ? responseData.data : [...prev, ...responseData.data]));
      } else {
        toast.error(responseData?.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    return
  }, [params]);

  return (
    <main className="bg-amber-50 min-h-screen py-4">
      <div className="container mx-auto px-3 flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Sidebar */}
        <aside className="md:w-64 sticky top-20 z-20 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar bg-white border border-amber-200 rounded-lg shadow p-3">
          <h2 className="text-lg font-semibold text-amber-700 mb-3">Subcategories</h2>
          <div className="flex flex-col gap-2">
            {displaySubcategory.map((s, index) => {
              const url = `/category/${ValidUrlConvert(s.category[0]?.name)}-${s.category[0]?._id}/subcategory/${ValidUrlConvert(s.name)}-${s._id}`;
              const isActive = subCategoryId === s._id;

              return (
                <Link
                  key={index}
                  href={url}
                  className={`flex items-center gap-3 p-2 rounded-md transition hover:shadow-sm ${
                    isActive ? 'bg-amber-100 border border-amber-600' : 'bg-white border border-gray-200'
                  }`}
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-12 h-12 rounded object-cover border"
                  />
                  <span className="text-sm font-medium text-amber-800 line-clamp-1">{s.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          <div className="mb-3 text-center bg-white border border-amber-200 rounded-lg shadow">
            <h1 className="text-xl md:text-2xl font-bold text-amber-700 capitalize my-6">
              {categorySlug.replace(/-/g, ' ')} - {subCategorySlug.replace(/-/g, ' ')}
            </h1>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 mt-4">
            {loading
              ? Array.from({ length: 15 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="w-full bg-white rounded-lg p-2.5 min-h-36 max-h-66 grid gap-1.5 animate-pulse"
                  >
                    <div className="bg-amber-100 h-32 rounded" />
                    <div className="bg-amber-100 h-4 w-3/4 rounded mx-auto" />
                    <div className="bg-amber-100 h-3 w-2/3 rounded mx-auto" />
                    <div className="bg-amber-100 h-4 w-full rounded" />
                  </div>
                ))
              : data.length > 0
              ? data.map((item, index) => <CardProduct key={index} data={item} />)
              : (
                <div className="col-span-full text-center text-amber-600 font-medium">
                  No products found in this subcategory.
                </div>
              )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;
