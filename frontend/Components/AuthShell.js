'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, Eye, EyeOff, ShieldCheck, Sparkles, TimerReset } from 'lucide-react'
import { useState } from 'react'

export const AuthShell = ({ eyebrow = 'Welcome', title, description, children, footer }) => (
  <main className="min-h-[calc(100vh-8.25rem)] w-full max-w-full overflow-x-hidden px-3 py-5 sm:px-6 lg:grid lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6 lg:p-6">
    <section className="surface-grid relative hidden min-w-0 overflow-hidden rounded-[2rem] bg-[#19221d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div><Link href="/" className="inline-flex items-center gap-3"><Image src="/assets/favicon.png" alt="" width={42} height={42} className="rounded-xl" /><span className="text-lg font-black">Scan My Meal</span></Link></div>
      <div className="max-w-xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-[#f6bf4b]"><Sparkles size={14} /> A better way to order</span><h2 className="mt-6 text-5xl font-black leading-[1.03] tracking-[-0.055em]">Your next great meal is only a few taps away.</h2><p className="mt-5 max-w-md leading-7 text-white/60">Save favourites, follow every order, and move from craving to checkout without the clutter.</p></div>
      <div className="grid grid-cols-3 gap-3">{[[ShieldCheck, 'Secure'], [TimerReset, 'Quick'], [Check, 'Simple']].map(([Icon, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon size={20} className="text-[#f6bf4b]" /><span className="mt-3 block text-sm font-bold">{label}</span></div>)}</div>
    </section>
    <section className="flex min-w-0 items-center justify-center py-6 sm:py-10">
      <div className="min-w-0 w-full max-w-lg animate-fade-up">
        <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-primary)]">{eyebrow}</p><h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{title}</h1>{description && <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">{description}</p>}</div>
        <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">{children}</div>
        {footer && <div className="mt-5 text-center text-sm text-[var(--color-muted)]">{footer}</div>}
      </div>
    </section>
  </main>
)

export const AuthInput = ({ label, id, icon: Icon, className = '', ...props }) => (
  <label htmlFor={id} className="grid gap-2 text-sm font-bold"><span>{label}</span><span className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100">{Icon && <Icon size={18} className="shrink-0 text-[var(--color-muted)]" />}<input id={id} className={`auth-field-input min-w-0 flex-1 py-3 font-medium placeholder:font-normal placeholder:text-neutral-400 ${className}`} {...props} /></span></label>
)

export const PasswordInput = ({ label, id, ...props }) => {
  const [visible, setVisible] = useState(false)
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-bold"><span>{label}</span><span className="flex min-h-12 items-center rounded-xl border border-[var(--color-border)] bg-white px-4 focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-orange-100"><input id={id} type={visible ? 'text' : 'password'} className="auth-field-input min-w-0 flex-1 py-3 font-medium placeholder:font-normal placeholder:text-neutral-400" {...props} /><button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]" onClick={() => setVisible((value) => !value)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
  )
}
