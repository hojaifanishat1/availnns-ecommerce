export const addDiscountPercentage = (product: any) => {
  const obj = product.toObject ? product.toObject() : product;

  // ✅ Check if discountPrice exists, is greater than 0, and less than regular price
  const hasValidDiscount =
    obj.discountPrice &&
    obj.discountPrice > 0 &&
    obj.discountPrice < obj.price;

  const discountPercentage =
    obj.price > 0 && hasValidDiscount
      ? Math.round(
          ((obj.price - obj.discountPrice) / obj.price) * 100
        )
      : 0;

  return {
    ...obj,
    discountPercentage,
  };
};

export const addDiscountPercentageToProducts = (
  products: any[]
) => {
  return products.map(addDiscountPercentage);
};
