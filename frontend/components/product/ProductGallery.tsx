"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductGallery({
  product,
}: {
  product: Product;
}) {
  const p = product as any;

  const images = p.images?.length
    ? p.images
    : [
        {
          url: "/placeholder.png",
          public_id: "default",
        },
      ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Touch Swipe States for Mobile & iPad
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wish = isInWishlist(p._id);

  // অটো-স্লাইড ইফেক্ট
  useEffect(() => {
    if (!isAutoPlay || images.length <= 1 || isLightboxOpen) return;

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlay, images.length, isLightboxOpen]);

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  // Touch Handlers for Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <div className="space-y-4">
      {/* MAIN FRAME */}
      <div
        className="group relative h-[480px] sm:h-[580px] w-full overflow-hidden rounded-[2.5rem] bg-zinc-100/90 border border-zinc-200/80 shadow-xl shadow-zinc-900/5 cursor-crosshair select-none"
        onMouseEnter={() => {
          setZoom(true);
          setIsAutoPlay(false);
        }}
        onMouseLeave={() => {
          setZoom(false);
          setIsAutoPlay(true);
        }}
        onMouseMove={handleMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          setIsLightboxOpen(true);
          setIsAutoPlay(false);
        }}
      >
        {/* ULTRA-SMOOTH PROFESSIONAL SLIDING TRACK */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: `translateX(-${selectedIndex * 100}%)`,
          }}
        >
          {images.map((img: any, index: number) => (
            <div
              key={img.public_id || index}
              className="h-full w-full shrink-0 grow-0 relative overflow-hidden"
            >
              <img
                src={img.url}
                alt={p.name || `Product view ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 ease-out"
                style={
                  zoom && selectedIndex === index
                    ? {
                        transform: "scale(2.2)",
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }
                    : { transform: "scale(1)" }
                }
              />
            </div>
          ))}
        </div>

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (wish) {
              removeFromWishlist(p._id);
            } else {
              addToWishlist({
                _id: p._id,
                name: p.name,
                price: p.discountPrice || p.price,
                image: images[0].url,
              });
            }
          }}
          className="absolute right-5 top-5 rounded-full bg-white/90 backdrop-blur-md p-3.5 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white cursor-pointer border border-zinc-200/60 z-20 text-zinc-800"
          aria-label="Wishlist"
        >
          <Heart
            size={20}
            className={
              wish
                ? "fill-rose-500 text-rose-500 scale-110"
                : "text-zinc-700 hover:text-black"
            }
          />
        </button>

        {/* DOTS PAGINATION */}
        {images.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full z-10 shadow-sm">
            {images.map((_: any, index: number) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(index);
                  setIsAutoPlay(false);
                }}
                className={`transition-all duration-500 rounded-full cursor-pointer ${
                  selectedIndex === index
                    ? "w-8 h-2 bg-white scale-105 shadow-md"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* PREVIOUS BUTTON */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
              setIsAutoPlay(false);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-md p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 cursor-pointer text-zinc-900 z-20 border border-white/40"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* NEXT BUTTON */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
              setIsAutoPlay(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-md p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 cursor-pointer text-zinc-900 z-20 border border-white/40"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* FULLSCREEN / ZOOM HINT */}
        <div className="absolute bottom-5 right-5 rounded-full bg-white/90 backdrop-blur-md py-2 px-3.5 shadow-md text-zinc-800 pointer-events-none hidden sm:flex items-center gap-2 text-xs font-bold tracking-wide z-10">
          <Maximize2 size={14} className="text-zinc-600" />
          <span>Click to expand</span>
        </div>
      </div>

      {/* THUMBNAILS (SMALLER & REFINED) */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-2 px-1 scrollbar-none">
          {images.map((img: any, index: number) => {
            const isActive = selectedIndex === index;
            return (
              <button
                key={img.public_id || index}
                type="button"
                onClick={() => {
                  setSelectedIndex(index);
                  setIsAutoPlay(false);
                }}
                className={`relative shrink-0 overflow-hidden rounded-xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isActive
                    ? "h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-zinc-900 ring-offset-2 shadow-xl opacity-100 scale-105 -translate-y-0.5 z-10"
                    : "h-12 w-12 sm:h-14 sm:w-14 border border-zinc-200/80 hover:border-zinc-400 opacity-50 hover:opacity-90 scale-95 hover:scale-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  className={`h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isActive ? "scale-110" : "scale-100 hover:scale-105"
                  }`}
                />
                {isActive && (
                  <div className="absolute inset-0 bg-zinc-900/5 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none transition-all duration-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 rounded-full bg-white/10 hover:bg-white/20 text-white p-3 backdrop-blur-md transition-all duration-300 z-50 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* LIGHTBOX CONTENT CONTAINER */}
          <div 
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center overflow-hidden rounded-3xl"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[selectedIndex]?.url}
              alt={p.name || "Product full view"}
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-300 select-none"
            />

            {/* LIGHTBOX PREV BUTTON */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white p-4 backdrop-blur-md transition-all duration-300 cursor-pointer border border-white/10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* LIGHTBOX NEXT BUTTON */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white p-4 backdrop-blur-md transition-all duration-300 cursor-pointer border border-white/10"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
