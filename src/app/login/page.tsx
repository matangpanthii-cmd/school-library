"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User as UserIcon, ArrowRight, Sparkles, BookOpen, AlertCircle, ShieldCheck, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("U-1002");
  const [password, setPassword] = useState("1234");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const inputId = username.trim();
    const inputPass = password.trim();

    if (!inputId) {
      setErrorMessage("กรุณากรอกรหัสประจำตัวหรือชื่อผู้ใช้งาน");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. ADMIN / TEACHER ACCOUNTS
      if (
        inputId.toLowerCase() === "admin" ||
        inputId.toUpperCase() === "U-2001" ||
        inputId.toUpperCase() === "U-2002"
      ) {
        if (inputPass && inputPass !== "123456" && inputPass !== "admin1234" && inputPass !== "1234") {
          setIsLoading(false);
          setErrorMessage("รหัสผ่านไม่ถูกต้อง สำหรับแอดมินกรุณาใช้รหัส 123456 ครับ");
          return;
        }

        const adminName = inputId.toUpperCase() === "U-2002" ? "ครูกิตติพงศ์ (คุณครู)" : "ครูปัณฑิตา คำพัด (แอดมิน)";
        localStorage.setItem("appRole", "admin");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("currentUserId", inputId.toUpperCase());
        localStorage.setItem("currentUserName", adminName);

        setIsLoading(false);
        router.push("/admin");
        return;
      }

      // 2. STUDENT / GENERAL USER ACCOUNTS
      let studentName = "ด.ญ. แมนนะ น่ารัก";
      if (inputId.toUpperCase() === "U-1001") {
        studentName = "ด.ช. สมชาย สายลม";
      } else if (inputId.toUpperCase() !== "U-1002") {
        studentName = `นักเรียน (${inputId})`;
      }

      localStorage.setItem("appRole", "student");
      localStorage.setItem("userRole", "student");
      localStorage.setItem("currentUserId", inputId.toUpperCase());
      localStorage.setItem("currentUserName", studentName);

      setIsLoading(false);
      router.push("/");
    }, 500);
  };

  const setPresetUser = (presetId: string, presetPass: string) => {
    setUsername(presetId);
    setPassword(presetPass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100">
      <div className="bg-white p-7 sm:p-10 rounded-[32px] shadow-2xl shadow-blue-900/10 w-full max-w-md border border-slate-100">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3.5 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-3xl p-1 shadow-lg shadow-sky-500/20 overflow-hidden flex items-center justify-center">
            <img 
              src="/hero-elephant.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>โรงเรียนอนุบาลช้างน้อย</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            เข้าสู่ระบบห้องสมุด
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-xs sm:text-sm">
            ระบบบริหารจัดการยืม-คืนหนังสือดิจิทัล
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Standard Unified Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              รหัสประจำตัว หรือ ชื่อผู้ใช้
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="กรอกรหัสนักเรียนหรือครู (เช่น U-1002)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-400/10 outline-none transition-all font-semibold text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              รหัสผ่าน
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-400/10 outline-none transition-all font-semibold text-sm text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังตรวจสอบสิทธิ์...
              </>
            ) : (
              <>
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] font-bold text-slate-400 mb-2.5">
            คลิกเพื่อกรอกบัญชีทดสอบอัตโนมัติ:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPresetUser("U-1002", "1234")}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>นักเรียน (U-1002)</span>
            </button>

            <button
              type="button"
              onClick={() => setPresetUser("U-2001", "123456")}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>คุณครู/แอดมิน (U-2001)</span>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-[11px] text-slate-400">
          ระบบห้องสมุดโรงเรียนอนุบาลช้างน้อย
        </div>

      </div>
    </div>
  );
}
