"use client";

import VariantRow from "./VariantRow";
import { DefaultVariant } from "@/constants/variants";

interface Props {
  variants: DefaultVariant[];
  attributeLabel?: string; // এটি যোগ করা হয়েছে
  onChange: (
    index: number,
    key: string,
    value: unknown
  ) => void;
  onDelete: (index: number) => void;
}

export default function VariantTable({
  variants,
  attributeLabel = "Size", // ডিফল্ট ভ্যালু
  onChange,
  onDelete
}: Props) {
  if (!variants || variants.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-xl bg-gray-50 text-gray-500 text-sm">
        No variants added yet. Click &quot;Add Variant&quot; to create product combinations.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {
        variants.map(
          (variant, index) => (
            <VariantRow
              key={index}
              variant={variant}
              index={index}
              attributeLabel={attributeLabel} // এখানে attributeLabel পাস করা হলো
              onChange={onChange}
              onDelete={onDelete}
            />
          )
        )
      }
    </div>
  );
}
