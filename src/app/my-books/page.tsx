"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, AlertCircle, ChevronRight, RotateCcw, CheckCircle2, Search } from "lucide-react";

interface BorrowedBookItem {
  id: string | number;
  title: string;
  author?: string;
  borrowDate: string;
  dueDate?: string;
  returnDate?: string;
  status: string;
  statusColor: string;
}

const DEFAULT_ACTIVE_BOOKS: BorrowedBookItem[] = [
  { id: 1, title: "คอมพิวเตอร์พื้นฐาน ม.4-6", author: "กระทรวงศึกษาธิการ", borrowDate: "05 ต.ค. 2568", dueDate: "19 ต.ค. 2568", status: "ปกติ", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: 2, title: "Harry Potter (ชุด)", author: "J.K. Rowling", borrowDate: "01 ต.ค. 2568", dueDate: "15 ต.ค. 2568", status: "ใกล้ถึงกำหนด", statusColor: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: 3, title: "การ์ตูนความรู้รอบโลก", author: "นานมีบุ๊คส์", borrowDate: "28 ก.ย. 2568", dueDate: "12 ต.ค. 2568", status: "เกินกำหนด", statusColor: "text-rose-600 bg-rose-50 border-rose-200" },
];

const DEFAULT_HISTORY_BOOKS: BorrowedBookItem[] = [
  { id: 4, title: "โลกของสัตว์", author: "สำนักพิมพ์ บีซีดี", borrowDate: "20 ก.ย. 2568", returnDate: "27 ก.ย. 2568", status: "คืนแล้ว", statusColor: "text-slate-600 bg-slate-50 border-slate-200" },
  { id: 5, title: "เวทมนตร์และความลับ", author: "ผู้แต่ง นิรนาม", borrowDate: "15 ก.ย. 2568", returnDate: "22 ก.ย. 2568", status: "คืนแล้ว", statusColor: "text-slate-600 bg-slate-50 border-slate-200" },
  { id: 6, title: "สารานุกรมสัตว์โลก", author: "National Geographic", borrowDate: "10 ก.ย. 2568", returnDate: "17 ก.ย. 2568", status: "คืนแล้ว", statusColor: "text-slate-600 bg-slate-50 border-slate-200" },
  { id: 7, title: "เทคโนโลยีและนวัตกรรม", author: "สสวท.", borrowDate: "05 ก.ย. 2568", returnDate: "10 ก.ย. 2568", status: "คืนแล้ว", statusColor: "text-slate-600 bg-slate-50 border-slate-200" },
];

