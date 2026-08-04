import { ProductValidatorType } from "@/validators/productValidator";

const KEY = "availnns_product_draft";

/**
 * Saves the product draft data securely into the browser's localStorage.
 * 
 * @param data - The product form data matching ProductValidatorType
 */
export function saveDraft(data: Partial<ProductValidatorType>): void {
  if (typeof window === "undefined") return;

  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(KEY, serializedData);
  } catch (error) {
    console.error("Failed to save product draft to localStorage:", error);
  }
}

/**
 * Retrieves the saved product draft from localStorage.
 * 
 * @returns Parsed product draft object or null if not found
 */
export function getDraft(): Partial<ProductValidatorType> | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(KEY);
    return data ? (JSON.parse(data) as Partial<ProductValidatorType>) : null;
  } catch (error) {
    console.error("Failed to parse product draft from localStorage:", error);
    return null;
  }
}

/**
 * Removes the product draft from localStorage.
 */
export function removeDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(KEY);
  } catch (error) {
    console.error("Failed to remove product draft from localStorage:", error);
  }
}
