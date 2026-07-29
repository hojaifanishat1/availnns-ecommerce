"use client";

import { useState } from "react";
import {
  Heart,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductGallery({
  product,
}: {
  product: Product;
}) {
  const images = product.images?.length
    ? product.images
    : [
        {
          url: "/placeholder.png",
          public_id: "default",
        },
      ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wish = isInWishlist(product._id);

  const nextImage = () => {
    if (selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  // Mouse move handler for advanced image zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* MAIN IMAGE CONTAINER */}
      <div
        className="group relative h-[450px] sm:h-[550px] w-full overflow-hidden rounded-3xl bg-zinc-100 border border-zinc-200 shadow-sm cursor-crosshair"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[selectedIndex]?.url}
          alt={product.name || "Product image"}
          className="h-full w-full object-cover transition-transform duration-200 ease-out"
          style={
            zoom
              ? {
                  transform: "scale(2)",
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }
              : { transform: "scale(1)" }
          }
        />

        {/* WISHLIST BUTTON */}
        <button
          onClick={() => {
            if (wish) {
              removeFromWishlist(product._id);
            } else {
              addToWishlist({
                _id: product._id,
                name: product.name,
                price: product.discountPrice || product.price,
                image: images[0].url,
              });
            }
          }}
          className="absolute right-5 top-5 rounded-full bg-white/90 backdrop-blur-md p-3 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer border border-zinc-100"
          aria-label="Wishlist"
        >
          <Heart
            size={22}
            className={
              wish
                ? "fill-red-500 text-red-500"
                : "text-zinc-700 hover:text-black"
            }
          />
        </button>

        {/* IMAGE COUNT BADGE */}
        <div className="absolute bottom-5 left-5 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white tracking-wider">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* PREVIOUS BUTTON */}
        {selectedIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-md p-2.5 shadow-md transition-all hover:bg-white hover:scale-105 cursor-pointer text-zinc-800"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* NEXT BUTTON */}
        {selectedIndex < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-md p-2.5 shadow-md transition-all hover:bg-white hover:scale-105 cursor-pointer text-zinc-800"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* ZOOM ICON HINT */}
        <div className="absolute bottom-5 right-5 rounded-full bg-white/90 backdrop-blur-md p-2.5 shadow-md text-zinc-700 pointer-events-none hidden sm:flex items-center gap-1.5 text-xs font-medium px-3">
          <ZoomIn size={16} />
          <span>Hover to zoom</span>
        </div>
      </div>

      {/* THUMBNAILS */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={img.public_id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                selectedIndex === index
                  ? "border-black shadow-md scale-102 ring-2 ring-black/10"
                  : "border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
