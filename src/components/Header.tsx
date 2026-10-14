"use client";

import { Search, Bell, Menu, LogOut } from "lucide-react";
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
          {role === "admin" && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
              โหมดแอดมิน (Admin)
            </span>
          )}

          <div 
            onClick={() => router.push(role === "admin" ? "/admin/profile" : "/profile")}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden shadow-sm border border-slate-200">
               <img 
                 src={role === "admin" ? "/avatar_teacher.jpg" : "/hero-elephant.jpg"} 
                 alt="Profile" 
                 className="w-full h-full object-cover" 
               />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none whitespace-nowrap">
                {role === "admin" ? "ครูปัณฑิตา (แอดมิน)" : "ด.ญ. แมนนะ (นักเรียน)"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                {role === "admin" ? "บรรณารักษ์ / จัดการคลัง" : "รหัส: U-1002"}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
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
