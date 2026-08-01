'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import BannerCarousel from './banners/BannerCarousel'
import CategoryWiseProduct from './CategoryWiseProduct'
import { Skeleton } from './ui'
import useChangePath from '@/hooks/changePath'
import { ValidUrlConvert } from '@/public/utils/ValidUrlConvert'
import { setTableId } from '@/public/store/addressSlice'

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory)
  const categoryData = useSelector((state) => state.product.allCategory)
  const subCategoryData = useSelector((state) => state.product.allSubCategory)
  const changePath = useChangePath()
  const dispatch = useDispatch()
  const params = useSearchParams()
  const tableNo = params.get('tableId') || ''

  useEffect(() => { dispatch(setTableId(tableNo)) }, [dispatch, tableNo])

  const openCategory = (category) => {
    const subCategory = subCategoryData.find((sub) => sub.category.some((item) => item._id === category._id))
    if (!subCategory) return toast.info('This category is being prepared')
    changePath(`/category/${ValidUrlConvert(category.name)}-${category._id}/subcategory/${ValidUrlConvert(subCategory.name)}-${subCategory._id}`)
  }

  return (
    <main className="page-container pb-8 pt-5 lg:pt-8">
      <section className="grid gap-4 overflow-hidden rounded-[2rem] bg-[#19221d] p-4 text-white shadow-[var(--shadow-float)] lg:grid-cols-[0.78fr_1.22fr] lg:p-5">
        <div className="surface-grid flex flex-col justify-center rounded-[1.5rem] px-5 py-9 lg:px-9">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-[#f6bf4b]"><Sparkles size={14} /> Made fresh, ordered simply</span>
          <h1 className="max-w-lg text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-6xl">Good food,<br /><span className="text-[#f6bf4b]">right on cue.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base">Browse crowd favourites, order from your table, or get a fresh meal delivered—without the usual friction.</p>
          <div className="mt-7 flex flex-wrap gap-4 text-xs font-semibold text-white/65"><span className="flex items-center gap-2"><Clock3 size={16} className="text-[#f6bf4b]" /> Fast checkout</span><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#f6bf4b]" /> Secure payment</span></div>
        </div>
        <BannerCarousel />
      </section>

      <section className="py-10">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary)]">Find your flavour</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Browse by category</h2></div><span className="hidden text-sm text-[var(--color-muted)] sm:block">Swipe to explore</span></div>
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-3">
          {loadingCategory || !categoryData.length ? Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} className="h-36 w-30 shrink-0 rounded-3xl" />) : categoryData.map((category) => (
            <button key={category._id} onClick={() => openCategory(category)} className="group w-30 shrink-0 snap-start rounded-3xl border border-black/[0.06] bg-white p-2.5 text-left shadow-sm hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
              <img src={category.image} alt="" className="h-24 w-full rounded-2xl object-cover" />
              <span className="mt-3 flex items-center justify-between gap-1 px-1 text-sm font-extrabold"><span className="truncate">{category.name}</span><ArrowRight size={14} className="shrink-0 text-[var(--color-primary)] transition-transform group-hover:translate-x-0.5" /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-12">{categoryData.map((category) => <CategoryWiseProduct key={category._id} id={category._id} name={category.name} />)}</section>
    </main>
  )
}

export default Home
