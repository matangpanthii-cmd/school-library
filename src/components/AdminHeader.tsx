"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Globe, Bell, ShieldCheck, Database, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/admin") return "ภาพรวมและแดชบอร์ด";
    if (pathname === "/admin/counter") return "โต๊ะเคาน์เตอร์ ยืม - คืน";
    if (pathname === "/admin/books") return "จัดการคลังหนังสือและบาร์โค้ด";
    if (pathname === "/admin/stats") return "รายงานสถิติและผลการใช้งาน";
    if (pathname === "/admin/profile") return "บัตรและข้อมูลบุคลากร";
    return "ระบบหลังบ้าน";
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-md">
        
        {/* Left: Hamburger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black bg-amber-400 text-slate-950">
              <ShieldCheck className="w-3.5 h-3.5" />
              BACK-OFFICE
            </span>
            <span className="text-slate-500 hidden sm:inline">/</span>
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Real-time DB sync badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time DB Active</span>
          </div>

          {/* Switch to Front-End View */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm"
            target="_blank"
            title="เปิดดูมุมมองนักเรียนในแท็บใหม่"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ดูหน้าบ้าน</span>
          </Link>

          {/* Admin Avatar */}
          <Link href="/admin/profile" className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400 bg-white">
              <img src="/avatar_teacher.jpg" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-200 leading-tight">ครูปัณฑิตา</p>
              <p className="text-[10px] text-amber-400 leading-none">ผู้ดูแลระบบ</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-10 w-72">
            <AdminSidebar />
          </div>
        </div>
      )}
    </>
  );
}
