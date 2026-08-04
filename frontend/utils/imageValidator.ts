export interface ImageValidationResult {
  valid: boolean;
  message: string;
}

/**
 * Validates an image file based on allowed types and maximum size limit.
 * 
 * @param file - The image file to validate
 * @param maxSizeBytes - Optional max size in bytes (default: 5MB)
 * @returns Validation result containing validity status and message
 */
export function validateImage(
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024 // ডিফল্ট ৫ মেগাবাইট
): ImageValidationResult {
  if (!file) {
    return {
      valid: false,
      message: "No file provided",
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // ফাইল টাইপ ভ্যালিডেশন
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Only JPG, PNG and WEBP image formats are allowed.",
    };
  }

  // ফাইল সাইজ ভ্যালিডেশন
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      message: `Image size must be under ${maxSizeMB}MB.`,
    };
  }

  return {
    valid: true,
    message: "Valid image",
  };
}
