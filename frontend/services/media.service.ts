import api from "./api";
import { MediaValidatorType } from "@/validators/mediaValidator";

export interface UploadResponse {
  success: boolean;
  url: string;
  public_id?: string;
  message?: string;
}

/**
 * Uploads a product image file to the server using multipart/form-data.
 * 
 * @param file - The image File object to upload
 * @returns Promise resolving to UploadResponse containing the image URL
 */
export async function uploadProductImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<UploadResponse>("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    success: response.data?.success ?? true,
    url: response.data?.url || response.data?.message || "",
    public_id: response.data?.public_id,
    message: response.data?.message,
  };
}

/**
 * Updates existing media details by its ID.
 * 
 * @param id - The media record ID
 * @param data - Partial media data matching MediaValidatorType
 * @returns The updated media response
 */
export async function updateMedia(
  id: string,
  data: Partial<MediaValidatorType>
): Promise<{ success: boolean; data: MediaValidatorType }> {
  const response = await api.put(`/media/${id}`, data);
  return response.data;
}

/**
 * Deletes a media file or record by its ID.
 * 
 * @param id - The media record ID
 * @returns Deletion confirmation response
 */
export async function deleteMedia(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/media/${id}`);
  return response.data;
}
