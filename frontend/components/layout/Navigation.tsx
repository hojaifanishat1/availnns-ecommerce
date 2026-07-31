"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Grid2X2,
  Flame,
  Tag,
  Sparkles,
  Phone,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    icon: "home",
  },
  {
    name: "Category",
    href: "/category",
    icon: "category",
  },
  {
    name: "Deals",
    href: "/deals",
    icon: "tag",
    badge: "Hot",
    badgeColor: "bg-rose-500 text-white",
  },
  {
    name: "Best Sellers",
    href: "/best-sellers",
    icon: "flame",
  },
  {
    name: "New Arrivals",
    href: "/new-arrivals",
    icon: "sparkles",
    badge: "New",
    badgeColor: "bg-emerald-500 text-white",
  },
  {
    name: "Contact",
    href: "/contact",
    icon: "phone",
  },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderIcon = (icon?: string, active?: boolean) => {
    switch (icon) {
      case "home":
        return <Home size={22} className={active ? "text-white" : "text-blue-500"} />;
      case "category":
        return <Grid2X2 size={22} className={active ? "text-white" : "text-emerald-500"} />;
      case "tag":
        return <Tag size={22} className={active ? "text-white" : "text-rose-500"} />;
      case "flame":
        return <Flame size={22} className={active ? "text-white" : "text-amber-500"} />;
      case "sparkles":
        return <Sparkles size={22} className={active ? "text-white" : "text-purple-500"} />;
      case "phone":
        return <Phone size={22} className={active ? "text-white" : "text-sky-500"} />;
      default:
        return null;
    }
  };

  return (
    <nav
      className="
      fixed
      inset-x-0
      bottom-0
      z-50
      border-t
      border-zinc-200
      bg-white/95
      backdrop-blur-md
      shadow-2xl
      py-2
      "
    >
      <div
        className="
        mx-auto
        max-w-7xl
        px-4
        "
      >
        <ul
          className="
          flex
          items-center
          justify-around
          gap-2
          overflow-x-auto
          py-1
          whitespace-nowrap
          scrollbar-hide
          "
        >
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <li
                key={item.href}
                className="shrink-0"
              >
                <Link
                  href={item.href}
                  className={`
                    relative
                    group
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1.5
                    rounded-2xl
                    px-4
                    py-2.5
                    min-w-[70px]
                    text-xs
                    font-bold
                    transition-all
                    duration-300
                    cursor-pointer

                    ${
                      active
                        ? "bg-zinc-900 text-white shadow-lg scale-105"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
                    }
                  `}
                >
                  {/* Icon */}
                  <span className="transition-transform duration-300 group-hover:scale-110">
                    {renderIcon(item.icon, active)}
                  </span>

                  {/* Name */}
                  <span className="text-[11px] tracking-wide">{item.name}</span>

                  {/* Optional Badge */}
                  {item.badge && (
                    <span
                      className={`
                        absolute
                        -top-1
                        right-1
                        text-[9px]
                        font-extrabold
                        px-1.5
                        py-0.5
                        rounded-full
                        tracking-wider
                        uppercase
                        shadow-sm
                        ${item.badgeColor}
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
