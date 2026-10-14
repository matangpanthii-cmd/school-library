"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserCircle, BookOpen, CheckCircle2, AlertCircle, RefreshCcw, ScanLine, XCircle, ArrowRightLeft, ShieldAlert } from "lucide-react";

type User = {
  id: string;
  name: string;
  role: string;
  room?: string;
  department?: string;
  limit: number;
  borrowed: number;
  avatar: string;
};

type Book = {
  id: string;
  title: string;
  status: string;
  borrowerId?: string;
};

// Mock Data
const MOCK_USERS: Record<string, User> = {
  "U-1001": { id: "U-1001", name: "ด.ช. สมชาย สายลม", role: "student", room: "ม.3/1", limit: 3, borrowed: 1, avatar: "/avatar_student.jpg" },
  "U-1002": { id: "U-1002", name: "ด.ญ. แมนนะ น่ารัก", role: "student", room: "ป.6/2", limit: 3, borrowed: 0, avatar: "/avatar_student.jpg" },
  "U-2001": { id: "U-2001", name: "ครูปัณฑิตา คำพัด", role: "teacher", department: "บรรณารักษ์", limit: 10, borrowed: 4, avatar: "/avatar_teacher.jpg" },
  "U-2002": { id: "U-2002", name: "ครูกิตติพงศ์", role: "teacher", department: "วิทยาศาสตร์", limit: 10, borrowed: 2, avatar: "/avatar_kittipong.png" },
};

const MOCK_BOOKS: Record<string, Book> = {
  "B-0001": { id: "B-0001", title: "แฮร์รี่ พอตเตอร์ กับศิลาอาถรรพ์", status: "Available" },
  "B-0002": { id: "B-0002", title: "เจ้าชายน้อย", status: "Borrowed", borrowerId: "U-1001" },
  "B-0003": { id: "B-0003", title: "หลักการเขียนโปรแกรมเบื้องต้น", status: "Available" },
};

type ActionLog = {
  id: string;
  time: Date;
  type: "success" | "error" | "info" | "return";
  message: string;
};

