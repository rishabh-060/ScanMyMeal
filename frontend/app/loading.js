import { Skeleton } from '@/Components/ui'

export default function Loading() {
  return (
    <div className="page-container grid min-h-[65vh] gap-6 py-8" aria-label="Loading page">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-56 w-full" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => <Skeleton key={item} className="h-52" />)}
      </div>
    </div>
  )
}
