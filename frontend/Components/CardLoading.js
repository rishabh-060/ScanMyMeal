import { Skeleton } from './ui'

const CardLoading = () => (
  <div className="w-52 shrink-0 rounded-[var(--radius-card)] border border-black/[0.06] bg-white p-3 shadow-sm">
    <Skeleton className="h-36 w-full" />
    <Skeleton className="mt-4 h-4 w-4/5" />
    <Skeleton className="mt-3 h-9 w-full" />
  </div>
)

export default CardLoading
