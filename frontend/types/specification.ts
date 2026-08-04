export interface ProductSpecification {
  key: string;            // যেমন: "Processor", "Battery Capacity"
  value: string;          // যেমন: "Apple M3 Pro", "5000 mAh"
  group?: string;         // স্পেসিফিকেশনের গ্রুপ বা সেকশন (যেমন: "Performance", "Display")
  displayOrder?: number;  // UI-তে দেখানোর সিরিয়াল বা অর্ডার
}
