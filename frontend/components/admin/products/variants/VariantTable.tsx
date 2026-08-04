"use client";

import VariantRow
from "./VariantRow";
import { DefaultVariant } from "@/constants/variants";

interface Props {
  variants: DefaultVariant[];
  onChange: (
    index: number,
    key: string,
    value: unknown
  ) => void;
  onDelete: (index: number) => void;
}

export default function VariantTable({
  variants,
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
              onChange={onChange}
              onDelete={onDelete}
            />
          )
        )
      }
    </div>
  );
}
