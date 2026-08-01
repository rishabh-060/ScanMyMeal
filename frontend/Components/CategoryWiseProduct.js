'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import CardLoading from './CardLoading'
import CardProduct from './CardProduct'
import NoData from './NoData'
import useChangePath from '@/hooks/changePath'
import { ValidUrlConvert } from '@/public/utils/ValidUrlConvert'

const CategoryWiseProduct = ({ id, name }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const subCategories = useSelector((state) => state.product.allSubCategory)
  const changePath = useChangePath()

  const destination = () => {
    const sub = subCategories.find((item) => item.category.some((category) => category._id === id))
    return sub ? `/category/${ValidUrlConvert(name)}-${id}/subcategory/${ValidUrlConvert(sub.name)}-${sub._id}` : ''
  }

  useEffect(() => {
    let mounted = true
    Axios({ ...summaryApi.getProductByCategory, data: { id } })
      .then((response) => mounted && setData(response.data.data || []))
      .catch()
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [id, name])

  const openAll = (event) => {
    event.preventDefault()
    const url = destination()
    if (!url) return toast.info('More items are coming soon')
    changePath(url)
  }

  if(!data.length && !loading) {
    return <></>;
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary)]">Popular picks</p><h2 className="mt-1 text-xl font-black capitalize tracking-tight lg:text-2xl">{name}</h2></div>
        <Link href={destination() || '#'} onClick={openAll} className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">See all →</Link>
      </div>
      <section className="no-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-auto py-5 scroll-smooth">
        {loading ? Array.from({ length: 6 }).map((_, index) => <CardLoading key={index} />) : data.length ? data.map((item) => <div key={item._id} className="snap-start"><CardProduct data={item} /></div>) : <NoData />}
      </section>
    </div>
  )
}

export default CategoryWiseProduct
