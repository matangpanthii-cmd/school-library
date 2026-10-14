"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Search, ScanLine, BookOpen, Users, ArrowRightLeft, Bookmark, FileText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<"admin" | "student">("admin");

  useEffect(() => {
    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (savedRole === "student" || savedRole === "admin") {
      setRole(savedRole as "admin" | "student");
    }
  }, []);

  const adminTabs = [
    { name: "แดชบอร์ด", icon: Home, href: "/admin" },
    { name: "เคาน์เตอร์", icon: ArrowRightLeft, href: "/admin/counter" },
    { name: "คลังหนังสือ", icon: Search, href: "/admin/books" },
    { name: "สถิติ", icon: FileText, href: "/admin/stats" },
    { name: "บัตรครู", icon: Users, href: "/admin/profile" },
  ];

  const studentTabs = [
    { name: "หน้าแรก", icon: Home, href: "/" },
    { name: "ค้นหา", icon: Search, href: "/search" },
    { name: "สแกนยืม", icon: ScanLine, href: "/scan" },
    { name: "ของฉัน", icon: BookOpen, href: "/my-books" },
    { name: "บัตรฉัน", icon: Users, href: "/profile" },
  ];

  const tabs = role === "admin" ? adminTabs : studentTabs;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-100/70 text-blue-700 scale-105' : ''}`}>
                <tab.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] leading-tight whitespace-nowrap font-medium ${isActive ? 'text-blue-700 font-bold' : ''}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
