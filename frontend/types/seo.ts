export interface ProductSeo {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  canonicalUrl?: string;     // ডুপ্লিকেট কন্টেন্ট এড়াতে ক্যানোনিকাল লিংক
  ogTitle?: string;          // ফেসবুক/সোশ্যাল মিডিয়া শেয়ারের সময় টাইটেল
  ogDescription?: string;    // সোশ্যাল মিডিয়া শেয়ারের সময় ডেসক্রিপশন
  ogImage?: string;          // সোশ্যাল মিডিয়া শেয়ারের থাম্বনেইল ইমেজ
  noIndex?: boolean;         // সার্চ ইঞ্জিন থেকে পেজটি লুকিয়ে রাখতে চাইলে (যেমন: ড্রাফট বা টেস্ট প্রোডাক্ট)
}
