import api from "./api";
import { ProductValidatorType } from "@/validators/productValidator";

// ড্রাফট రিসপন্স ইন্টারফেস (প্রয়োজন অনুযায়ী আপনার ব্যাকএন্ড স্ট্রাকচারের সাথে মিলিয়ে নিতে পারেন)
export interface ProductDraftResponse {
  success: boolean;
  message?: string;
  data: ProductValidatorType & { _id?: string; createdAt?: string; updatedAt?: string };
}

/**
 * Saves a new product draft to the backend.
 * 
 * @param data - The product form data matching ProductValidatorType
 * @returns The saved draft response data
 */
export async function saveProductDraft(data: Partial<ProductValidatorType>): Promise<ProductDraftResponse> {
  const res = await api.post<ProductDraftResponse>("/products/draft", data);
  return res.data;
}

/**
 * Fetches an existing product draft by its ID.
 * 
 * @param id - The draft product ID
 * @returns The product draft data
 */
export async function getProductDraft(id: string): Promise<ProductDraftResponse> {
  const res = await api.get<ProductDraftResponse>(`/products/draft/${id}`);
  return res.data;
}

/**
 * Updates an existing product draft.
 * 
 * @param id - The draft product ID
 * @param data - Partial or full product data to update
 * @returns The updated draft response data
 */
export async function updateProductDraft(
  id: string,
  data: Partial<ProductValidatorType>
): Promise<ProductDraftResponse> {
  const res = await api.put<ProductDraftResponse>(`/products/draft/${id}`, data);
  return res.data;
}

/**
 * Deletes a product draft by its ID.
 * 
 * @param id - The draft product ID
 * @returns Deletion confirmation response
 */
export async function deleteProductDraft(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete(`/products/draft/${id}`);
  return res.data;
}
