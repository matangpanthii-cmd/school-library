"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Book, 
  Users, 
  BookmarkCheck, 
  AlertTriangle, 
  ChevronRight, 
  BookOpen, 
  GraduationCap, 
  ScanLine, 
  ArrowRightLeft,
  Search,
  Sparkles,
  ShieldCheck,
  FileText,
  RotateCcw,
  Globe,
  Printer,
  ShieldAlert
} from "lucide-react";
import { INITIAL_BOOKS, BookItem } from "@/data/initialBooks";

export default function AdminDashboard() {
  const router = useRouter();
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [role, setRole] = useState<"admin" | "student" | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (savedRole === "student") {
      setRole("student");
    } else {
      setRole("admin");
    }

    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        if (res.ok) {
          const data = await res.json();
          if (data.books && Array.isArray(data.books) && data.books.length > 0) {
            setBooks(data.books);
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
            setBooks(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBooks();
  }, []);

  if (role === "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto my-10">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">หน้าระบบหลังบ้านสำหรับแอดมินและคุณครูเท่านั้น</h2>
        <p className="text-slate-500 max-w-md mb-6 text-sm">
          คุณกำลังเข้าใช้งานในบัญชีนักเรียน หากเป็นคุณครูหรือเจ้าหน้าที่ กรุณาเข้าสู่ระบบผ่านแท็บแอดมินครับ
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            กลับหน้าบ้านนักเรียน
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            เข้าสู่ระบบแอดมิน
          </Link>
        </div>
      </div>
    );
  }

  const totalBooksCount = 1274 + books.length;
  const activeBorrowedCount = books.filter((b) => !b.available).length + 88;
  const overdueCount = 12;

  const categoryCounts = {
    academic: books.filter((b) => b.categoryId === "academic").length + 390,
    fiction: books.filter((b) => b.categoryId === "fiction").length + 318,
    comic: books.filter((b) => b.categoryId === "comic").length + 208,
    kids: books.filter((b) => b.categoryId === "kids").length + 154,
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Admin Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>ระบบบริหารจัดการห้องสมุด (หลังบ้าน)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
            แผงควบคุมระบบและเคาน์เตอร์บริการ
          </h2>
          <p className="text-slate-300 font-medium text-sm mb-5">
            จัดการการยืม-คืน ตรวจนับคลังหนังสือ พิมพ์บาร์โค้ด และดูสถิติผู้ใช้งานแบบเรียลไทม์
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/counter"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>เปิดโต๊ะเคาน์เตอร์ ยืม-คืน</span>
            </Link>
            <Link
              href="/admin/books"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>จัดการคลังหนังสือ ({totalBooksCount})</span>
            </Link>
            <Link
              href="/admin/stats"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>รายงานสถิติ</span>
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              target="_blank"
            >
              <Globe className="w-4 h-4" />
              <span>เปิดดูหน้าบ้านนักเรียน</span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 bg-slate-800/80 p-2.5 rounded-2xl border-2 border-slate-700 shadow-xl overflow-hidden w-36 h-36 items-center justify-center">
          <img src="/avatar_teacher.jpg" alt="ครูปัณฑิตา" className="w-full h-full object-cover rounded-xl" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/books" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">หนังสือทั้งหมดในระบบ</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-slate-800">{totalBooksCount.toLocaleString()}</h3>
              <span className="text-xs font-semibold text-slate-500">เล่ม</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/profile" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-emerald-300 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">สมาชิกนักเรียน/ครู</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-slate-800">535</h3>
              <span className="text-xs font-semibold text-slate-500">คน</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/counter" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-amber-300 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">หนังสือที่ยืมอยู่ขณะนี้</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-slate-800">{activeBorrowedCount}</h3>
              <span className="text-xs font-semibold text-slate-500">เล่ม</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/stats" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-rose-300 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">ค้างคืนเกินกำหนด</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black text-rose-600">{overdueCount}</h3>
              <span className="text-xs font-semibold text-rose-600">เล่ม</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Management Shortcuts & Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Categories Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">การกระจายตามหมวดหมู่</h3>
            <Link href="/admin/books" className="text-xs font-bold text-blue-600 hover:underline">
              จัดการคลัง
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-blue-900">วิชาการ</p>
                  <p className="text-xs font-semibold text-blue-500">{categoryCounts.academic} เล่ม</p>
                </div>
              </div>
              <Link href="/admin/books?category=academic" className="text-xs font-bold text-blue-600 hover:underline">ดู</Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm shadow-rose-200">
                  <Book className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-rose-900">นิยาย</p>
                  <p className="text-xs font-semibold text-rose-500">{categoryCounts.fiction} เล่ม</p>
                </div>
              </div>
              <Link href="/admin/books?category=fiction" className="text-xs font-bold text-rose-600 hover:underline">ดู</Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white shadow-sm shadow-purple-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-purple-900">การ์ตูน / การ์ตูนความรู้</p>
                  <p className="text-xs font-semibold text-purple-500">{categoryCounts.comic} เล่ม</p>
                </div>
              </div>
              <Link href="/admin/books?category=comic" className="text-xs font-bold text-purple-600 hover:underline">ดู</Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-900">หนังสือเด็ก</p>
                  <p className="text-xs font-semibold text-amber-500">{categoryCounts.kids} เล่ม</p>
                </div>
              </div>
              <Link href="/admin/books?category=kids" className="text-xs font-bold text-amber-600 hover:underline">ดู</Link>
            </div>
          </div>
        </div>

        {/* Quick Inventory Table & Actions */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">รายการหนังสือล่าสุดในคลัง</h3>
              <p className="text-xs text-slate-400 font-medium">รายการหนังสือที่พร้อมให้บริการและยืมคืน</p>
            </div>
            <Link href="/admin/books" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              จัดการทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold">
                <tr>
                  <th className="p-3">รหัส</th>
                  <th className="p-3">ชื่อหนังสือ</th>
                  <th className="p-3">หมวดหมู่</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {books.slice(0, 6).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-700">{b.id}</td>
                    <td className="p-3 text-slate-800 font-semibold">{b.title}</td>
                    <td className="p-3 text-slate-500 text-xs">{b.category}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.available ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/books?q=${encodeURIComponent(b.id)}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        แก้ไข/บาร์โค้ด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
