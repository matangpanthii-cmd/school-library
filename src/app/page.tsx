"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  School as SchoolIcon
} from "lucide-react";
import { INITIAL_BOOKS, BookItem } from "@/data/initialBooks";

export default function LibraryDashboard() {
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);

  useEffect(() => {
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
      } catch (err) {}

      try {
        const saved = localStorage.getItem("library_books");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBooks(parsed);
          }
        }
      } catch (e) {}
    };
    fetchBooks();
  }, []);

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
      
      {/* 1. Hero Banner in its original place */}
      <div className="bg-gradient-to-r from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-sm border border-sky-100 gap-6">
        
        {/* Banner Pattern Background */}
        <div 
          className="absolute inset-0 opacity-[0.15] mix-blend-multiply pointer-events-none z-0" 
          style={{ backgroundImage: "url('/elephant-bg.jpg')", backgroundSize: '150px', backgroundRepeat: 'repeat' }}
        ></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm text-sky-800 text-xs font-bold mb-3 border border-white/80">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>ยินดีต้อนรับสู่ระบบห้องสมุดดิจิทัล</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0c4a6e] mb-2 leading-tight">
            School Library System
          </h2>
          <p className="text-[#0369a1] font-bold text-base flex items-center gap-2 mb-5">
            <SchoolIcon className="w-5 h-5 text-sky-600" /> ห้องสมุดโรงเรียนอนุบาลช้างน้อย
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/search"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-102 whitespace-nowrap"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">ค้นหาหนังสือ</span>
            </Link>
            <Link
              href="/my-books"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-sky-800 font-semibold text-xs shadow-sm border border-sky-200 flex items-center gap-2 transition-all hover:scale-102 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="whitespace-nowrap">หนังสือของฉัน</span>
            </Link>
            <Link
              href="/scan"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-102 whitespace-nowrap"
            >
              <ScanLine className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">สแกนยืมด้วยมือถือ</span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 bg-white/60 p-2 rounded-full backdrop-blur-sm border-4 border-white shadow-xl overflow-hidden w-36 h-36 items-center justify-center">
          <img src="/hero-elephant.jpg" alt="ช้างน้อยน่ารัก" className="w-full h-full object-cover rounded-full" />
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/search" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap">หนังสือทั้งหมดในระบบ</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{totalBooksCount.toLocaleString()}</h3>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">เล่ม</span>
            </div>
          </div>
        </Link>

        <Link href="/profile" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-emerald-200 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap">สมาชิกที่ใช้งาน</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">535</h3>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">คน</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/counter" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-amber-200 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap">หนังสือที่ยืมอยู่</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{activeBorrowedCount}</h3>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">เล่ม</span>
            </div>
          </div>
        </Link>

        <Link href="/my-books" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md hover:border-rose-200 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate whitespace-nowrap">ค้างคืนเกินกำหนด</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-black text-rose-600 tracking-tight">{overdueCount}</h3>
              <span className="text-xs font-medium text-rose-600 whitespace-nowrap">เล่ม</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Main Content: Popular Categories + Book Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Popular Categories */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">หมวดหมู่ยอดนิยม</h3>
            <Link href="/search" className="text-xs font-bold text-blue-600 hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          
          <div className="space-y-3">
            <Link href="/search?category=academic" className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100 hover:shadow-sm hover:scale-101 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-blue-900">วิชาการ</p>
                  <p className="text-xs font-semibold text-blue-500">{categoryCounts.academic} เล่ม</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </Link>

            <Link href="/search?category=fiction" className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100 hover:shadow-sm hover:scale-101 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm shadow-rose-200">
                  <Book className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-rose-900">นิยาย</p>
                  <p className="text-xs font-semibold text-rose-500">{categoryCounts.fiction} เล่ม</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </Link>

            <Link href="/search?category=comic" className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 hover:shadow-sm hover:scale-101 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white shadow-sm shadow-purple-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-purple-900">การ์ตูน / การ์ตูนความรู้</p>
                  <p className="text-xs font-semibold text-purple-500">{categoryCounts.comic} เล่ม</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </Link>

            <Link href="/search?category=kids" className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 hover:shadow-sm hover:scale-101 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-200">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-900">หนังสือเด็ก</p>
                  <p className="text-xs font-semibold text-amber-500">{categoryCounts.kids} เล่ม</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>

        {/* Recommended Books Carousel */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">หนังสือแนะนำและรายการล่าสุด</h3>
              <p className="text-xs text-slate-400 font-medium">คลิกที่เล่มเพื่อดูข้อมูล สแกนบาร์โค้ด หรือยืมหนังสือ</p>
            </div>
            <Link href="/search" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-hide">
            {books.slice(0, 8).map((book) => (
              <Link 
                key={book.id} 
                href={`/search?q=${encodeURIComponent(book.title)}`}
                className="group cursor-pointer min-w-[160px] sm:min-w-[180px] snap-start shrink-0"
              >
                <div 
                  className={`w-full aspect-[2/3] bg-cover bg-center rounded-2xl mb-3 shadow-md shadow-slate-200 group-hover:shadow-xl group-hover:-translate-y-2 group-hover:scale-102 transition-all duration-300 flex flex-col justify-between p-3 relative border-l-8 border-black/20 overflow-hidden ${book.gradient || ""}`} 
                  style={{ backgroundImage: `url('${book.image || "/cover_academic.jpg"}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 z-0"></div>
                  
                  <div className="relative z-10 w-full flex justify-between items-center text-white/80">
                    <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                      {book.id}
                    </span>
                    <BookOpen className="w-4 h-4 text-white/80" />
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-white font-serif font-bold text-center text-xs leading-snug line-clamp-2">
                      {book.title}
                    </h4>
                    <div className="text-white/70 text-[9px] text-center truncate mt-1">
                      {book.author}
                    </div>
                  </div>
                </div>

                <p className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors px-1">
                  {book.title}
                </p>
                <div className="mt-1.5 px-1 flex items-center justify-between text-[10px]">
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 font-bold rounded">
                    {book.category}
                  </span>
                  <span className={`font-bold ${book.available ? "text-emerald-600" : "text-rose-500"}`}>
                    {book.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
