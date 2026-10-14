"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  BookMarked, 
  Search, 
  ScanLine, 
  BookOpen, 
  Bookmark, 
  User, 
  ShieldCheck, 
  Home, 
  Menu, 
  X,
  LogOut,
  Sparkles
} from "lucide-react";

export default function StudentNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("ด.ญ. แมนนะ น่ารัก");
  const [userId, setUserId] = useState("U-1002");
  const [role, setRole] = useState("student");

  useEffect(() => {
    const savedName = localStorage.getItem("currentUserName");
    const savedId = localStorage.getItem("currentUserId");
    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (savedName) setUserName(savedName);
    if (savedId) setUserId(savedId);
    if (savedRole) setRole(savedRole);
  }, []);

  const navLinks = [
    { name: "หน้าแรก", href: "/", icon: Home },
    { name: "ค้นหาหนังสือ", href: "/search", icon: Search },
    { name: "สแกนยืมด้วยมือถือ", href: "/scan", icon: ScanLine },
    { name: "หนังสือของฉัน", href: "/my-books", icon: BookOpen },
    { name: "รายการจอง", href: "/reservations", icon: Bookmark },
    { name: "บัตรนักเรียน", href: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & School Branding */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform overflow-hidden p-1 border-2 border-white">
              <img src="/hero-elephant.jpg" alt="ช้างน้อย" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-xl text-[#0c4a6e] tracking-tight group-hover:text-blue-600 transition-colors">
                  ห้องสมุดช้างน้อย
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                  หน้าบ้าน
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                โรงเรียนอนุบาลช้างน้อย • School Library
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-nowrap">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30 font-bold"
                      : "text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: User info & Admin Portal Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Admin Back-Office Button */}
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-900 to-indigo-900 text-amber-300 hover:text-white hover:from-blue-800 hover:to-indigo-800 shadow-md shadow-blue-900/20 transition-all hover:scale-102 border border-blue-700/50 whitespace-nowrap shrink-0"
              title="เข้าสู่ระบบบริหารจัดการห้องสมุด (สำหรับคุณครูและแอดมิน)"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">ระบบหลังบ้าน</span>
            </Link>

            {/* Student Profile Pill */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                <img 
                  src="/hero-elephant.jpg" 
                  alt="Student Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">{userName}</p>
                <p className="text-[10px] font-semibold text-slate-400 leading-none">{userId}</p>
              </div>
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-sky-50 rounded-2xl flex items-center justify-between mb-3 border border-sky-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-200 overflow-hidden">
                <img src="/hero-elephant.jpg" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{userName}</p>
                <p className="text-[10px] text-sky-600 font-semibold">{userId} • นักเรียน</p>
              </div>
            </div>
            <Link
              href="/login"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              ออกจากระบบ
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                    isActive
                      ? "bg-sky-500 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-sky-50"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-900 to-indigo-900 text-amber-300 flex items-center justify-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>เข้าสู่ระบบหลังบ้าน (สำหรับคุณครู)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
