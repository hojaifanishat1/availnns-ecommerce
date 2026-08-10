"use client";

interface VariantTableHeaderProps {
  attributeLabel?: string;
}

export default function VariantTableHeader({ attributeLabel = "Size" }: VariantTableHeaderProps) {
  const getHeaderTitle = () => {
    if (attributeLabel.includes("RAM")) return "RAM & Storage";
    if (attributeLabel.includes("Dial")) return "Dial / Strap";
    if (attributeLabel.includes("Specification")) return "Specification";
    return "Size";
  };

  const headers = [
    "SKU",
    getHeaderTitle(),
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
