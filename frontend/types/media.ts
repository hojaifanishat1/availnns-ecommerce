export type MediaType = 'image' | 'video';

export interface ProductMedia {
  _id?: string;
  url: string;
  publicId?: string; // Cloudinary বা অন্যান্য ক্লাউড স্টোরেজের পাবলিক আইডি
  alt?: string;      // এসইও এবং অ্যাক্সেসিবিলিটির জন্য অল্টারনেটিভ টেক্সট
  mediaType?: MediaType; // মিডিয়ার ধরন (ছবি নাকি ভিডিও)
  isPrimary: boolean;    // থাম্বনেইল বা প্রধান ছবি কি না
  order: number;         // ডিসপ্লে বা সর্টিং অর্ডার
  size?: number;         // বাইটে ফাইলের সাইজ (অপশনাল)
  createdAt?: string | Date;
}
