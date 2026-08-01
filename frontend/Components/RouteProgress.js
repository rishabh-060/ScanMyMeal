'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const START_EVENT = 'scanmymeal:navigation-start'

const RouteProgress = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(false)
  const startedAt = useRef(0)
  const safetyTimeout = useRef(null)
  const routeKey = `${pathname}?${searchParams.toString()}`
  const previousRoute = useRef(routeKey)

  useEffect(() => {
    const start = () => {
      startedAt.current = Date.now()
      setActive(true)
      window.clearTimeout(safetyTimeout.current)
      safetyTimeout.current = window.setTimeout(() => setActive(false), 8000)
    }
    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target.closest?.('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const target = new URL(anchor.href, window.location.href)
      if (target.origin !== window.location.origin) return
      const current = new URL(window.location.href)
      if (`${target.pathname}${target.search}` === `${current.pathname}${current.search}` || (target.pathname === current.pathname && target.search === current.search && target.hash)) return
      start()
    }
    document.addEventListener('click', handleClick, true)
    window.addEventListener(START_EVENT, start)
    window.addEventListener('popstate', start)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener(START_EVENT, start)
      window.removeEventListener('popstate', start)
      window.clearTimeout(safetyTimeout.current)
    }
  }, [])

  useEffect(() => {
    if (previousRoute.current === routeKey) return
    previousRoute.current = routeKey
    if (!active) return
    window.clearTimeout(safetyTimeout.current)
    const remaining = Math.max(0, 220 - (Date.now() - startedAt.current))
    const timeout = window.setTimeout(() => setActive(false), remaining)
    return () => window.clearTimeout(timeout)
  }, [routeKey, active])

  return active ? <div className="route-progress" role="progressbar" aria-label="Loading page" /> : null
}

export default RouteProgress
