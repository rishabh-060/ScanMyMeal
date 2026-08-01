'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  CreditCard,
  LockKeyhole,
  MapPin,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  UtensilsCrossed,
  WalletCards,
} from 'lucide-react'
import AddAddress from '@/Components/AddAddress'
import QrPopup from '@/Components/QrPopup'
import { Button, Card, EmptyState, StatusBadge } from '@/Components/ui'
import { useGlobalContext } from '@/provider/GlobalProvider'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import { setOrderStatus } from '@/public/store/orderStatusSlice'

const ORDER_TYPES = { delivery: 'DELIVERY', dineIn: 'DINE_IN', takeaway: 'TAKEAWAY' }
const ORDER_OPTIONS = [
  { value: 'delivery', label: 'Delivery', icon: Truck, note: 'To your address' },
  { value: 'dineIn', label: 'Dine in', icon: UtensilsCrossed, note: 'Scan your table' },
  { value: 'takeaway', label: 'Takeaway', icon: Store, note: 'Collect your order' },
]
const TEST_CARD = '4242 4242 4242 4242'

const finalUnitPrice = (product = {}) => {
  const price = Number(product.price || 0)
  const discount = Number(product.discount || 0)
  return discount > 0 ? Math.round(price - (price * discount) / 100) : price
}

const CheckoutPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const addresses = useSelector((state) => state.addresses.addressList)
  const tableId = useSelector((state) => state.addresses.tableId)
  const user = useSelector((state) => state.user)
  const { cartItem, totalCartPrice, fetchCartItem, fetchOrder } = useGlobalContext()
  const [mode, setMode] = useState('delivery')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [instructions, setInstructions] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [offerCode, setOfferCode] = useState('')
  const [openAddress, setOpenAddress] = useState(false)
  const [openQr, setOpenQr] = useState(false)
  const [loadingAction, setLoadingAction] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [copied, setCopied] = useState(false)
  const idempotencyKey = useRef(null)
  const activeAddresses = addresses.filter((address) => address.status)
  const isStripeTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')
  const itemCount = cartItem.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  useEffect(() => { if (!user.id) router.replace('/login') }, [router, user.id])
  useEffect(() => {
    if (!selectedAddress && activeAddresses[0]?._id) setSelectedAddress(activeAddresses[0]._id)
  }, [activeAddresses, selectedAddress])
  useEffect(() => {
    try {
      const context = JSON.parse(sessionStorage.getItem('tableContext') || '{}')
      if (context.publicId === tableId) setTableNumber(context.tableNumber || '')
    } catch (_error) { setTableNumber('') }
  }, [tableId])

  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  const copyTestCard = async () => {
    try {
      await navigator.clipboard.writeText(TEST_CARD.replaceAll(' ', ''))
      setCopied(true)
      toast.success('Test card copied')
      window.setTimeout(() => setCopied(false), 1800)
    } catch (_error) {
      toast.info(`Use test card ${TEST_CARD}`)
    }
  }

  const payload = () => ({
    orderType: ORDER_TYPES[mode],
    addressId: mode === 'delivery' ? selectedAddress : undefined,
    tableId: mode === 'dineIn' ? tableId : undefined,
    pickupTime: mode === 'takeaway' && pickupTime ? new Date(pickupTime).toISOString() : undefined,
    pickupInstructions: mode === 'takeaway' ? instructions : undefined,
    customerInstructions: mode !== 'takeaway' ? instructions : undefined,
    offerCode: offerCode.trim().toUpperCase() || undefined,
  })

  const validate = () => {
    if (!cartItem.length) return 'Your cart is empty'
    if (mode === 'delivery' && !selectedAddress) return 'Select a delivery address'
    if (mode === 'dineIn' && !tableId) return 'Scan a valid table QR code'
    return ''
  }

  const submit = async (kind) => {
    const validationError = validate()
    if (validationError) return toast.error(validationError)
    idempotencyKey.current ||= crypto.randomUUID()
    setLoadingAction(kind)
    try {
      const endpoint = kind === 'online' ? summaryApi.paymentUrl : summaryApi.CodOrder
      const response = await Axios({
        ...endpoint,
        headers: { 'Idempotency-Key': idempotencyKey.current },
        data: payload(),
      })
      if (kind === 'online') {
        const checkoutUrl = response.data.data?.checkoutUrl || response.data.url
        if (!checkoutUrl) throw new Error('Payment provider did not return a checkout URL')
        window.location.assign(checkoutUrl)
        return
      }
      await Promise.all([fetchCartItem?.(), fetchOrder?.()])
      dispatch(setOrderStatus('Order'))
      router.push(`/success?orderId=${encodeURIComponent(response.data.data.publicOrderId)}`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Checkout failed')
      idempotencyKey.current = null
    } finally {
      setLoadingAction('')
    }
  }

  return (
    <main className="page-container py-5 sm:py-8 lg:py-10">
      <button type="button" onClick={goBack} className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-bold text-[var(--color-text)] shadow-sm hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]" aria-label="Go back from checkout">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary)]">Almost there</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Complete your order</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">Choose how you want your meal, confirm the details, and pay securely.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/15"><LockKeyhole size={15} /> Secure checkout</div>
      </div>

      <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="border-b border-black/[0.06] p-5 sm:p-7">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-[var(--color-primary)]"><ShoppingBag size={20} /></span><div><h2 className="text-lg font-black">How would you like your order?</h2><p className="text-sm text-[var(--color-muted)]">You can change this before paying.</p></div></div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Order type">
                {ORDER_OPTIONS.map(({ value, label, note, icon: Icon }) => (
                  <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={`min-h-24 rounded-2xl border p-3 text-left ${mode === value ? 'border-[var(--color-primary)] bg-[#fff6f1] shadow-[0_8px_24px_rgb(234_91_53_/_0.1)]' : 'border-[var(--color-border)] bg-white hover:border-neutral-400'}`}>
                    <div className="flex items-center justify-between"><Icon size={20} className={mode === value ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'} />{mode === value && <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--color-primary)] text-white"><Check size={13} /></span>}</div>
                    <strong className="mt-3 block text-sm">{label}</strong><span className="mt-0.5 block text-xs text-[var(--color-muted)]">{note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {mode === 'delivery' && (
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Delivery address</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Where should we bring your meal?</p></div><Button variant="outline" onClick={() => setOpenAddress(true)}>Add address</Button></div>
                  {activeAddresses.length === 0
                    ? <EmptyState title="No delivery address" description="Add an address to continue with delivery." action={<Button onClick={() => setOpenAddress(true)}>Add your first address</Button>} />
                    : <div className="grid gap-3 sm:grid-cols-2">{activeAddresses.map((address) => (
                      <label key={address._id} className={`relative flex cursor-pointer gap-3 rounded-2xl border p-4 ${selectedAddress === address._id ? 'border-[var(--color-primary)] bg-[#fff8f4] ring-2 ring-orange-100' : 'border-[var(--color-border)] hover:border-neutral-400'}`}>
                        <input type="radio" name="address" className="mt-1 accent-[var(--color-primary)]" checked={selectedAddress === address._id} onChange={() => setSelectedAddress(address._id)} />
                        <span className="min-w-0 text-sm leading-6 text-[var(--color-muted)]"><strong className="flex items-start gap-2 text-[var(--color-text)]"><MapPin size={16} className="mt-1 shrink-0 text-[var(--color-primary)]" />{address.address_line}</strong><span className="ml-6 block">{address.city}, {address.state} {address.pincode}</span><span className="ml-6 block">{address.mobile}</span></span>
                      </label>
                    ))}</div>}
                </section>
              )}

              {mode === 'dineIn' && (
                <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-center sm:p-7">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-amber-700 shadow-sm"><ScanLine size={24} /></span><h2 className="mt-4 font-black">Your table</h2><div className="mt-2">{tableId ? <StatusBadge value="TABLE SELECTED" /> : <StatusBadge value="NOT SELECTED" />}</div><p className="mx-auto my-4 max-w-md break-all text-sm leading-6 text-amber-900/70">{tableId ? `Table ${tableNumber || tableId} is linked to this order.` : 'Scan the QR displayed on your table so the team knows where to serve you.'}</p><Button onClick={() => setOpenQr(true)}>{tableId ? 'Scan another table' : 'Scan table QR'}</Button>
                </section>
              )}

              {mode === 'takeaway' && (
                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)]/55 p-5">
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[var(--color-secondary)] shadow-sm"><Clock3 size={20} /></span><div className="w-full"><label className="grid gap-2 text-sm font-bold" htmlFor="pickup-time">Preferred pickup time<input id="pickup-time" type="datetime-local" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} className="min-h-12 rounded-xl border border-[var(--color-border)] bg-white px-3 font-normal outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-orange-100" /></label><p className="mt-2 text-xs text-[var(--color-muted)]">Leave it blank and we’ll prepare it for the earliest available collection.</p></div></div>
                </section>
              )}

              <label className="mt-6 grid gap-2 text-sm font-bold" htmlFor="order-instructions">
                {mode === 'takeaway' ? 'Pickup instructions' : 'Order instructions'}
                <textarea id="order-instructions" maxLength={500} value={instructions} onChange={(event) => setInstructions(event.target.value)} className="min-h-28 resize-y rounded-xl border border-[var(--color-border)] bg-white p-3 font-normal leading-6 outline-none placeholder:text-neutral-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-orange-100" placeholder="Allergies, preparation notes, or helpful directions" />
                <span className="text-right text-xs font-normal text-[var(--color-muted)]">{instructions.length}/500</span>
              </label>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck size={20} /></span><div><h2 className="font-black">Payment protection</h2><p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">Online card details and bank verification are handled securely by Stripe. Scan My Meal never stores your full card number or banking OTP.</p></div></div>
          </Card>
        </div>

        <Card className="h-fit overflow-hidden lg:sticky lg:top-24">
          <div className="border-b border-black/[0.06] p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary)]">Your basket</p><h2 className="mt-1 text-xl font-black">Order summary</h2></div><span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 text-xs font-bold">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></div></div>
          <div className="max-h-72 space-y-4 overflow-y-auto p-5 sm:p-6">
            {cartItem.map((item) => {
              const image = item.product?.image?.[0]
              return <div key={item._id} className="flex gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-soft)]">{image ? <Image src={image} alt="" fill sizes="56px" className="object-cover" /> : <span className="grid h-full place-items-center text-[var(--color-muted)]"><UtensilsCrossed size={19} /></span>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.product.name}</p><p className="mt-1 text-xs text-[var(--color-muted)]">Quantity {item.quantity}</p></div><span className="text-sm font-black">₹{finalUnitPrice(item.product) * item.quantity}</span></div>
            })}
          </div>
          <div className="border-t border-black/[0.06] bg-[var(--color-surface-soft)]/35 p-5 sm:p-6">
            <label className="grid gap-2 text-sm font-bold" htmlFor="offer-code"><span className="flex items-center gap-2"><Tag size={16} className="text-[var(--color-primary)]" /> Offer code</span><input id="offer-code" value={offerCode} onChange={(event) => setOfferCode(event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} placeholder="Enter promo code" className="min-h-11 rounded-xl border border-[var(--color-border)] bg-white px-3 font-mono uppercase outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-orange-100" /><span className="text-xs font-normal leading-5 text-[var(--color-muted)]">Eligibility and the final total are confirmed securely before the order is placed.</span></label>
            <div className="my-5 border-t border-dashed border-[var(--color-border)]" />
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-[var(--color-muted)]">Estimated item total</p><p className="mt-1 text-xs text-[var(--color-muted)]">Taxes and applicable charges follow</p></div><span className="text-2xl font-black tracking-tight">₹{totalCartPrice}</span></div>

            {isStripeTestMode && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
                <div className="flex items-start gap-3"><WalletCards size={20} className="mt-0.5 shrink-0 text-blue-700" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">Test payment — no SMS needed</strong><span className="rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">Sandbox</span></div><p className="mt-1 text-xs leading-5 text-blue-900/70">On Stripe Checkout, use this simulated card with any future expiry and any 3-digit CVC. No real charge or bank OTP is sent.</p><button type="button" onClick={copyTestCard} className="mt-3 inline-flex min-h-9 w-full items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white px-3 font-mono text-xs font-bold text-blue-900 hover:border-blue-400"><span>{TEST_CARD}</span><span className="flex items-center gap-1 font-sans">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</span></button></div></div>
              </div>
            )}

            <div className="mt-5 grid gap-3">
              <Button size="lg" loading={loadingAction === 'online'} disabled={Boolean(loadingAction)} onClick={() => submit('online')}><CreditCard size={18} /> Pay online</Button>
              <Button size="lg" variant="outline" loading={loadingAction === 'cash'} disabled={Boolean(loadingAction)} onClick={() => submit('cash')}>{mode === 'dineIn' ? 'Pay at restaurant' : 'Cash on delivery/pickup'}</Button>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] leading-5 text-[var(--color-muted)]"><ShieldCheck size={14} /> Secure, encrypted checkout</p>
          </div>
        </Card>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
      {openQr && <QrPopup onClose={() => setOpenQr(false)} />}
    </main>
  )
}

export default CheckoutPage
