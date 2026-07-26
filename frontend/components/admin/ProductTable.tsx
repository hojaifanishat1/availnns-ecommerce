"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Star,
  Flame,
  Zap,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

type Props = {
  products: any[];
  onDelete: (id: string) => void;
  onDealToggle?: (id: string, currentStatus: boolean) => void;
};

export default function ProductTable({
  products,
  onDelete,
  onDealToggle,
}: Props) {
  const { formatPrice } = useCurrency();

  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="p-5 text-left">Product</th>
              <th className="p-5 text-left">Category</th>
              <th className="p-5 text-left">Price</th>
              <th className="p-5 text-left">Stock</th>
              <th className="p-5 text-left">Status</th>
              <th className="p-5 text-left">Mark Deal</th>
              <th className="p-5 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-t hover:bg-zinc-50 transition"
              >
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-gray-100 flex-shrink-0">
                      <Image
                        src={
                          product.images?.[0]?.url ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {product.sku || "N/A"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-5 text-zinc-600">
                  {typeof product.category === "object"
                    ? product.category.name
                    : "N/A"}
                </td>

                <td className="p-5 font-bold text-zinc-900">
                  {formatPrice(
                    product.discountPrice || product.price
                  )}
                </td>

                <td className="p-5">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      product.stock > 5
                        ? "bg-green-100 text-green-700"
                        : product.stock > 0
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} left`
                      : "Out"}
                  </span>
                </td>

                <td className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {product.isFeatured && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-2.5 py-1 text-xs font-medium">
                        <Star size={12} />
                        Featured
                      </span>
                    )}

                    {product.isBestSeller && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 text-red-800 px-2.5 py-1 text-xs font-medium">
                        <Flame size={12} />
                        Best
                      </span>
                    )}

                    {product.isDeal && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-medium">
                        <Zap size={12} />
                        Deal
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700">
                    <input
                      type="checkbox"
                      checked={!!product.isDeal}
                      onChange={() =>
                        onDealToggle &&
                        onDealToggle(product._id, !!product.isDeal)
                      }
                      className="w-4 h-4 accent-black rounded cursor-pointer"
                    />
                    Deal
                  </label>
                </td>

                <td className="p-5">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/edit/${product._id}`}
                      className="rounded-xl bg-black p-2 text-white hover:bg-zinc-800 transition"
                    >
                      <Edit size={16} />
                    </Link>

                    <button
                      onClick={() => onDelete(product._id)}
                      className="rounded-xl bg-red-500 p-2 text-white hover:bg-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
