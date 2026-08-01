const roundCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100

const discountedUnitPrice = (price, discount = 0) => {
  const numericPrice = Number(price)
  const numericDiscount = Number(discount || 0)
  if (!Number.isFinite(numericPrice) || numericPrice < 0) throw new TypeError('Invalid product price')
  if (!Number.isFinite(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
    throw new TypeError('Invalid product discount')
  }
  return roundCurrency(numericPrice * (1 - numericDiscount / 100))
}

const calculatePricing = (items, options = {}) => {
  const taxRate = Number(options.taxRate ?? 5)
  const serviceCharge = roundCurrency(options.serviceCharge || 0)
  const deliveryCharge = roundCurrency(options.deliveryCharge || 0)

  let subtotal = 0
  let discountedSubtotal = 0
  const pricedItems = items.map(({ product, quantity, ...configuration }) => {
    const originalUnitPrice = roundCurrency(product.price)
    const unitPrice = discountedUnitPrice(product.price, product.discount)
    const originalSubtotal = roundCurrency(originalUnitPrice * quantity)
    const itemSubtotal = roundCurrency(unitPrice * quantity)
    subtotal = roundCurrency(subtotal + originalSubtotal)
    discountedSubtotal = roundCurrency(discountedSubtotal + itemSubtotal)

    return {
      product: product._id,
      nameSnapshot: product.name,
      imageSnapshot: product.image || [],
      priceSnapshot: originalUnitPrice,
      discountSnapshot: Number(product.discount || 0),
      quantity,
      selectedVariant: configuration.selectedVariant || null,
      addOns: configuration.addOns || [],
      itemInstructions: configuration.itemInstructions || '',
      subtotal: itemSubtotal,
    }
  })

  const discount = roundCurrency(subtotal - discountedSubtotal)
  const tax = roundCurrency(discountedSubtotal * (taxRate / 100))
  const grandTotal = roundCurrency(discountedSubtotal + tax + serviceCharge + deliveryCharge)

  return {
    items: pricedItems,
    pricing: { subtotal, discount, tax, serviceCharge, deliveryCharge, grandTotal },
  }
}

module.exports = { roundCurrency, discountedUnitPrice, calculatePricing }
