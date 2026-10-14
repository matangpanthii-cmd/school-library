"use client";

import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Link from "next/link";
import { BookOpen, Users, AlertTriangle, TrendingUp, TrendingDown, Minus, Printer, FileText, ShieldAlert } from "lucide-react";
import { INITIAL_BOOKS, BookItem } from "@/data/initialBooks";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default function AdminStatsPage() {
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [timeRange, setTimeRange] = useState("เดือนนี้ (ตุลาคม)");
  const [printDate, setPrintDate] = useState("");
  const [role, setRole] = useState<"admin" | "student" | null>(null);

  useEffect(() => {
    setPrintDate(new Date().toLocaleDateString("th-TH"));
    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    setRole(savedRole === "student" ? "student" : "admin");

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

  // Compute live category statistics
  const catAcademic = books.filter((b) => b.categoryId === "academic").length + 390;
  const catFiction = books.filter((b) => b.categoryId === "fiction").length + 318;
  const catComic = books.filter((b) => b.categoryId === "comic").length + 208;
  const catKids = books.filter((b) => b.categoryId === "kids").length + 154;
  const catOther = books.filter((b) => b.categoryId === "other").length + 116;

  const categoryData = [
    { name: "วิชาการ", count: catAcademic, color: "bg-emerald-500", trend: "up" },
    { name: "นิยาย", count: catFiction, color: "bg-emerald-400", trend: "up" },
    { name: "การ์ตูน / ความรู้", count: catComic, color: "bg-amber-400", trend: "same" },
    { name: "หนังสือเด็ก", count: catKids, color: "bg-amber-300", trend: "down" },
    { name: "อื่นๆ และทั่วไป", count: catOther, color: "bg-rose-400", trend: "same" },
  ];

  const totalCatalogBooks = categoryData.reduce((acc, curr) => acc + curr.count, 0);
  const maxBooks = Math.max(...categoryData.map((d) => d.count));

  const doughnutData = {
    labels: ["นักเรียน", "ครู / บุคลากร"],
    datasets: [
      {
        data: [450, 85],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(236, 72, 153, 0.8)"],
        borderWidth: 0,
      },
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  if (role === "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto my-10">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">หน้ารายงานสถิติสำหรับคุณครูเท่านั้น</h2>
        <p className="text-slate-500 max-w-md mb-6 text-sm">
          นักเรียนสามารถดูประวัติการยืมหนังสือของตนเองได้ที่เมนู "หนังสือของฉัน" ครับ
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex-grow flex flex-col gap-6">
      <style jsx global>{`
        @media print {
          header, aside, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-area {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" /> สถิติและรายงานผล (ระบบหลังบ้าน)
          </h1>
          <p className="text-slate-500 font-medium text-sm">ภาพรวมการใช้งานและจำนวนหนังสือในระบบห้องสมุดโรงเรียนอนุบาลช้างน้อย</p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-2.5 shadow-sm font-medium text-sm"
          >
            <option>เดือนนี้ (ตุลาคม)</option>
            <option>เดือนที่แล้ว (กันยายน)</option>
            <option>ปีการศึกษา 2567</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">พิมพ์รายงานสรุป</span>
          </button>
        </div>
      </div>

      {/* Printable Report Title (Only visible in Print) */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-900">รายงานสรุปสถิติห้องสมุดโรงเรียนอนุบาลช้างน้อย</h2>
        <p className="text-sm text-slate-600 mt-1">ข้อมูลประจำช่วงเวลา: {timeRange} | พิมพ์ ณ วันที่ {printDate || "-"}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">การยืมทั้งหมด</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalCatalogBooks.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">สมาชิกที่ใช้งาน</p>
            <h3 className="text-2xl font-bold text-slate-800">535 คน</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">หมวดหมู่ยอดนิยม</p>
            <h3 className="text-2xl font-bold text-slate-800">วิชาการ</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">คืนเกินกำหนด</p>
            <h3 className="text-2xl font-bold text-slate-800">12 เล่ม</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Category Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>สัดส่วนหนังสือแยกตามหมวดหมู่</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">ทั้งหมด {totalCatalogBooks.toLocaleString()} เล่ม</span>
          </div>
          
          <div className="flex-grow flex flex-col justify-center py-2">
            {/* Table Header */}
            <div className="flex text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest px-2">
              <div className="w-14">อันดับ</div>
              <div className="w-44">หมวดหมู่</div>
              <div className="flex-grow">จำนวนหนังสือ (เล่ม)</div>
              <div className="w-24 text-right">สัดส่วน / แนวโน้ม</div>
            </div>

            {/* Table Body */}
            <div className="space-y-5">
              {categoryData.map((item, index) => {
                const percentage = Math.round((item.count / totalCatalogBooks) * 100);
                const barWidth = Math.round((item.count / maxBooks) * 100);
                
                return (
                  <div key={item.name} className="flex items-center text-sm px-2 group">
                    {/* Rank */}
                    <div className="w-14 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Category Name */}
                    <div className="w-44 font-bold text-slate-700 truncate pr-4">
                      {item.name}
                    </div>
                    
                    {/* Progress Bar & Absolute Count */}
                    <div className="flex-grow flex items-center gap-4 pr-6">
                      <div className="h-2 flex-grow bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-right font-bold text-slate-600">
                        {item.count.toLocaleString()} เล่ม
                      </div>
                    </div>
                    
                    {/* Percentage & Trend */}
                    <div className="w-24 flex items-center justify-end gap-2 text-sm">
                      <div className="font-bold text-slate-400">{percentage}%</div>
                      <div className="w-4 flex items-center justify-center">
                        {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
                        {item.trend === 'same' && <Minus className="w-4 h-4 text-slate-300" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Demographics Doughnut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">สัดส่วนผู้ยืมหนังสือ</h3>
          <div className="flex-grow flex items-center justify-center min-h-[250px]">
            <div className="w-full max-w-[240px]">
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: true }} />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">นักเรียน</span>
              </div>
              <span className="font-bold text-slate-800">84%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-slate-600">ครู / บุคลากร</span>
              </div>
              <span className="font-bold text-slate-800">16%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
