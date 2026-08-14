"use client";

import Image from "next/image";

interface OrderItemsReviewProps {
  items: any[];
}

export default function OrderItemsReview({
  items,
}: OrderItemsReviewProps) {
  return (
    <div
      className="
rounded-3xl
border
bg-white
p-6
shadow-sm
"
    >
      <h2
        className="
mb-6
text-xl
font-black
"
      >
        Your Items
      </h2>

      <div
        className="
space-y-4
"
      >
        {items.map((item: any) => {
          // Proper priority calculation for unit price
          const unitPrice = Number(
            item?.product?.variant?.discountPrice ||
            item?.variant?.discountPrice ||
            item?.product?.discountPrice ||
            item?.product?.variant?.price ||
            item?.variant?.price ||
            item?.product?.price ||
            item?.price ||
            0
          );

          const quantity = Number(item?.quantity || 0);
          const totalPrice = unitPrice * quantity;

          return (
            <div
              key={item._id || item.id || Math.random()}
              className="
flex
items-center
gap-4
rounded-2xl
border
p-4
"
            >
              {/* IMAGE */}
              <div
                className="
relative
h-20
w-20
overflow-hidden
rounded-xl
bg-zinc-100
"
              >
                <Image
                  src={
                    item.product?.images?.[0] ||
                    item.product?.image ||
                    "/placeholder.png"
                  }
                  alt={
                    item.product?.name ||
                    item.name ||
                    "product"
                  }
                  fill
                  className="
object-cover
"
                />
              </div>

              {/* DETAILS */}
              <div
                className="
flex-1
"
              >
                <h3
                  className="
font-bold
"
                >
                  {item.product?.name || item.name}
                </h3>

                <div
                  className="
mt-1
text-sm
text-zinc-500
"
                >
                  Qty: {quantity}
                </div>
              </div>

              {/* PRICE */}
              <div
                className="
text-right
"
              >
                <p
                  className="
font-bold
"
                >
                  ৳{totalPrice}
                </p>

                <p
                  className="
text-xs
text-zinc-500
"
                >
                  @ ৳{unitPrice}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
