'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Axios from '@/public/utils/Axios'
import summaryApi from '@/public/common/summaryApi'
import { Skeleton } from '@/Components/ui'

const BannerCarousel = () => {
  const [banners, setBanners] = useState([])
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Axios({ ...summaryApi.activeBanners, timeout: 3500 })
      .then((response) => mounted && setBanners(response.data.data || []))
      .catch(() => mounted && setBanners([]))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (paused || banners.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const delay = banners[active]?.autoSlideMs || 5000
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % banners.length), delay)
    return () => window.clearTimeout(timer)
  }, [active, banners, paused])

  if (loading) return <Skeleton className="h-72 w-full rounded-[1.5rem] lg:h-[30rem]" />
  const banner = banners[active]
  if (!banner) {
    return <img src="/assets/banner.png" alt="Scan My Meal featured menu" className="h-72 w-full rounded-[1.5rem] object-contain lg:h-[30rem]" />
  }

  const change = (direction) => setActive((index) => (index + direction + banners.length) % banners.length)
  return (
    <section className="relative h-72 overflow-hidden rounded-[1.5rem] bg-neutral-800 lg:h-[30rem]" aria-roledescription="carousel" aria-label="Featured offers">
      {banner.mediaType === 'VIDEO' ? (
        <video key={banner._id} className="h-full w-full object-cover" autoPlay muted loop playsInline aria-label={banner.altText || banner.title}>
          {banner.mobileMediaUrl && <source media="(max-width: 767px)" src={banner.mobileMediaUrl} type="video/mp4" />}
          <source src={banner.desktopMediaUrl} type="video/mp4" />
        </video>
      ) : (
        <picture>
          {banner.mobileMediaUrl && <source media="(max-width: 767px)" srcSet={banner.mobileMediaUrl} />}
          <img src={banner.desktopMediaUrl} alt={banner.altText} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = '/assets/banner2.png' }} />
        </picture>
      )}
      {(banner.title || banner.subtitle || banner.ctaText) && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-6 text-white md:p-9">
          <div className="max-w-lg">
            {banner.title && <h2 className="text-2xl font-black tracking-tight md:text-4xl">{banner.title}</h2>}
            {banner.subtitle && <p className="mt-2 text-sm md:text-base">{banner.subtitle}</p>}
            {banner.ctaText && banner.ctaUrl && <Link className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-4 font-bold text-neutral-900 shadow-lg" href={banner.ctaUrl}>{banner.ctaText}</Link>}
          </div>
        </div>
      )}
      {banners.length > 1 && (
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
          <button aria-label="Previous banner" onClick={() => change(-1)} className="grid min-h-11 min-w-11 place-items-center rounded-full bg-black/55 text-white"><ChevronLeft /></button>
          {/* <button aria-label={paused ? 'Resume carousel' : 'Pause carousel'} onClick={() => setPaused((value) => !value)} className="grid min-h-11 min-w-11 place-items-center rounded-full bg-black/55 text-white">{paused ? <Play size={18} /> : <Pause size={18} />}</button> */}
          <button aria-label="Next banner" onClick={() => change(1)} className="grid min-h-11 min-w-11 place-items-center rounded-full bg-black/55 text-white"><ChevronRight /></button>
        </div>
      )}
    </section>
  )
}

export default BannerCarousel
