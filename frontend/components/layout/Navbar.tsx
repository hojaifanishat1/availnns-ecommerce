"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  User,
  Heart,
} from "lucide-react";

// Components
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import CartDrawer from "@/components/cart/CartDrawer";

// Hooks
import useCart from "@/hooks/useCart";

// Context
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist?.length || 0;

  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* 
        'fixed inset-x-0 top-0 z-50' নিশ্চিত করবে যে Navbar পেজের একদম উপরে স্ক্রিন জুড়ে ফিক্সড থাকবে।
      */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Mobile Menu Trigger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-zinc-700 hover:text-black transition p-1 cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>

          {/* Brand Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-black tracking-wider text-zinc-900">
            NOPTRIX<span className="text-rose-600">.</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative text-zinc-600 hover:text-rose-600 transition group p-1.5"
              aria-label="Wishlist"
            >
              <Heart size={22} className="transition-transform duration-300 group-hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-zinc-600 hover:text-black transition group p-1.5 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={22} className="transition-transform duration-300 group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 border-l border-zinc-200 pl-4 text-zinc-700 hover:text-black transition group"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || "User Profile"}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-200 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:scale-105 transition-transform">
                    <User size={16} />
                  </div>
                )}
                <span className="font-semibold text-sm truncate max-w-[100px]">
                  {user?.name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-zinc-600 hover:text-black transition group p-1.5"
                aria-label="Login"
              >
                <User size={22} className="transition-transform duration-300 group-hover:scale-110" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Section */}
        <div className="md:hidden border-t border-zinc-100 px-4 py-2.5 bg-zinc-50/50">
          <SearchBar />
        </div>
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile Menu Component */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
