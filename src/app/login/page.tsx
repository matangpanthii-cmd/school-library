"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User as UserIcon, ShieldCheck, GraduationCap, ArrowRight, Sparkles, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activePortal, setActivePortal] = useState<"student" | "admin">("student");
  
  // Student form state
  const [studentId, setStudentId] = useState("U-1002");
  
  // Admin form state
  const [adminId, setAdminId] = useState("U-2001");
  const [adminPassword, setAdminPassword] = useState("123456");
  
  const [isLoading, setIsLoading] = useState(false);

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.setItem("appRole", "student");
    localStorage.setItem("userRole", "student");
    localStorage.setItem("currentUserId", studentId.trim() || "U-1002");
    localStorage.setItem("currentUserName", "ด.ญ. แมนนะ น่ารัก");

    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 600);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.setItem("appRole", "admin");
    localStorage.setItem("userRole", "admin");
    localStorage.setItem("currentUserId", adminId.trim() || "U-2001");
    localStorage.setItem("currentUserName", "ครูปัณฑิตา คำพัด");

    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin");
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50">
      {/* Decorative background */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" 
        style={{ backgroundImage: "url('/elephant-bg.jpg')", backgroundSize: '160px' }}
      ></div>
      
      <div className="bg-white p-6 sm:p-10 rounded-[36px] shadow-2xl shadow-sky-900/10 w-full max-w-lg relative z-10 border-4 border-white">
        
        {/* Header Mascot */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-3 bg-white rounded-full p-1.5 shadow-md border-4 border-sky-100 overflow-hidden flex items-center justify-center">
            <img 
              src={activePortal === "student" ? "/hero-elephant.jpg" : "/avatar_teacher.jpg"} 
              alt="Portal Icon" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>โรงเรียนอนุบาลช้างน้อย</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0c4a6e] tracking-tight">
            เข้าสู่ระบบห้องสมุด
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-xs">
            กรุณาเลือกประเภทผู้ใช้งานเพื่อเข้าสู่ระบบที่ถูกต้อง
          </p>
        </div>

        {/* 2 Distinct Portal Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActivePortal("student")}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activePortal === "student"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-102"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">สำหรับนักเรียน</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal("admin")}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activePortal === "admin"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">สำหรับแอดมิน / ครู</span>
          </button>
        </div>

        {/* STUDENT PORTAL FORM */}
        {activePortal === "student" ? (
          <form onSubmit={handleStudentLogin} className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>เข้าสู่หน้าระบบค้นหาหนังสือ สแกนยืมด้วยมือถือ และตรวจสอบรายการจอง</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รหัสประจำตัวนักเรียน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น U-1002"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/20 outline-none transition-all font-medium text-sm text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบนักเรียน...
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบในชื่อ ด.ญ. แมนนะ (นักเรียน)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ADMIN / TEACHER PORTAL FORM */
          <form onSubmit={handleAdminLogin} className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 font-medium flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>เข้าสู่ระบบเคาน์เตอร์ ยืม-คืน จัดการคลังหนังสือ และรายงานสถิติ</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รหัสประจำตัวเจ้าหน้าที่ / คุณครู
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น U-2001"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 outline-none transition-all font-medium text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่านเจ้าหน้าที่"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 outline-none transition-all font-medium text-sm text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบแอดมิน...
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบในชื่อ ครูปัณฑิตา (แอดมิน)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-400">
          ระบบห้องสมุดโรงเรียนอนุบาลช้างน้อย
        </div>
      </div>
    </div>
  );
}
