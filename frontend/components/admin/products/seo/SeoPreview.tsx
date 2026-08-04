interface Props {
  title?: string;
  description?: string;
  slug?: string;
}

export default function SeoPreview({
  title,
  description,
  slug
}: Props) {
  return (
    <div
      className="
        border
        rounded-xl
        p-5
        space-y-4
        bg-white
        shadow-sm
      "
    >
      <h3
        className="
          font-semibold
          text-lg
          text-gray-900
        "
      >
        Search Engine Preview
      </h3>

      <div
        className="
          border
          border-gray-200
          rounded-xl
          p-4
          bg-gray-50/50
          space-y-1.5
        "
      >
        <p
          className="
            text-blue-600
            text-lg
            font-medium
            hover:underline
            cursor-pointer
            line-clamp-1
          "
        >
          {
            title ||
            "Product Title"
          }
        </p>

        <p
          className="
            text-green-700
            text-xs
            font-mono
            line-clamp-1
          "
        >
          availnns.com/products/
          {
            slug ||
            "product-slug"
          }
        </p>

        <p
          className="
            text-gray-600
            text-sm
            line-clamp-2
          "
        >
          {
            description ||
            "Product description will appear here as a snippet for search engine result pages..."
          }
        </p>
      </div>
    </div>
  );
}
