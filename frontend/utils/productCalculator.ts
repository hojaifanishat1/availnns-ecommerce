/**
 * Calculates the discount percentage between regular price and discounted price.
 * 
 * @param price - Regular price
 * @param discountPrice - Discounted / Sale price
 * @returns Rounded discount percentage
 */
export function calculateDiscount(price: number, discountPrice?: number): number {
  if (!price || !discountPrice || discountPrice >= price) {
    return 0;
  }

  const discount = ((price - discountPrice) / price) * 100;
  return Math.round(discount);
}

/**
 * Calculates the tax amount based on price and tax rate.
 * 
 * @param price - Product price
 * @param taxRate - Tax percentage (default: 5% as per regional standards like VAT)
 * @returns Calculated tax amount
 */
export function calculateTax(price: number, taxRate: number = 5): number {
  if (!price || price <= 0) return 0;
  
  const tax = (price * taxRate) / 100;
  // দশমিকের পর দুই ঘর পর্যন্ত ফিক্সড করে নাম্বারে কনভার্ট করা
  return Number(tax.toFixed(2));
}

/**
 * Determines the final payable price considering any available valid discount price.
 * 
  * @param price - Regular price
  * @param discountPrice - Optional sale price
  * @returns Final price to charge
 */
export function calculateFinalPrice(price: number, discountPrice?: number): number {
  if (!price) return 0;

  return discountPrice && discountPrice > 0 && discountPrice < price
    ? discountPrice
    : price;
}
