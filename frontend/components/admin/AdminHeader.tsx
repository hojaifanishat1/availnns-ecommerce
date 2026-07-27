"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Menu,
  Bell,
  User,
  Search,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

type AdminHeaderProps = {
  onMenuClick?: () => void;
};

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setAdmin(JSON.parse(data));
    }
  }, []);

  // close dropdown
  useEffect(() => {
    const close = (e: any) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  return (
    <header
      className="
        sticky
        top-0
        z-50
        flex
        h-20
        items-center
        justify-between
        border-b
        bg-white
        px-4
        sm:px-6
        shadow-sm
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="
            rounded-xl
            p-2
            hover:bg-gray-100
            lg:hidden
            transition
          "
        >
          <Menu size={22} />
        </button>

        <div
          className="
            hidden
            md:flex
            items-center
            gap-3
            rounded-xl
            border
            bg-gray-50
            px-4
            py-2
          "
        >
          <Search
            size={18}
            className="text-gray-400"
          />
          <input
            placeholder="Search products, orders..."
            className="
              w-72
              bg-transparent
              text-sm
              outline-none
            "
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          className="
            relative
            rounded-xl
            p-2
            transition
            hover:bg-gray-100
          "
        >
          <Bell size={21} />
          <span
            className="
              absolute
              right-1
              top-1
              h-2
              w-2
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* PROFILE */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-1
              hover:bg-gray-100
            "
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black
                text-white
              "
            >
              <User size={20} />
            </div>

            <ChevronDown size={16} />
          </button>

          {open && (
            <div
              className="
                absolute
                right-0
                mt-3
                w-56
                rounded-2xl
                border
                bg-white
                p-2
                shadow-xl
                z-50
              "
            >
              <button
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  hover:bg-gray-100
                "
              >
                <User size={18} />
                Profile
              </button>

              <button
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  hover:bg-gray-100
                "
              >
                <Settings size={18} />
                Settings
              </button>

              <button
                onClick={logout}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  text-red-500
                  hover:bg-red-50
                "
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
