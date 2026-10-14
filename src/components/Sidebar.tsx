"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, 
  Search, 
  ArrowRightLeft, 
  BookOpen, 
  Bookmark, 
  Users, 
  FileText, 
  LogOut, 
  BookMarked,
  ShieldCheck,
  GraduationCap,
  ScanLine,
  RotateCcw,
  Sparkles,
  ChevronRight
} from "lucide-react";

const studentMenu = [
  { name: "หน้าแรกห้องสมุด", icon: Home, href: "/" },
  { name: "ค้นหาหนังสือ", icon: Search, href: "/search" },
  { name: "สแกนยืมด้วยมือถือ", icon: ScanLine, href: "/scan" },
  { name: "หนังสือของฉัน", icon: BookOpen, href: "/my-books" },
  { name: "รายการจอง", icon: Bookmark, href: "/reservations" },
  { name: "บัตรนักเรียน", icon: Users, href: "/profile" },
];

const adminMenu = [
  { name: "แดชบอร์ดภาพรวม", icon: Home, href: "/admin" },
  { name: "โต๊ะเคาน์เตอร์ ยืม-คืน", icon: ArrowRightLeft, href: "/admin/counter" },
  { name: "จัดการคลัง & บาร์โค้ด", icon: BookMarked, href: "/admin/books" },
  { name: "รายงานสถิติ", icon: FileText, href: "/admin/stats" },
  { name: "บัตรประจำตัวครู", icon: Users, href: "/admin/profile" },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "student">("admin");
  const [activeTab, setActiveTab] = useState<"all" | "student" | "admin">("all");

  useEffect(() => {
    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (savedRole === "student" || savedRole === "admin") {
      setRole(savedRole as "admin" | "student");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("appRole");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <aside className={`w-72 bg-[#103a75] text-white flex flex-col h-screen overflow-y-auto shrink-0 border-r border-blue-900 shadow-xl ${className}`}>
      
      {/* 1. App Branding - In its original place at top left */}
      <div className="p-5 flex items-center gap-3 pb-4 border-b border-blue-800/80 bg-[#0d3163]">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md overflow-hidden shrink-0">
          <img src="/hero-elephant.jpg" alt="Logo" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white">
            School Library
          </h1>
          <p className="text-[11px] font-medium text-sky-200">โรงเรียนอนุบาลช้างน้อย</p>
        </div>
      </div>

      {/* 2. Current User Badge */}
      <div className="px-5 py-3 bg-blue-950/40 border-b border-blue-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${role === 'admin' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
            {role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">สถานะผู้ใช้</p>
            <p className="text-xs font-bold text-white">
              {role === 'admin' ? 'ครูปัณฑิตา (แอดมิน)' : 'ด.ญ. แมนนะ (นักเรียน)'}
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="text-[11px] font-bold px-2 py-1 rounded bg-blue-800 hover:bg-blue-700 text-sky-200 transition-colors"
          title="สลับบัญชีผู้ใช้"
        >
          สลับ
        </Link>
      </div>

      {/* 3. Navigation Menus - Separated into Front-Office and Back-Office */}
      <div className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
        
        {/* SECTION 1: หน้าบ้าน (สำหรับนักเรียน) */}
        <div>
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-sky-200">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span>หน้าบ้าน (นักเรียน)</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 whitespace-nowrap font-medium">
              Front-End
            </span>
          </div>

          <nav className="space-y-1">
            {studentMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold whitespace-nowrap ${
                    isActive 
                      ? "bg-sky-400 text-slate-950 shadow-md font-bold" 
                      : "text-blue-100 hover:bg-blue-800/80 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-sky-300"}`} />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SECTION 2: หลังบ้าน (สำหรับคุณครู / แอดมิน) */}
        <div className="pt-3 border-t border-blue-800/60">
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-200">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span>หลังบ้าน (แอดมิน)</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap font-medium">
              Back-Office
            </span>
          </div>

          <nav className="space-y-1">
            {adminMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold whitespace-nowrap ${
                    isActive 
                      ? "bg-amber-400 text-slate-950 shadow-md font-bold" 
                      : "text-blue-100 hover:bg-blue-800/80 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-300"}`} />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

      </div>

      {/* 4. Footer User Info & Logout */}
      <div className="p-3 border-t border-blue-800/80 bg-[#0d3163] space-y-2">
        <button 
          onClick={() => {
            if (confirm("ยืนยันการคืนค่าระบบและล้างข้อมูลจำลองกลับสู่เริ่มต้นหรือไม่?")) {
              fetch("/api/reset", { method: "POST" })
                .then(() => {
                  localStorage.clear();
                  window.location.reload();
                })
                .catch(() => alert("รีเซ็ตไม่สำเร็จ"));
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 w-full text-sky-200 hover:text-amber-200 hover:bg-blue-800/60 rounded-lg transition-colors text-[11px] font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ตฐานข้อมูลเริ่มต้น</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 w-full text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

    </aside>
  );
}
