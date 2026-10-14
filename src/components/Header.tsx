"use client";

import { Search, Bell, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [role, setRole] = useState<"admin" | "student">("student");
  const router = useRouter();

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(globalQuery.trim())}`);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (saved === "admin") {
      setRole("admin");
    } else {
      setRole("student");
    }
  }, []);

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search */}
        <form onSubmit={handleGlobalSearch} className="flex-1 max-w-2xl hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 ml-4 md:ml-0">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ISBN..." 
            className="bg-transparent border-none focus:outline-none focus:ring-0 w-full ml-3 text-sm text-slate-700 placeholder-slate-400"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {role === "admin" ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
              โหมดแอดมิน (Admin)
            </span>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              เข้าสู่ระบบเจ้าหน้าที่
            </button>
          )}

          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div 
            onClick={() => router.push(role === "admin" ? "/admin/profile" : "/profile")}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden shadow-sm border border-slate-200">
               <img 
                 src={role === "admin" ? "/avatar_teacher.jpg" : "/hero-elephant.jpg"} 
                 alt="Profile" 
                 className="w-full h-full object-cover" 
               />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-none whitespace-nowrap">
                {role === "admin" ? "ครูปัณฑิตา คำพัด" : "บุคคลทั่วไป / นักเรียน"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                {role === "admin" ? "บรรณารักษ์ (แอดมิน)" : "ห้องสมุดอนุบาลช้างน้อย"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative z-10">
             <Sidebar className="flex" />
          </div>
        </div>
      )}
    </>
  );
}
