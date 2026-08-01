import { Loader2 } from 'lucide-react'

const MiniLoader = ({ label = 'Updating' }) => (
  <div className="absolute inset-0 z-20 grid place-items-center rounded-[inherit] bg-white/82 backdrop-blur-sm" role="status">
    <div className="flex items-center gap-3 rounded-full border border-black/5 bg-white px-4 py-2.5 font-semibold text-[var(--color-muted)] shadow-lg"><Loader2 className="animate-spin text-[var(--color-primary)]" size={19} />{label}</div>
  </div>
)

export default MiniLoader
