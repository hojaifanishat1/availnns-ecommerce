export type StockStatusType = "in-stock" | "low-stock" | "out-of-stock";

export interface StockItem {
  stock: number;
}

/**
 * Calculates the available stock by subtracting reserved items from total stock.
 * Ensures the result never drops below 0.
 * 
 * @param stock - Total physical stock
 * @param reserved - Reserved or ordered stock (e.g., in active carts/orders)
 * @returns Available stock count
 */
export function calculateAvailableStock(stock: number, reserved: number = 0): number {
  return Math.max(0, stock - reserved);
}

/**
 * Determines the inventory status based on current stock and low stock threshold.
 * 
 * @param stock - Current available stock
 * @param threshold - Low stock warning limit
 * @returns Stock status string ('out-of-stock', 'low-stock', or 'in-stock')
 */
export function calculateStockStatus(stock: number, threshold: number = 5): StockStatusType {
  if (stock <= 0) {
    return "out-of-stock";
  }

  if (stock <= threshold) {
    return "low-stock";
  }

  return "in-stock";
}

/**
 * Calculates the total aggregate stock across all product variants.
 * 
 * @param variants - Array of product variants containing stock info
 * @returns Total combined stock number
 */
export function calculateTotalVariantStock(variants: StockItem[]): number {
  if (!variants || !Array.isArray(variants)) {
    return 0;
  }

  return variants.reduce((total, item) => {
    return total + (Number(item.stock) || 0);
  }, 0);
}
