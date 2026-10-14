"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserCircle, Book, Calendar, Clock, AlertCircle, Sparkles, School, CheckCircle2, Printer } from "lucide-react";
import JsBarcode from "jsbarcode";

// Component to render Barcode
function Barcode({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width: 2.5,
          height: 70,
          displayValue: true,
          fontSize: 18,
          margin: 0,
          fontOptions: "bold",
          background: "transparent",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [value]);

  return <canvas ref={canvasRef} className="w-full max-w-[280px]"></canvas>;
}

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<"student" | "teacher">("student");
  const [userName, setUserName] = useState("ด.ญ. แมนนะ น่ารัก");
  const [userId, setUserId] = useState("U-1002");
  const [borrowedCount, setBorrowedCount] = useState(2);
  const [historyList, setHistoryList] = useState<Array<{
    id: string;
    title: string;
    borrowDate: string;
    dueDate: string;
    status: "Active" | "Returned";
  }>>([
    { id: "B-0001", title: "แฮร์รี่ พอตเตอร์ กับศิลาอาถรรพ์", borrowDate: "01 ต.ค. 2568", dueDate: "08 ต.ค. 2568", status: "Returned" },
    { id: "B-0003", title: "หลักการเขียนโปรแกรมเบื้องต้น", borrowDate: "05 ต.ค. 2568", dueDate: "19 ต.ค. 2568", status: "Active" },
    { id: "B-0004", title: "ประวัติศาสตร์ไทย 101", borrowDate: "07 ต.ค. 2568", dueDate: "21 ต.ค. 2568", status: "Active" },
  ]);

  useEffect(() => {
    const role = localStorage.getItem('appRole') || localStorage.getItem('userRole');
    const isTeacher = role === 'admin';
    setUserRole(isTeacher ? 'teacher' : 'student');

    const savedName = localStorage.getItem('currentUserName');
    if (savedName) {
      setUserName(savedName);
    } else {
      setUserName(isTeacher ? 'ครูปัณฑิตา คำพัด (บรรณารักษ์)' : 'ด.ญ. แมนนะ น่ารัก');
    }

    const savedId = localStorage.getItem('currentUserId');
    if (savedId) {
      setUserId(savedId);
    } else {
      setUserId(isTeacher ? 'U-2001' : 'U-1002');
    }

    // Load dynamic real-time borrowing data
    const loadRealtimeHistory = async () => {
      let activeList: any[] = [];
      let pastList: any[] = [];

      try {
        const res = await fetch("/api/borrow", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.borrowed) && data.borrowed.length > 0) activeList = data.borrowed;
          if (Array.isArray(data.history) && data.history.length > 0) pastList = data.history;
        }
      } catch (e) {
        console.warn("Using local cache for profile:", e);
      }

      try {
        const savedActive = localStorage.getItem("my_borrowed_books");
        if (savedActive) {
          const parsed = JSON.parse(savedActive);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map(activeList.map((b) => [String(b.bookId || b.id), b]));
            parsed.forEach((b) => map.set(String(b.bookId || b.id), b));
            activeList = Array.from(map.values());
          }
        }

        const savedPast = localStorage.getItem("my_borrowed_history");
        if (savedPast) {
          const parsedH = JSON.parse(savedPast);
          if (Array.isArray(parsedH) && parsedH.length > 0) {
            const mapH = new Map(pastList.map((b) => [String(b.id), b]));
            parsedH.forEach((b) => mapH.set(String(b.id), b));
            pastList = Array.from(mapH.values());
          }
        }
      } catch (e) {
        console.error(e);
      }

      if (activeList.length > 0 || pastList.length > 0) {
        const combined = [
          ...activeList.map((b) => ({
            id: String(b.bookId || (typeof b.id === "string" ? b.id : `B-000${b.id}`)),
            title: b.title,
            borrowDate: b.borrowDate || "ล่าสุด",
            dueDate: b.dueDate || "14 วัน",
            status: "Active" as const
          })),
          ...pastList.map((b) => ({
            id: String(b.bookId || (typeof b.id === "string" ? b.id : `B-000${b.id}`)),
            title: b.title,
            borrowDate: b.borrowDate || "ก่อนหน้า",
            dueDate: b.returnDate || b.dueDate || "คืนแล้ว",
            status: "Returned" as const
          }))
        ];
        setHistoryList(combined);
        setBorrowedCount(activeList.length);
      }
    };

    loadRealtimeHistory();
  }, []);

  const mockStudent = {
    id: userId,
    name: userName,
    role: "student",
    room: "ม.3/1",
    studentId: userId === "U-1002" ? "640124" : userId.replace("U-", "64"),
    borrowed: borrowedCount,
    limit: 3,
    fines: 0,
    avatar: "/avatar_student.jpg",
    history: historyList
  };

  const mockTeacher = {
    id: userId,
    name: userName,
    role: "teacher",
    department: "คอมพิวเตอร์และสารสนเทศ",
    teacherId: userId === "U-2001" ? "T-8899" : userId,
    borrowed: borrowedCount,
    limit: 10,
    fines: 0,
    avatar: "/avatar_teacher.jpg",
    history: historyList
  };

  const user = userRole === "student" ? mockStudent : mockTeacher;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col gap-6">

      {/* Profile Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1e3a8a]">
              {userRole === "student" ? "บัตรประจำตัวนักเรียน (Digital ID)" : "บัตรประจำตัวบุคลากร / บรรณารักษ์"}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
              userRole === "student" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {userRole === "student" ? "นักเรียน" : "เจ้าหน้าที่"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">ใช้แสดงที่หน้าเคาน์เตอร์ห้องสมุดหรือใช้สแกนทำรายการ</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userRole === "teacher" && (
            <Link
              href="/admin/profile"
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>เปิดบัตรเจ้าหน้าที่หลังบ้าน</span>
            </Link>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-md flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 shrink-0" /> <span>พิมพ์บัตร</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("appRole");
              localStorage.removeItem("userRole");
              window.location.href = "/login";
            }}
            className="px-4 py-2 rounded-full text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0"
          >
            <span>สลับบัญชี / ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-id-card, #printable-id-card * {
            visibility: visible;
          }
          #printable-id-card {
            position: absolute;
            left: 50%;
            top: 40px;
            transform: translateX(-50%);
            width: 320px !important;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Col: ID Card (Takes 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div id="printable-id-card" className="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden relative">
            {/* Card Header Pattern */}
            <div className={`h-32 p-6 flex justify-between items-start relative overflow-hidden ${userRole === "student" ? "bg-gradient-to-br from-sky-400 to-blue-600" : "bg-gradient-to-br from-emerald-400 to-teal-600"
              }`}>
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <School className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10 text-white">
                <h3 className="font-black text-xl tracking-tight opacity-90">บัตรห้องสมุดโรงเรียน</h3>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">School Library Card</p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 pt-20 relative text-center">
              <div className="w-28 h-28 mx-auto rounded-full bg-white border-4 border-white shadow-md absolute -top-14 left-1/2 -translate-x-1/2 flex items-center justify-center overflow-hidden">
                <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
              </div>

              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${userRole === "student" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                  {user.role === 'student' ? 'STUDENT / นักเรียน' : 'TEACHER / ครู'}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">{user.name}</h2>
                <p className="text-slate-500 font-bold mt-1">
                  {user.role === 'student' && 'room' in user ? `ห้องเรียน: ${user.room}` : 'department' in user ? `กลุ่มสาระฯ: ${user.department}` : ''}
                </p>
                <div className="mt-6 flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">รหัสประจำตัว</span>
                    <span className="font-bold text-slate-800">{user.role === 'student' ? ('studentId' in user ? user.studentId : '') : ('teacherId' in user ? user.teacherId : '')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">สถานะบัญชี</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> ใช้งานปกติ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Footer */}
            <div className="border-t-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center bg-slate-50/80">
              <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest text-center flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                แสกนที่เคาน์เตอร์
                <Sparkles className="w-4 h-4 text-amber-400" />
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <Barcode value={user.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Stats & History (Takes 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          <h2 className="text-2xl font-bold text-slate-800 hidden lg:block">ภาพรวมการยืม-คืน</h2>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-sky-100 rounded-xl text-sky-600"><Book className="w-6 h-6" /></div>
                <p className="font-bold text-slate-500">จำนวนที่ยืมอยู่</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-800">{user.borrowed}</h3>
                <span className="text-xl font-bold text-slate-400">/ {user.limit}</span>
                <span className="font-medium text-slate-500">เล่ม</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><Clock className="w-6 h-6" /></div>
                <p className="font-bold text-slate-500">คืนล่าช้า</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-800">0</h3>
                <span className="font-medium text-slate-500">เล่ม</span>
              </div>
            </div>

            <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-100 rounded-xl text-rose-600"><AlertCircle className="w-6 h-6" /></div>
                <p className="font-bold text-slate-500">ค่าปรับค้างชำระ</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-rose-600">{user.fines}</h3>
                <span className="font-medium text-slate-500">บาท</span>
              </div>
            </div>
          </div>

          {/* Borrowing History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-grow flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg"><Calendar className="w-5 h-5 text-indigo-600" /></div>
                ประวัติการยืม-คืนล่าสุด
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-slate-500 text-sm">
                  <tr>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider">รายชื่อหนังสือ</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider">วันที่ยืม</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider">กำหนดคืน</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user.history.map((item, idx) => (
                    <tr key={idx} className="hover:bg-sky-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors">{item.title}</p>
                        <p className="text-xs text-slate-400 font-mono mt-1 font-semibold">{item.id}</p>
                      </td>
                      <td className="px-8 py-5 text-slate-600 font-medium">{item.borrowDate}</td>
                      <td className="px-8 py-5 text-slate-600 font-medium">{item.dueDate}</td>
                      <td className="px-8 py-5 text-right">
                        {item.status === 'Active' ? (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200">
                            กำลังยืม
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            คืนแล้ว
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
