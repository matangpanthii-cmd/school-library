"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (!role) {
      setIsAuthenticated(false);
      if (pathname !== "/login") {
        router.replace("/login");
      }
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (pathname === "/login") {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  // While checking or if unauthenticated, redirect smoothly to /login
  if (isAuthenticated === false) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">กำลังเปิดหน้าระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Left Sidebar - For desktop */}
      <Sidebar className="hidden md:flex z-10" />

      {/* Main Content Area with Header at top */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
        <BottomNav />
      </div>
    </>
  );
}
