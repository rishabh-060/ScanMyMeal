'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'

const Search = () => {
  const pathname = usePathname()
  const router = useRouter()
  const params = useSearchParams()
  const isSearch = pathname === '/search'
  const [query, setQuery] = useState(params.get('q') || '')
  const timer = useRef(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])
  const update = (value) => {
    setQuery(value)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => router.replace(`/search?q=${encodeURIComponent(value)}`), 220)
  }

  return (
    <div className="flex h-11 w-full max-w-xl items-center rounded-2xl border border-black/[0.06] bg-white shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100">
      {isSearch ? <Link href="/" className="grid h-full w-11 place-items-center text-[var(--color-muted)]" aria-label="Back home"><ArrowLeft size={18} /></Link> : <Link href="/search" className="grid h-full w-11 place-items-center text-[var(--color-muted)]" aria-label="Open search"><SearchIcon size={18} /></Link>}
      {isSearch ? <input value={query} onChange={(event) => update(event.target.value)} className="search-field-input h-full min-w-0 flex-1 pr-4 text-sm placeholder:text-neutral-400" placeholder="Search dishes, drinks, or categories" autoFocus /> : <Link href="/search" className="flex h-full flex-1 items-center pr-4 text-sm text-[var(--color-muted)]">What are you craving today?</Link>}
    </div>
  )
}

export default Search
