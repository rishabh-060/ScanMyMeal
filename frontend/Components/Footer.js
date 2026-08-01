import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Clock3, Code2, Mail, MapPin, Sparkles } from 'lucide-react'

const Footer = () => (
  <footer className="mt-16 border-t border-black/[0.06] bg-[#19221d] text-white">
    <div className="page-container pt-10 sm:pt-12">
      <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#253128] to-[#101713] shadow-2xl">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f6bf4b] text-[#19221d] shadow-[0_10px_30px_rgb(246_191_75_/_0.18)]"><Code2 size={23} /></span>
            <div><span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#f6bf4b]"><Sparkles size={14} /> Bring your idea online</span><h2 className="mt-2 text-2xl font-black tracking-[-0.035em] sm:text-3xl">Want a website designed for your business?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Work with developer Rishabh Verma to create a fast, modern website shaped around your brand and customers.</p></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href="mailto:verma.rishabh924@gmail.com?subject=Website%20design%20enquiry" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold hover:border-white/30 hover:bg-white/10"><Mail size={17} /> Email Rishabh</a>
            <a href="https://rishabh-060.netlify.app/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f6bf4b] px-4 text-sm font-black text-[#19221d] hover:-translate-y-0.5 hover:bg-[#ffd16a]">View portfolio <ArrowUpRight size={17} /></a>
          </div>
        </div>
      </div>

      <div className="grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="max-w-md"><div className="flex items-center gap-3"><Image src="/assets/favicon.png" alt="" width={42} height={42} className="rounded-xl" /><strong className="text-xl font-black tracking-tight">Scan My Meal</strong></div><p className="mt-4 text-sm leading-6 text-white/60">From table scan to doorstep delivery, enjoy a simple ordering experience built around fresh food and clear choices.</p></div>
        <div><h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f6bf4b]">Explore</h2><div className="mt-4 grid gap-3 text-sm text-white/70"><Link href="/search" className="hover:text-white">Browse the menu</Link><Link href="/dashboard/my-orders" className="hover:text-white">Track your orders</Link><Link href="/dashboard/address" className="hover:text-white">Saved addresses</Link></div></div>
        <div><h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f6bf4b]">Restaurant</h2><div className="mt-4 grid gap-3 text-sm text-white/70"><span className="flex items-center gap-2"><Clock3 size={16} /> Open daily, 9am–11pm</span><span className="flex items-center gap-2"><MapPin size={16} /> Dine in, takeaway & delivery</span><a href="mailto:hello@scanmymeal.app" className="flex items-center gap-2 hover:text-white"><Mail size={16} /> hello@scanmymeal.app</a></div></div>
      </div>
    </div>
    <div className="border-t border-white/10"><div className="page-container flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Scan My Meal</span><span>Made for easier, happier meals.</span></div></div>
  </footer>
)

export default Footer