export default function MyBooksPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [activeBooks, setActiveBooks] = useState<BorrowedBookItem[]>(DEFAULT_ACTIVE_BOOKS);
  const [historyBooks, setHistoryBooks] = useState<BorrowedBookItem[]>(DEFAULT_HISTORY_BOOKS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBorrowed = async () => {
      let serverBorrowed: BorrowedBookItem[] | null = null;
      let serverHistory: BorrowedBookItem[] | null = null;

      try {
        const res = await fetch("/api/borrow", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.borrowed && Array.isArray(data.borrowed)) {
            serverBorrowed = data.borrowed;
          }
          if (data.history && Array.isArray(data.history)) {
            serverHistory = data.history;
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/borrow, using local fallback");
      }

      // Merge local borrowed records so items borrowed in this session are retained
      let mergedBorrowed = serverBorrowed || DEFAULT_ACTIVE_BOOKS;
      let mergedHistory = serverHistory || DEFAULT_HISTORY_BOOKS;

      try {
        const saved = localStorage.getItem("my_borrowed_books");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(mergedBorrowed.map((b: any) => String(b.bookId || b.id)));
            const newLocals = parsed.filter((b: any) => !existingIds.has(String(b.bookId || b.id)));
            mergedBorrowed = [...newLocals, ...mergedBorrowed];
          }
        }
        localStorage.setItem("my_borrowed_books", JSON.stringify(mergedBorrowed));

        const savedHist = localStorage.getItem("my_borrowed_history");
        if (savedHist) {
          const parsedHist = JSON.parse(savedHist);
          if (Array.isArray(parsedHist) && parsedHist.length > 0) {
            const existingHistIds = new Set(mergedHistory.map((b: any) => String(b.id)));
            const newHistLocals = parsedHist.filter((b: any) => !existingHistIds.has(String(b.id)));
            mergedHistory = [...newHistLocals, ...mergedHistory];
          }
        }
        localStorage.setItem("my_borrowed_history", JSON.stringify(mergedHistory));
      } catch (e) {
        console.error(e);
      }

      setActiveBooks(mergedBorrowed);
      setHistoryBooks(mergedHistory);
    };
    fetchBorrowed();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReturnBook = async (book: BorrowedBookItem) => {
    if (confirm(`คุณต้องการคืนหนังสือ "${book.title}" ใช่หรือไม่?`)) {
      const bookIdentifier = (book as any).bookId || book.id;

      try {
        await fetch("/api/return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: bookIdentifier, recordId: book.id }),
        });
      } catch (err) {
        console.warn("API return error:", err);
      }

      const newActive = activeBooks.filter((b) => b.id !== book.id && b.title !== book.title);
      const returnedItem: BorrowedBookItem = {
        ...book,
        returnDate: new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }),
        status: "คืนแล้ว",
        statusColor: "text-slate-600 bg-slate-50 border-slate-200",
      };
      const newHistory = [returnedItem, ...historyBooks];

      setActiveBooks(newActive);
      setHistoryBooks(newHistory);

      try {
        localStorage.setItem("my_borrowed_books", JSON.stringify(newActive));
        localStorage.setItem("my_borrowed_history", JSON.stringify(newHistory));

        const savedCatalog = localStorage.getItem("library_books");
        if (savedCatalog) {
          const parsedCatalog = JSON.parse(savedCatalog);
          if (Array.isArray(parsedCatalog)) {
            const updatedCatalog = parsedCatalog.map((item: any) => {
              if (item.id === bookIdentifier || item.id === book.id || item.title === book.title) {
                return { ...item, available: true, status: "ว่าง" };
              }
              return item;
            });
            localStorage.setItem("library_books", JSON.stringify(updatedCatalog));
          }
        }
      } catch (e) {
        console.error(e);
      }

      showToast(`คืนหนังสือ "${book.title}" เรียบร้อยแล้ว ขอบคุณที่ใช้บริการค่ะ`);
    }
  };

  const currentList = activeTab === "active" ? activeBooks : historyBooks;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className="px-5 py-3.5 rounded-2xl shadow-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 border border-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            หนังสือของฉัน
          </h1>
          <p className="text-slate-500 font-medium">ติดตามรายการหนังสือที่คุณกำลังยืมและประวัติย้อนหลัง</p>
        </div>

        <Link
          href="/search"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm border border-blue-200 flex items-center gap-2 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>ค้นหาหนังสือเพิ่ม</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-8 pt-6 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab("active")}
            className={`pb-4 font-bold text-base transition-colors relative cursor-pointer ${activeTab === 'active' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            กำลังยืม ({activeBooks.length})
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`pb-4 font-bold text-base transition-colors relative cursor-pointer ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ประวัติการยืม ({historyBooks.length})
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {currentList.length > 0 ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap">ลำดับ</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap">ชื่อหนังสือ</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap">วันที่ยืม</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap">{activeTab === 'active' ? 'กำหนดคืน' : 'วันที่คืน'}</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-center whitespace-nowrap">สถานะ</th>
                      {activeTab === 'active' && (
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-right whitespace-nowrap">ดำเนินการ</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentList.map((book, idx) => (
                      <tr key={book.id || idx} className="hover:bg-sky-50/30 transition-colors">
                        <td className="px-6 py-5 text-slate-400 font-medium whitespace-nowrap">{idx + 1}</td>
                        <td className="px-6 py-5 min-w-[200px]">
                          <p className="font-bold text-slate-800">{book.title}</p>
                          {book.author && <p className="text-xs text-slate-500 font-medium mt-1">ผู้แต่ง: {book.author}</p>}
                        </td>
                        <td className="px-6 py-5 text-slate-600 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" /> <span>{book.borrowDate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-600 font-medium whitespace-nowrap">
                          {activeTab === 'active' ? book.dueDate || "14 วันหลังจากยืม" : book.returnDate}
                        </td>
                        <td className="px-6 py-5 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${book.statusColor}`}>
                            {book.status === 'เกินกำหนด' && <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
                            {book.status === 'ใกล้ถึงกำหนด' && <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />}
                            {book.status === 'คืนแล้ว' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500 shrink-0" />}
                            <span>{book.status}</span>
                          </span>
                        </td>
                        {activeTab === 'active' && (
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleReturnBook(book)}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer whitespace-nowrap"
                            >
                              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                              <span>คืนหนังสือ</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-28 h-28 mb-4 opacity-50 grayscale">
                <img src="/hero-elephant.jpg" alt="No data" className="w-full h-full object-cover rounded-full" />
              </div>
              <p className="text-base font-bold text-slate-700">ไม่มีรายการในส่วนนี้</p>
              <p className="text-sm font-medium mt-1 text-slate-400">คุณสามารถไปเลือกยืมหนังสือได้ที่คลังหนังสือเลยครับ</p>
              <Link
                href="/search"
                className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm"
              >
                ไปเลือกยืมหนังสือ
              </Link>
            </div>
          )}
          
          <div className="mt-6 flex justify-between items-center text-sm font-medium text-blue-600">
            <span>แสดง 1 ถึง {currentList.length} จากทั้งหมด {currentList.length} รายการ</span>
            <Link href="/search" className="hover:underline flex items-center gap-1">
              ไปที่คลังหนังสือทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
