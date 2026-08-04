export interface ProductImage {
  url: string;
  isPrimary?: boolean;
}

export function getPrimaryImage(
  images: ProductImage[]
): string {
  if (!images || images.length === 0)
    return "";

  const primary =
    images.find(
      img => img?.isPrimary
    );

  return primary?.url || images[0]?.url || "";
}

export function getDiscountPercentage(
  price: number,
  discountPrice: number
): number {
  if (!price || !discountPrice || discountPrice >= price)
    return 0;

  return Math.round(
    (
      price -
      discountPrice
    )
    /
    price *
    100
  );
}

export function generateProductTitle(
  brand: string | undefined,
  name: string
): string {
  if (!brand || !brand.trim())
    return name;

  return `${brand.trim()} ${name}`;
}
