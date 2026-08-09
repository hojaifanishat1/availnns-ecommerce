/**
 * Generates a professional SKU based on Category, Brand, and optional Variants.
 * Format: [CATEGORY]-[BRAND]-[RANDOM] (with optional variants if provided)
 */
export default function generateSKU(
  customPrefix?: string,
  brand?: string,
  color?: string,
  size?: string
): string {
  // ১. ক্যাটাগরি প্রিফিক্স
  let prefix = "PROD";
  if (customPrefix && customPrefix.trim() !== "") {
    prefix = customPrefix.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4);
  }

  // ২. ব্র্যান্ড কোড
  let brandPart = "";
  if (brand && brand.trim() !== "") {
    brandPart = "-" + brand.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4);
  }

  // ৩. কালার ও সাইজ (যদি ৪ নম্বর স্টেপ থেকে পাস করা হয়)
  let variantPart = "";
  if (color && color.trim() !== "") {
    variantPart += "-" + color.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 3);
  }
  if (size && size.trim() !== "") {
    variantPart += "-" + size.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 3);
  }

  // ৪. ইউনিক র্যান্ডম অংশ
  const randomBuffer = new Uint8Array(2);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(randomBuffer);
  } else {
    globalThis.crypto?.getRandomValues(randomBuffer) || 
      randomBuffer.forEach((_, i) => randomBuffer[i] = Math.floor(Math.random() * 256));
  }

  const randomPart = Array.from(randomBuffer)
    .map((b) => b.toString(36))
    .join("")
    .toUpperCase()
    .substring(0, 4);

  // ফাইনাল SKU (যেমন: FASH-NOPT-8K2P)
  return `${prefix}${brandPart}${variantPart}-${randomPart}`;
}
