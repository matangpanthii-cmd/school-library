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
  const [role, setRole] = useState<"admin" | "student">("student");

  useEffect(() => {
    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (savedRole === "admin") {
      setRole("admin");
    } else {
      setRole("student");
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("appRole");
    localStorage.removeItem("userRole");
    setRole("student");
    router.push("/");
  };

  const isAdmin = role === "admin";

  return (
    <aside className={`w-72 bg-[#103a75] text-white flex flex-col h-screen overflow-y-auto shrink-0 border-r border-blue-900 shadow-xl ${className}`}>
      
      {/* 1. App Branding */}
      <div className="p-5 flex items-center gap-3 pb-4 border-b border-blue-800/80 bg-[#0d3163]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            <img src="/hero-elephant.jpg" alt="Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white group-hover:text-sky-200 transition-colors">
              School Library
            </h1>
            <p className="text-[11px] font-medium text-sky-200">โรงเรียนอนุบาลช้างน้อย</p>
          </div>
        </Link>
      </div>

      {/* 2. User Status Banner */}
      <div className="px-5 py-3 bg-blue-950/40 border-b border-blue-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isAdmin ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
              {isAdmin ? "สถานะ: ผู้ดูแลระบบ" : "สถานะ: บุคคลทั่วไป / นักเรียน"}
            </p>
            <p className="text-xs font-bold text-white">
              {isAdmin ? "ครูปัณฑิตา (แอดมิน)" : "เข้าใช้งานห้องสมุด"}
            </p>
          </div>
        </div>
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="text-[11px] font-bold px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 transition-colors"
            title="ออกจากระบบแอดมิน"
          >
            ออก
          </button>
        ) : (
          <Link
            href="/login"
            className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-800 hover:bg-blue-700 text-sky-200 transition-colors"
            title="สำหรับเจ้าหน้าที่"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>

      {/* 3. Navigation Menus */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        
        {/* กรณีเป็นบุคคลทั่วไป หรือ นักเรียน: แสดงเฉพาะเมนูหน้าบ้านเท่านั้น */}
        {!isAdmin ? (
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-sky-200">
              เมนูห้องสมุด
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
        ) : (
          /* กรณีเป็นแอดมิน / คุณครู: แสดงเมนูบริหารจัดการระบบหลังบ้าน */
          <div className="space-y-4">
            <div>
              <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-200">
                <span>ระบบจัดการหลังบ้าน (แอดมิน)</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">
                  Admin
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

            <div className="pt-3 border-t border-blue-800/60">
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-sky-200">
                มุมมองหน้าเว็บนักเรียน
              </div>
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-sky-200 hover:bg-blue-800/60 hover:text-white transition-all"
              >
                <Home className="w-4 h-4 text-sky-300" />
                <span>เปิดดูหน้าแรกห้องสมุด</span>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* 4. Footer Section */}
      <div className="p-3 border-t border-blue-800/80 bg-[#0d3163] space-y-2">
        {isAdmin ? (
          <>
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
              className="flex items-center gap-2 px-3 py-1.5 w-full text-sky-300 hover:text-amber-200 hover:bg-blue-800/60 rounded-lg transition-colors text-[11px] font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตฐานข้อมูลเริ่มต้น</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 w-full text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบแอดมิน</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-3 py-2.5 w-full bg-blue-900/60 hover:bg-blue-800 text-sky-200 hover:text-white rounded-xl transition-all text-xs font-bold border border-blue-700/50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>สำหรับเจ้าหน้าที่ / คุณครู</span>
          </Link>
        )}
      </div>

    </aside>
  );
}
