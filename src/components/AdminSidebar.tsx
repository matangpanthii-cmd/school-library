"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  ArrowRightLeft, 
  BookMarked, 
  FileText, 
  Users, 
  Globe, 
  LogOut, 
  RotateCcw,
  ShieldCheck,
  BookOpen,
  Sparkles
} from "lucide-react";

const adminNav = [
  { name: "แดชบอร์ด (Overview)", href: "/admin", icon: Home },
  { name: "โต๊ะเคาน์เตอร์ ยืม-คืน", href: "/admin/counter", icon: ArrowRightLeft },
  { name: "จัดการคลังหนังสือ", href: "/admin/books", icon: BookMarked },
  { name: "รายงานสถิติ", href: "/admin/stats", icon: FileText },
  { name: "ข้อมูลบุคลากร / บัตร", href: "/admin/profile", icon: Users },
];

export default function AdminSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("appRole");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <aside className={`w-72 bg-[#0a192f] text-slate-100 flex flex-col h-screen overflow-y-auto shrink-0 border-r border-slate-800 shadow-2xl ${className}`}>
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 bg-[#071324]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              <span>ระบบหลังบ้าน</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                ADMIN
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">โรงเรียนอนุบาลช้างน้อย</p>
          </div>
        </div>
      </div>

      {/* Switch to Front-End Public View Button */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800">
        <Link
          href="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all hover:scale-102 whitespace-nowrap"
        >
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Globe className="w-4 h-4 text-sky-200 shrink-0" />
            <span className="whitespace-nowrap">ไปที่หน้าบ้าน (หน้านักเรียน)</span>
          </div>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded shrink-0">เปิด</span>
        </Link>
      </div>

      {/* Section Label */}
      <div className="px-6 pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        เมนูจัดการห้องสมุด
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5">
        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-300"}`} />
              <span className="whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Actions & Profile */}
      <div className="p-4 border-t border-slate-800 bg-[#071324] space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white shrink-0 border border-amber-400">
            <img src="/avatar_teacher.jpg" alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">ครูปัณฑิตา คำพัด</p>
            <p className="text-[10px] text-amber-300 font-semibold truncate">บรรณารักษ์ / ผู้ดูแลระบบ</p>
          </div>
        </div>

        {/* Reset DB Button */}
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
          className="flex items-center gap-2 px-3.5 py-2 w-full text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ตฐานข้อมูลเริ่มต้น</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 w-full text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบหลังบ้าน</span>
        </button>
      </div>
    </aside>
  );
}