export default function AdminCounterPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Record<string, Book>>(MOCK_BOOKS);
  const [inputValue, setInputValue] = useState("");
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    setRole(saved === "admin" ? "admin" : "student");
  }, []);

  // Load saved books from server API or localStorage on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        if (res.ok) {
          const data = await res.json();
          if (data.books && Array.isArray(data.books)) {
            const map: Record<string, Book> = { ...MOCK_BOOKS };
            data.books.forEach((item: any) => {
              map[item.id] = {
                id: item.id,
                title: item.title,
                status: item.available ? "Available" : "Borrowed",
              };
              if (item.id.startsWith("B-0") && !item.id.startsWith("B-000")) {
                map[item.id.replace("B-0", "B-000")] = map[item.id];
              }
            });
            setBooks(map);
            try {
              localStorage.setItem("library_books", JSON.stringify(data.books));
            } catch (e) {}
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/books, using local fallback");
      }

      try {
        const saved = localStorage.getItem("library_books");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map: Record<string, Book> = { ...MOCK_BOOKS };
            parsed.forEach((item: any) => {
              map[item.id] = {
                id: item.id,
                title: item.title,
                status: item.available ? "Available" : "Borrowed",
              };
              if (item.id.startsWith("B-0") && !item.id.startsWith("B-000")) {
                map[item.id.replace("B-0", "B-000")] = map[item.id];
              }
            });
            setBooks(map);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBooks();
  }, []);

  const syncBookToLocalStorage = (bookId: string, isAvailable: boolean) => {
    try {
      const saved = localStorage.getItem("library_books");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((b: any) => {
            if (b.id === bookId || b.id === bookId.replace("B-000", "B-0")) {
              return { ...b, available: isAvailable, status: isAvailable ? "ว่าง" : "ถูกยืม" };
            }
            return b;
          });
          localStorage.setItem("library_books", JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Keep focus on input automatically for barcode scanner
  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    }, 2000);
    return () => clearInterval(focusInterval);
  }, []);

  const addLog = (type: "success" | "error" | "info" | "return", message: string) => {
    setLogs((prev) => [{ id: Math.random().toString(), time: new Date(), type, message }, ...prev].slice(0, 15));
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputValue.trim().toUpperCase();
    setInputValue("");

    if (!code) return;

    if (code.startsWith("U-")) {
      const user = MOCK_USERS[code as keyof typeof MOCK_USERS];
      if (user) {
        setCurrentUser(user);
        addLog("info", `เข้าสู่ระบบ: ${user.name} (${user.role === 'student' ? 'นักเรียน' : 'คุณครู'})`);
      } else {
        addLog("error", `ไม่พบข้อมูลสมาชิก: ${code}`);
      }
    } else if (code.startsWith("B-")) {
      const book = books[code];
      if (!book) {
        addLog("error", `ไม่พบข้อมูลหนังสือรหัส: ${code}`);
        return;
      }

      if (book.status === "Borrowed") {
        // Return logic
        setBooks((prev) => ({
          ...prev,
          [code]: { ...book, status: "Available", borrowerId: undefined },
        }));
        syncBookToLocalStorage(code, true);

        // Notify server API
        fetch("/api/return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: code }),
        }).catch((err) => console.warn("API return sync error:", err));

        addLog("return", `คืนหนังสือสำเร็จ: ${book.title}`);
        
        // Update user limits if they are the one returning
        if (currentUser && currentUser.id === book.borrowerId) {
          setCurrentUser((prev) => prev ? ({ ...prev, borrowed: prev.borrowed - 1 }) : prev);
        }
      } else {
        // Borrow logic
        if (!currentUser) {
          addLog("error", `กรุณาสแกนบัตรสมาชิกก่อนยืมหนังสือ!`);
          return;
        }

        if (currentUser.borrowed >= currentUser.limit) {
          addLog("error", `ยืมไม่ได้: ${currentUser.name} ยืมครบโควต้าแล้ว (${currentUser.limit} เล่ม)`);
          return;
        }

        setBooks((prev) => ({
          ...prev,
          [code]: { ...book, status: "Borrowed", borrowerId: currentUser.id },
        }));
        syncBookToLocalStorage(code, false);

        // Notify server API
        fetch("/api/borrow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: code, userId: currentUser.id, userName: currentUser.name }),
        }).catch((err) => console.warn("API borrow sync error:", err));

        setCurrentUser((prev) => prev ? ({ ...prev, borrowed: prev.borrowed + 1 }) : prev);
        addLog("success", `ยืมหนังสือสำเร็จ: ${book.title}`);
      }
    } else {
      addLog("error", `รูปแบบบาร์โค้ดไม่ถูกต้อง กรุณาตรวจสอบแป้นพิมพ์ภาษาไทย/อังกฤษ: ${code}`);
    }
  };

  const clearSession = () => {
    setCurrentUser(null);
    addLog("info", "รีเซ็ตหน้าจอ พร้อมรับผู้ใช้งานคนถัดไป");
    inputRef.current?.focus();
  };

  if (role === "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto my-10">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">หน้านี้สำหรับเจ้าหน้าที่และคุณครูเท่านั้น</h2>
        <p className="text-slate-500 max-w-md mb-6 text-sm">
          นักเรียนสามารถยืมหนังสือได้ผ่านเมนู "สแกนยืมด้วยมือถือ" หรือนำหนังสือมาให้คุณครูสแกนที่เคาน์เตอร์ครับ
        </p>
        <Link
          href="/search"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
        >
          กลับไปหน้าค้นหาหนังสือ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col gap-8">
      
      {/* 1. Main Scan Area */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-[40px] shadow-xl text-white border-4 border-slate-800 p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Mascot badge */}
        <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-md border-4 border-amber-400 mb-4 relative z-10">
          <img src="/avatar_teacher.jpg" alt="บรรณารักษ์" className="w-full h-full object-cover rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2">
            <span>โต๊ะเคาน์เตอร์บรรณารักษ์ (Staff Counter Desk)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            จุดบริการ ยืม - คืน หนังสือ
          </h1>
          <p className="text-slate-300 mb-6 text-sm sm:text-base font-medium">
            สแกนบาร์โค้ดบัตรสมาชิก แล้วตามด้วยบาร์โค้ดหนังสือ (หรือสแกนหนังสือทันทีเพื่อคืน)
          </p>
          
          <form onSubmit={handleScan} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <ScanLine className="h-7 w-7 text-amber-400 animate-pulse" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="block w-full pl-16 pr-6 py-5 text-xl sm:text-2xl font-mono font-bold text-center text-slate-900 bg-white border-4 border-amber-400 rounded-full focus:ring-4 focus:ring-amber-400/40 focus:border-amber-500 transition-all placeholder:text-slate-400 shadow-xl"
              placeholder="รอรับข้อมูลบาร์โค้ดจากเครื่องสแกน..."
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="hidden">Submit</button>
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-bounce shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        
        {/* 2. Left Column: User Context */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">ข้อมูลสมาชิกที่กำลังทำรายการ</h2>
            {currentUser && (
              <button 
                onClick={clearSession} 
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-full font-bold transition-colors text-xs cursor-pointer whitespace-nowrap shrink-0"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>เคลียร์หน้าจอ / รับคนถัดไป</span>
              </button>
            )}
          </div>

          <div className={`p-8 rounded-3xl border-2 transition-all duration-300 flex-grow shadow-sm relative overflow-hidden ${
            currentUser 
              ? 'bg-white border-sky-200' 
              : 'bg-slate-50/50 border-slate-200 border-dashed flex flex-col items-center justify-center min-h-[300px]'
          }`}>
            
            {!currentUser ? (
              <div className="text-center text-slate-400 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                  <UserCircle className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-lg font-bold text-slate-600">กรุณาสแกนบัตรสมาชิก (U-xxxx)</p>
                <p className="text-xs mt-1 text-slate-400 max-w-sm">เพื่อเริ่มต้นการยืมหนังสือ หรือหากต้องการ &quot;คืนหนังสือ&quot; สามารถสแกนหนังสือ (B-xxxx) ได้ทันที</p>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                      {currentUser.role === 'student' ? 'นักเรียน' : 'คุณครู / บุคลากร'}
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-1">{currentUser.name}</h2>
                    <p className="text-slate-500 font-medium text-xs">
                      {currentUser.role === 'student' ? `ชั้นเรียน: ${currentUser.room}` : `กลุ่มสาระ: ${currentUser.department}`} • รหัส: {currentUser.id}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">โควต้าการยืม</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-sky-600">{currentUser.borrowed}</span>
                      <span className="text-lg font-bold text-slate-400">/ {currentUser.limit}</span>
                      <span className="text-xs font-medium text-slate-500 ml-1">เล่ม</span>
                    </div>
                    {currentUser.borrowed >= currentUser.limit && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full">
                        <AlertCircle className="w-3 h-3" /> ยืมครบโควต้าแล้ว
                      </div>
                    )}
                  </div>

                  <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">ค่าปรับค้างชำระ</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-rose-600">0</span>
                      <span className="text-xs font-medium text-slate-500 ml-1">บาท</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Right Column: Live Logs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">ประวัติการทำรายการสด</h2>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Scanner</span>
            </span>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[450px] overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <ArrowRightLeft className="w-10 h-10 mb-2" />
                  <p className="font-semibold text-sm">ยังไม่มีรายการสแกน</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className={`p-3.5 rounded-2xl flex gap-3 text-xs shadow-sm border ${
                    log.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                    log.type === 'return' ? 'bg-blue-50 border-blue-100 text-blue-900' :
                    log.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-900' :
                    'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <div className="mt-0.5 shrink-0">
                      {log.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {log.type === 'return' && <ArrowRightLeft className="w-5 h-5 text-blue-500" />}
                      {log.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                      {log.type === 'info' && <UserCircle className="w-5 h-5 text-slate-400" />}
                    </div>
                    
                    <div className="flex-grow">
                      <p className={`font-bold text-sm mb-0.5 ${
                        log.type === 'success' ? 'text-emerald-700' :
                        log.type === 'return' ? 'text-blue-700' :
                        log.type === 'error' ? 'text-rose-700' :
                        'text-slate-800'
                      }`}>
                        {log.message.split(':')[0]}
                      </p>
                      {log.message.includes(':') && (
                        <p className="opacity-90">{log.message.split(':')[1]}</p>
                      )}
                      <p className="text-[10px] opacity-60 mt-1 font-mono">{log.time.toLocaleTimeString('th-TH')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
