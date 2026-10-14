"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      {/* Left Sidebar - Always in its original place on the left */}
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
