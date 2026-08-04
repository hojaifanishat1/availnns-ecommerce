"use client";

export default function VariantTableHeader() {
  const headers = [
    "SKU",
    "Size",
    "Color",
    "Stock",
    "Price",
    "Action"
  ];

  return (
    <div
      className="
        grid
        grid-cols-6
        gap-3
        border-b
        pb-3
        px-2
        font-semibold
        text-xs
        uppercase
        tracking-wider
        text-gray-500
      "
    >
      {
        headers.map(
          (header, index) => (
            <div
              key={index}
              className={header === "Action" ? "text-center" : ""}
            >
              {header}
            </div>
          )
        )
      }
    </div>
  );
}
