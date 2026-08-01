import Image from 'next/image'

const Loader = ({ label = 'Preparing your experience' }) => (
  <div className="fixed inset-0 z-[70] grid place-items-center bg-[#f7f6f1]/88 p-6 backdrop-blur-md" role="status" aria-live="polite">
    <div className="grid place-items-center gap-5 rounded-3xl border border-white bg-white/90 px-10 py-8 shadow-[var(--shadow-float)]">
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-[#fff2ea]">
        <span className="absolute inset-[-5px] animate-spin rounded-[1.3rem] border-2 border-transparent border-t-[var(--color-primary)] border-r-[var(--color-accent)]" />
        <Image src="/assets/favicon.png" alt="" height={34} width={34} className="rounded-lg" />
      </div>
      <div className="text-center"><p className="font-bold text-[var(--color-text)]">{label}</p><p className="mt-1 text-xs text-[var(--color-muted)]">This will only take a moment</p></div>
    </div>
  </div>
)

export default Loader
