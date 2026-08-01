'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, IndianRupee, ReceiptText, TrendingUp } from 'lucide-react'

const WIDTH = 920
const HEIGHT = 330
const PADDING = { top: 28, right: 24, bottom: 52, left: 72 }

const compact = (value, currency) => `${currency ? '₹' : ''}${Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0))}`
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function TrendChart({ data = [], period = 'day' }) {
  const [metric, setMetric] = useState('revenue')
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, data.length - 1))

  useEffect(() => { setSelectedIndex(Math.max(0, data.length - 1)) }, [data])

  const chart = useMemo(() => {
    const plotWidth = WIDTH - PADDING.left - PADDING.right
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom
    const values = data.map((item) => Number(item[metric] || 0))
    const maximum = Math.max(1, ...values)
    const step = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth
    const points = data.map((item, index) => ({
      ...item,
      value: values[index],
      x: data.length > 1 ? PADDING.left + index * step : PADDING.left + plotWidth / 2,
      y: PADDING.top + plotHeight - (values[index] / maximum) * plotHeight,
    }))
    const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
    const area = points.length ? `${line} L ${points.at(-1).x} ${PADDING.top + plotHeight} L ${points[0].x} ${PADDING.top + plotHeight} Z` : ''
    return { plotWidth, plotHeight, maximum, step, points, line, area }
  }, [data, metric])

  if (!data.length) return null
  const selected = data[Math.min(selectedIndex, data.length - 1)] || data[0]
  const values = data.map((item) => Number(item[metric] || 0))
  const total = values.reduce((sum, value) => sum + value, 0)
  const average = total / Math.max(1, values.length)
  const peak = Math.max(...values)
  const xLabelEvery = Math.max(1, Math.ceil(data.length / 8))

  return (
    <div>
      <div className="grid gap-4 border-b border-black/[0.06] p-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--color-primary)]">Sales movement</p><h2 className="mt-1 text-xl font-black">{metric === 'revenue' ? 'Revenue' : 'Order volume'} trend</h2><p className="mt-1 text-xs text-[var(--color-muted)]">{period === 'day' ? 'Hourly' : period === 'year' ? 'Monthly' : 'Daily'} performance for the selected {period}.</p></div>
        <div className="inline-flex w-fit rounded-xl bg-[var(--color-surface-soft)] p-1" role="tablist" aria-label="Chart metric"><button type="button" role="tab" aria-selected={metric === 'revenue'} onClick={() => setMetric('revenue')} className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold ${metric === 'revenue' ? 'bg-white text-[var(--color-secondary)] shadow-sm' : 'text-[var(--color-muted)]'}`}><IndianRupee size={15} /> Revenue</button><button type="button" role="tab" aria-selected={metric === 'orders'} onClick={() => setMetric('orders')} className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold ${metric === 'orders' ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-muted)]'}`}><ReceiptText size={15} /> Orders</button></div>
      </div>

      <div className="grid gap-3 border-b border-black/[0.06] bg-[#fafaf8] p-4 sm:grid-cols-3 sm:p-5">{[
        ['Selected', metric === 'revenue' ? money(selected.revenue) : `${selected.orders} orders`, selected.label, BarChart3],
        ['Peak', metric === 'revenue' ? money(peak) : `${peak} orders`, `Highest ${metric}`, TrendingUp],
        ['Average', metric === 'revenue' ? money(average) : `${average.toFixed(1)} orders`, `Per ${period === 'day' ? 'active hour' : period === 'year' ? 'month' : 'day'}`, ReceiptText],
      ].map(([label, value, note, Icon]) => <div key={label} className="flex items-center gap-3 rounded-xl border border-black/[0.05] bg-white p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon size={16} /></span><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)]">{label}</p><strong className="block truncate text-sm">{value}</strong><p className="truncate text-[10px] text-[var(--color-muted)]">{note}</p></div></div>)}</div>

      <div className="overflow-x-auto p-3 sm:p-5">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[680px]" role="img" aria-label={`${metric} trend chart`}>
          <defs><linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1f7a5a" stopOpacity="0.3" /><stop offset="100%" stopColor="#1f7a5a" stopOpacity="0.02" /></linearGradient><filter id="point-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#19221d" floodOpacity="0.2" /></filter></defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => { const y = PADDING.top + chart.plotHeight * (1 - ratio); return <g key={ratio}><line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y} y2={y} stroke="#dfe2dc" strokeDasharray="5 7" /><text x={PADDING.left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#788179">{compact(chart.maximum * ratio, metric === 'revenue')}</text></g> })}
          {metric === 'revenue' ? <><path d={chart.area} fill="url(#revenue-area)" /><path d={chart.line} fill="none" stroke="#1f7a5a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></> : chart.points.map((point) => <rect key={point.label} x={point.x - Math.min(22, chart.step * 0.28)} y={point.y} width={Math.min(44, chart.step * 0.56)} height={PADDING.top + chart.plotHeight - point.y} rx="8" fill="#ea5b35" opacity={selected?.label === point.label ? 1 : 0.72} />)}
          {chart.points.map((point, index) => <g key={point.label} onClick={() => setSelectedIndex(index)} className="cursor-pointer"><line x1={point.x} x2={point.x} y1={PADDING.top} y2={PADDING.top + chart.plotHeight} stroke={selectedIndex === index ? '#ea5b35' : 'transparent'} strokeDasharray="4 5" />{metric === 'revenue' && <circle cx={point.x} cy={point.y} r={selectedIndex === index ? 7 : 5} fill={selectedIndex === index ? '#ea5b35' : '#fff'} stroke={selectedIndex === index ? '#fff' : '#1f7a5a'} strokeWidth="3" filter={selectedIndex === index ? 'url(#point-shadow)' : undefined} />}<circle cx={point.x} cy={point.y} r="15" fill="transparent"><title>{`${point.label}: ${money(point.revenue)}, ${point.orders} orders`}</title></circle>{(index % xLabelEvery === 0 || index === chart.points.length - 1) && <text x={point.x} y={HEIGHT - 20} textAnchor="middle" fontSize="11" fontWeight="600" fill="#667069">{point.label}</text>}</g>)}
        </svg>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-black/[0.06] p-4">{data.map((item, index) => <button type="button" key={item.label} onClick={() => setSelectedIndex(index)} className={`min-w-28 shrink-0 rounded-xl border p-3 text-left ${selectedIndex === index ? 'border-[var(--color-primary)] bg-[#fff7f3]' : 'border-[var(--color-border)] bg-white'}`}><span className="block text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-muted)]">{item.label}</span><strong className="mt-1 block text-sm">{money(item.revenue)}</strong><span className="mt-1 block text-[10px] text-[var(--color-muted)]">{item.orders} {item.orders === 1 ? 'order' : 'orders'}</span></button>)}</div>
    </div>
  )
}
