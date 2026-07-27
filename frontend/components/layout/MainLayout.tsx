"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddressPinBar from "@/components/common/AddressPinBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      
      {/* Address pin bar will show on all pages except admin */}
      {!isAdmin && <AddressPinBar />}

      <main>{children}</main>

      {!isAdmin && <Footer />}
    </>
  );
}
