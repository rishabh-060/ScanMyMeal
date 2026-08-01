'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import CardProduct from '@/Components/CardProduct'
import { Button, EmptyState, Skeleton } from '@/Components/ui'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'

const SearchPage = () => {
  const query = useSearchParams().get('q')?.trim() || ''
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  const load = async (targetPage, replace = false) => {
    if (!query) return
    const currentRequest = ++requestId.current
    setLoading(true)
    try {
      const response = await Axios({ ...summaryApi.searchProduct, data: { search: query, page: targetPage, limit: 12 } })
      if (currentRequest !== requestId.current) return
      const result = response.data
      setItems((current) => replace ? (result.data || []) : [...current, ...(result.data || [])])
      setTotalPages(Number(result.totalPage || 0)); setTotalCount(Number(result.totalCount || 0))
    } catch (error) {
      if (currentRequest === requestId.current) toast.error(error.response?.data?.message || 'Unable to search the menu')
    } finally { if (currentRequest === requestId.current) setLoading(false) }
  }

  useEffect(() => {
    requestId.current += 1; setItems([]); setPage(1); setTotalPages(0); setTotalCount(0)
    if (query) load(1, true)
  }, [query])

  const loadMore = async () => { const next = page + 1; setPage(next); await load(next) }

  return (
    <main className="min-h-[72vh] bg-[var(--color-background)] py-7 sm:py-10">
      <div className="page-container">
        <header className="flex flex-col justify-between gap-4 border-b border-black/[0.06] pb-6 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary)]">Menu search</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{query ? `Results for “${query}”` : 'What are you craving?'}</h1><p className="mt-2 text-sm text-[var(--color-muted)]">{query ? loading && !items.length ? 'Searching the menu…' : `${totalCount} ${totalCount === 1 ? 'item' : 'items'} found` : 'Use the search field above to find dishes, drinks, and categories.'}</p></div>{query && <span className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-[var(--color-primary)]"><Sparkles size={14} /> Fresh matches</span>}</header>
        {!query && <div className="mt-8"><EmptyState title="Start with a dish or ingredient" description="Try biryani, pizza, breakfast, tea, or the name of a category." /></div>}
        {query && loading && !items.length && <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} className="h-80" />)}</div>}
        {query && !loading && !items.length && <div className="mt-8"><EmptyState title="No matching menu items" description="Check the spelling, try a broader word, or search for another category." action={<span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]"><Search size={16} /> Try another search above</span>} /></div>}
        {items.length > 0 && <><section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 [&>article]:w-full">{items.map((item) => <CardProduct data={item} key={item._id} />)}{loading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={`more-${index}`} className="h-80" />)}</section><div className="mt-8 flex justify-center">{page < totalPages ? <Button onClick={loadMore} loading={loading}>Load more results</Button> : <p className="text-sm font-semibold text-[var(--color-muted)]">You’ve reached the end of the results.</p>}</div></>}
      </div>
    </main>
  )
}

export default SearchPage
