export const DiscountedPrice = (price, discount=0) => {
    const priceNum = Number(price);
    const discountNum = Number(discount);

    if (isNaN(priceNum) || isNaN(discountNum)) return 0;

    const discountedAmt = (priceNum * discountNum) / 100;
    const actualPrice = priceNum - discountedAmt;

    return Math.ceil(actualPrice);
}