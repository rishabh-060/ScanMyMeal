'use client'

import { ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useGlobalContext } from '@/provider/GlobalProvider'
import useChangePath from '@/hooks/changePath'
import AddToCartButton from './AddToCartButton'
import { Button, EmptyState } from './ui'

const DisplayCartProduct = ({ close }) => {
  const { cartItem, deleteCartItem, totalCartPrice, nonDiscPrice } = useGlobalContext()
  const user = useSelector((state) => state.user)
  const changePath = useChangePath();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => event.key === 'Escape' && close?.()
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close]);

  const checkout = () => {
    if (!user?.id) {
      changePath('/login')
      return toast.info('Sign in to continue to checkout')
    }
    close?.();
    changePath('/place-order')
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <section className="fixed inset-0 z-[100] bg-[#111914]/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Shopping cart" onMouseDown={(event) => event.target === event.currentTarget && close?.()}>
      <div className="ml-auto flex h-dvh w-full max-w-[30rem] animate-fade-up flex-col overflow-hidden bg-white shadow-[var(--shadow-float)]">
        <header className="flex items-center justify-between border-b border-black/[0.06] p-5 sm:p-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--color-primary)]">Your selection</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black"><ShoppingBag size={22} /> Cart</h1>
          </div>

          <button onClick={close} className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-muted)] hover:text-[var(--color-text)]" aria-label="Close cart">
            <X size={20} />
          </button>
        </header>

        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-[#fafaf8] p-4 sm:p-6">
          {
            cartItem.length ? 
              cartItem.map((item) => {
                const image = Array.isArray(item.product.image) ? item.product.image[0] : item.product.image;
                return (
                  <article key={item._id} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm">
                    <img src={image} alt="" className="block aspect-square h-20 max-h-20 w-20 max-w-20 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 font-black leading-5">{item.product.name}</h2>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">₹{item.product.price} · {item.product.unit}</p>
                        </div>
                        <button onClick={() => deleteCartItem(item._id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--color-error)] hover:bg-red-50" aria-label={`Remove ${item.product.name}`}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="mt-3 flex justify-start">
                        <AddToCartButton data={item.product} />
                      </div>
                    </div>
                  </article>
                )
              })
            : <EmptyState title="Your cart is empty" description="Add something delicious from the menu to get started." />
          }
        </div>
        
        {
          cartItem.length > 0 && 
            <footer className="border-t border-black/[0.06] bg-[#fafaf8] p-5 sm:p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Menu total</span><span>₹{nonDiscPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Savings</span><span>−₹{Math.max(0, nonDiscPrice - totalCartPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-[var(--color-border)] pt-3 text-lg font-black">
                  <span>Estimated total</span><span>₹{totalCartPrice}</span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">Taxes and fulfilment charges are confirmed securely at checkout.</p>
              <Button size="lg" className="mt-5 w-full" onClick={checkout}>Continue to checkout</Button>
            </footer>
        }
      </div>
    </section>,
    document.body,
  )
}

export default DisplayCartProduct
