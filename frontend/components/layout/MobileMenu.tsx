"use client";

import Link from "next/link";
import { X } from "lucide-react";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

const menuItems = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Categories", href: "/categories" },
  { title: "Best Sellers", href: "/best-sellers" },
  { title: "New Arrivals", href: "/new-arrivals" },
  { title: "Future Products", href: "/future-products" },
  { title: "Deals", href: "/deals" },
  { title: "Contact", href: "/contact" },
];

export default function MobileMenu({
  open,
  onClose,
}: MobileMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold">
            NOPTRIX
          </h2>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col p-5">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="rounded-lg px-3 py-3 transition hover:bg-gray-100"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}