/**
 * Generates a unique Stock Keeping Unit (SKU) based on the product name.
 * Example: "Wireless Mouse" -> "WIRE-7K3X9A"
 * 
 * @param name - The product name
 * @param customPrefix - Optional custom prefix (e.g., category code)
 * @returns Formatted SKU string
 */
export default function generateSKU(name: string, customPrefix?: string): string {
  // যদি নাম না থাকে তবে ফলব্যাক হিসেবে জেনেরিক প্রিফিক্স ব্যবহার করা
  const cleanName = name ? name.trim() : "PRD";
  
  const prefix = (customPrefix || cleanName)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 4)
    .padEnd(4, "X"); // যদি নামের দৈর্ঘ্য ৪ অক্ষরের কম হয়, তবে 'X' দিয়ে পূরণ করবে

  // ইউনিক র‍্যান্ডম স্ট্রিং জেনারেট করা
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  // বর্তমান টাইমস্ট্যাম্পের একটি অংশ যোগ করে ইউনিকনেস আরও বাড়িয়ে দেওয়া (অপশনাল কিন্তু নিরাপদ)
  const timestampPart = Date.now().toString(36).slice(-2).toUpperCase();

  return `${prefix}-${randomPart}${timestampPart}`;
}
