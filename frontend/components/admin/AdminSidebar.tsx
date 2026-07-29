"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  TicketPercent,
  Settings,
  LogOut,
  Store,
  X,
  MapPinned,
  Bell,
  Image as ImageIcon, // ব্যানার আইকনের জন্য ইমেজ ইমপোর্ট করা হলো
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Banners",
    href: "/admin/banners",
    icon: ImageIcon, // ব্যানার মেনু আইটেম যুক্ত করা হলো
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: TicketPercent,
  },
  {
    name: "Delivery Zones",
    href: "/admin/delivery-zones",
    icon: MapPinned,
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export default function AdminSidebar({
  open = false,
  onClose,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-zinc-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex h-20 items-center justify-between border-b border-zinc-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide">NOPTRIX</h1>
              <p className="text-xs text-zinc-400">Admin Panel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 space-y-2 px-4 overflow-y-auto h-[calc(100vh-180px)]">
          {menu.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-black shadow-xl"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 p-4">
          <div className="mb-3 rounded-xl bg-zinc-900 p-3">
            <p className="text-sm font-bold">Administrator</p>
            <p className="text-xs text-zinc-400">admin@noptrix.com</p>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
