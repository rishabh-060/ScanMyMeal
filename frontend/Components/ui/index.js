'use client'

import { Loader2, X } from 'lucide-react'
import { forwardRef, useEffect, useRef } from 'react'

export const Button = ({ variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }) => {
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white shadow-[0_10px_24px_rgb(234_91_53_/_0.2)] hover:-translate-y-0.5 hover:bg-[var(--color-primary-strong)]',
    secondary: 'bg-[var(--color-secondary)] text-white shadow-[0_10px_24px_rgb(31_122_90_/_0.17)] hover:-translate-y-0.5 hover:bg-[#185f46]',
    outline: 'border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[#fff7f3]',
    danger: 'bg-[var(--color-error)] text-white hover:bg-[#932b24]',
    ghost: 'text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]',
  }
  const sizes = { sm: 'min-h-9 px-3 py-1.5 text-sm', md: 'min-h-11 px-4 py-2.5', lg: 'min-h-12 px-5 py-3 text-base' }
  return (
    <button className={`inline-flex items-center justify-center rounded-[var(--radius-control)] font-bold disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      <span className="inline-flex items-center justify-center gap-2">
        {loading && <Loader2 aria-hidden="true" className="animate-spin" size={18} />}
        {children}
      </span>
    </button>
  )
}

export const Input = ({ label, hint, error, id, className = '', ...props }) => (
  <label className="grid gap-2 text-sm font-semibold text-[var(--color-text)]" htmlFor={id}>
    {label}
    <input id={id} className={`min-h-12 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[var(--color-text)] outline-none placeholder:text-neutral-400 hover:border-neutral-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-orange-100 ${className}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...props} />
    {hint && !error && <span id={`${id}-hint`} className="text-xs font-normal text-[var(--color-muted)]">{hint}</span>}
    {error && <span id={`${id}-error`} role="alert" className="text-sm font-medium text-[var(--color-error)]">{error}</span>}
  </label>
)

export const Card = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`rounded-[var(--radius-card)] border border-black/[0.06] bg-white shadow-[var(--shadow-card)] ${className}`} {...props}>{children}</div>
))
Card.displayName = 'Card'

export const PageHeader = ({ eyebrow, title, description, action, className = '' }) => (
  <div className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-end ${className}`}>
    <div>
      {eyebrow && <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary)]">{eyebrow}</p>}
      <h1 className="text-2xl font-black tracking-[-0.03em] text-[var(--color-text)] sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">{description}</p>}
    </div>
    {action}
  </div>
)

export const StatusBadge = ({ value = '' }) => {
  const normalized = String(value).toUpperCase()
  const tone = normalized === 'PAID' || normalized === 'COMPLETED' || normalized === 'SERVED' || normalized === 'ACTIVE' || normalized === 'AVAILABLE'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
    : normalized === 'CANCELLED' || normalized === 'FAILED' || normalized === 'INACTIVE' || normalized === 'OUT OF STOCK'
      ? 'bg-red-50 text-red-700 ring-red-600/15'
      : normalized === 'READY' || normalized === 'PREPARING' || normalized === 'TABLE SELECTED'
        ? 'bg-blue-50 text-blue-700 ring-blue-600/15'
        : 'bg-amber-50 text-amber-700 ring-amber-600/15'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${tone}`}>{normalized.replaceAll('_', ' ') || 'UNKNOWN'}</span>
}

export const EmptyState = ({ title, description, action }) => (
  <div className="grid min-h-52 place-items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)]/60 p-8 text-center">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl shadow-sm">✦</div>
    <div><h3 className="font-bold text-[var(--color-text)]">{title}</h3>{description && <p className="mt-1 max-w-md text-sm leading-6 text-[var(--color-muted)]">{description}</p>}</div>
    {action}
  </div>
)

export const Skeleton = ({ className = '' }) => <div aria-hidden="true" className={`skeleton-shimmer rounded-xl ${className}`} />

export const Modal = ({ title, children, onClose }) => {
  const dialogRef = useRef(null)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = dialogRef.current?.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])') || []
    focusable[0]?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') return onClose?.()
      if (event.key !== 'Tab' || !focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown) }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#111914]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <Card ref={dialogRef} className="relative max-h-[90vh] w-full max-w-2xl animate-fade-up overflow-y-auto p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 id="modal-title" className="text-xl font-black tracking-tight">{title}</h2><Button size="sm" variant="ghost" aria-label="Close dialog" onClick={onClose}><X size={19} /></Button></div>
        {children}
      </Card>
    </div>
  )
}
