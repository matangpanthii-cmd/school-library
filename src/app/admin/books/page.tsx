"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Sparkles, 
  AlertCircle,
  Check,
  RotateCcw,
  QrCode,
  Maximize2,
  Printer,
  Copy,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2
} from "lucide-react";
import Barcode from "@/components/Barcode";
import Link from "next/link";
import { INITIAL_BOOKS, BookItem } from "@/data/initialBooks";

const CATEGORIES_CONFIG = [
  { id: "all", name: "หมวดหมู่ทั้งหมด", color: "text-slate-700", bg: "bg-slate-100" },
  { id: "academic", name: "วิชาการ", color: "text-blue-700", bg: "bg-blue-100" },
  { id: "fiction", name: "นิยาย", color: "text-rose-700", bg: "bg-rose-100" },
  { id: "comic", name: "การ์ตูน", color: "text-purple-700", bg: "bg-purple-100" },
  { id: "kids", name: "หนังสือเด็ก", color: "text-amber-700", bg: "bg-amber-100" },
  { id: "other", name: "อื่นๆ", color: "text-slate-600", bg: "bg-slate-100" },
];

const COVER_PRESETS = [
  { label: "วิชาการ", src: "/cover_academic.jpg" },
  { label: "นิยาย", src: "/cover_fiction.jpg" },
  { label: "การ์ตูน", src: "/cover_comic.jpg" },
  { label: "เด็ก", src: "/cover_kids.jpg" },
  { label: "เทคโน", src: "/cover_tech.jpg" },
  { label: "มาสคอต", src: "/hero-elephant.jpg" },
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "title" | "pages">("latest");
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [role, setRole] = useState<"admin" | "student" | null>(null);

  // Modal State for Add / Edit Book
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    author: "",
    isbn: "",
    pages: 150,
    categoryId: "academic",
    image: "/cover_academic.jpg",
    available: true,
  });

  // Barcode View Modals
  const [enlargedBarcodeBook, setEnlargedBarcodeBook] = useState<BookItem | null>(null);
  const [showBarcodeSheet, setShowBarcodeSheet] = useState(false);
  const [barcodeDisplayMode, setBarcodeDisplayMode] = useState<"barcode" | "qrcode">("qrcode");
  const [copiedId, setCopiedId] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "danger" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getQrUrl = (bookId: string) => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const protocol = window.location.protocol;
      return `${protocol}//${host}/scan?borrow=${bookId}`;
    }
    return bookId;
  };

  // Load books & check role
  useEffect(() => {
    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    setRole(savedRole === "admin" ? "admin" : "student");

    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/books");
        if (res.ok) {
          const data = await res.json();
          if (data.books && Array.isArray(data.books) && data.books.length > 0) {
            setBooks(data.books);
            setSelectedBook(data.books[0]);
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
            setSelectedBook(parsed[0]);
            return;
          }
        }
      } catch (e) {}
      setSelectedBook(INITIAL_BOOKS[0]);
    };
    fetchBooks();
  }, []);

  const saveBooks = (newBooks: BookItem[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem("library_books", JSON.stringify(newBooks));
    } catch (e) {}
  };

  const handleOpenAddModal = () => {
    const nextNum = books.length + 1;
    const formattedId = `B-${String(nextNum).padStart(3, "0")}`;
    setFormData({
      id: formattedId,
      title: "",
      author: "",
      isbn: `978-616-00-${String(Math.floor(100 + Math.random() * 900))}-1`,
      pages: 180,
      categoryId: "academic",
      image: "/cover_academic.jpg",
      available: true,
    });
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: BookItem) => {
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      pages: book.pages,
      categoryId: book.categoryId,
      image: book.image || "/cover_academic.jpg",
      available: book.available,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือ "${title}" (${id}) ออกจากระบบ?`)) {
      try {
        await fetch(`/api/books?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (err) {}

      const updated = books.filter((b) => b.id !== id);
      saveBooks(updated);
      if (selectedBook?.id === id) {
        setSelectedBook(updated[0] || null);
      }
      showToast(`ลบหนังสือ "${title}" เรียบร้อยแล้ว`, "danger");
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("กรุณากรอกชื่อหนังสือ");
    if (!formData.author.trim()) return alert("กรุณากรอกชื่อผู้แต่ง");

    const catObj = CATEGORIES_CONFIG.find((c) => c.id === formData.categoryId);
    const categoryName = catObj ? catObj.name : "อื่นๆ";

    const bookPayload: BookItem = {
      id: formData.id.trim().toUpperCase() || `B-${Date.now().toString().slice(-3)}`,
      title: formData.title.trim(),
      author: formData.author.trim(),
      isbn: formData.isbn.trim() || "-",
      pages: Number(formData.pages) || 100,
      categoryId: formData.categoryId,
      category: categoryName,
      image: formData.image,
      status: formData.available ? "ว่าง" : "ถูกยืม",
      available: formData.available,
    };

    try {
      await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookPayload),
      });
    } catch (err) {}

    if (modalMode === "add") {
      const updated = [bookPayload, ...books];
      saveBooks(updated);
      setSelectedBook(bookPayload);
      setIsModalOpen(false);
      showToast(`เพิ่มหนังสือ "${bookPayload.title}" เข้าระบบเรียบร้อย!`, "success");
    } else {
      const updated = books.map((b) => (b.id === formData.id ? { ...b, ...bookPayload } : b));
      saveBooks(updated);
      setSelectedBook(bookPayload);
      setIsModalOpen(false);
      showToast(`บันทึกการแก้ไข "${formData.title}" เรียบร้อยแล้ว`, "success");
    }
  };

  const handleResetToDefault = async () => {
    if (confirm("ต้องการรีเซ็ตคลังหนังสือกลับเป็นข้อมูลเริ่มต้น 10 เล่มหรือไม่?")) {
      try {
        await fetch("/api/reset", { method: "POST" });
        localStorage.removeItem("library_books");
        setBooks(INITIAL_BOOKS);
        setSelectedBook(INITIAL_BOOKS[0]);
        showToast("รีเซ็ตคลังหนังสือกลับเป็นค่าเริ่มต้นแล้ว", "info");
      } catch (e) {
        alert("รีเซ็ตไม่สำเร็จ");
      }
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesCategory = activeCategory === "all" || book.categoryId === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.id.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  }).sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title, "th");
    if (sortBy === "pages") return b.pages - a.pages;
    return 0;
  });

  if (role === "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto my-10">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">หน้าระบบหลังบ้านสำหรับเจ้าหน้าที่เท่านั้น</h2>
        <p className="text-slate-500 max-w-md mb-6 text-sm">
          การจัดการคลังหนังสือและพิมพ์บาร์โค้ดสงวนไว้สำหรับคุณครูและบรรณารักษ์ครับ
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            กลับหน้าแรกห้องสมุด
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

  return (
    <div className="flex flex-col gap-6 w-full h-full pb-10 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50">
          <div className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold text-white ${
            toast.type === "success" ? "bg-emerald-600 border-emerald-500" :
            toast.type === "danger" ? "bg-rose-600 border-rose-500" : "bg-blue-600 border-blue-500"
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <span>ระบบหลังบ้าน</span>
            <span>/</span>
            <span className="text-amber-500 font-bold">จัดการคลังหนังสือ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <span>จัดการคลังหนังสือและบาร์โค้ด</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
              {books.length} เล่ม
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowBarcodeSheet(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-xl shadow-sm text-xs font-bold flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
          >
            <QrCode className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="whitespace-nowrap">แผ่นสติกเกอร์บาร์โค้ด</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="p-2.5 bg-white border border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl shadow-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="รีเซ็ตคลังหนังสือ"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">รีเซ็ต</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">เพิ่มหนังสือใหม่</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, รหัส B-xxx หรือ ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end text-xs font-bold text-slate-600">
          <span>เรียงตาม:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
          >
            <option value="latest">ล่าสุด / ทั้งหมด</option>
            <option value="title">ชื่อหนังสือ (ก-ฮ)</option>
            <option value="pages">จำนวนหน้า</option>
          </select>
          <span className="bg-slate-100 px-3 py-2 rounded-xl text-slate-500">พบ {filteredBooks.length} เล่ม</span>
        </div>
      </div>

      {/* Main Layout: Categories + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Categories Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 px-2">หมวดหมู่หนังสือ</h3>
          {CATEGORIES_CONFIG.map((cat) => {
            const count = books.filter((b) => cat.id === "all" || b.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id ? "bg-amber-400 text-slate-950 font-black shadow-sm" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeCategory === cat.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Books List / Table */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold">
                <tr>
                  <th className="p-4 whitespace-nowrap">รหัส / ปก</th>
                  <th className="p-4 whitespace-nowrap">ชื่อหนังสือและผู้แต่ง</th>
                  <th className="p-4 whitespace-nowrap">หมวดหมู่</th>
                  <th className="p-4 whitespace-nowrap">สถานะ</th>
                  <th className="p-4 text-right whitespace-nowrap">เครื่องมือจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          <img src={b.image || "/cover_academic.jpg"} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-mono font-bold text-sky-700 text-xs bg-sky-50 px-2 py-1 rounded border border-sky-200 whitespace-nowrap">
                          {b.id}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{b.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">{b.author} • {b.pages} หน้า</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        b.available ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setEnlargedBarcodeBook(b)}
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="ดูบาร์โค้ด / คิวอาร์โค้ด"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขข้อมูลหนังสือ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบหนังสือ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal: Add/Edit Book */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-900">
                {modalMode === "add" ? "เพิ่มหนังสือใหม่เข้าระบบ" : "แก้ไขข้อมูลหนังสือ"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">รหัสหนังสือ (Barcode)</label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled={modalMode === "edit"}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="academic">วิชาการ</option>
                    <option value="fiction">นิยาย</option>
                    <option value="comic">การ์ตูน</option>
                    <option value="kids">หนังสือเด็ก</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อหนังสือ *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="เช่น แฮร์รี่ พอตเตอร์"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้แต่ง / สำนักพิมพ์ *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนหน้า</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หน้าปกหนังสือ</label>
                <div className="grid grid-cols-6 gap-2">
                  {COVER_PRESETS.map((c) => (
                    <button
                      type="button"
                      key={c.src}
                      onClick={() => setFormData({ ...formData, image: c.src })}
                      className={`aspect-[3/4] rounded-lg overflow-hidden border-2 p-0.5 ${
                        formData.image === c.src ? "border-blue-600 scale-105" : "border-slate-200 opacity-60"
                      }`}
                    >
                      <img src={c.src} alt={c.label} className="w-full h-full object-cover rounded" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Barcode Sheet */}
      {showBarcodeSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowBarcodeSheet(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">แผ่นสติกเกอร์บาร์โค้ดหนังสือสำหรับสแกน</h3>
                <p className="text-xs text-slate-500">พิมพ์ออกกระดาษหรือสแกนผ่านหน้าจอได้โดยตรง</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> พิมพ์แผ่นบาร์โค้ด
                </button>
                <button onClick={() => setShowBarcodeSheet(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {books.map((b) => (
                <div key={b.id} className="p-3 border border-slate-200 rounded-2xl flex flex-col items-center text-center bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 mb-2">{b.title}</p>
                  <Barcode value={b.id} />
                  <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold">{b.id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enlarged Barcode */}
      {enlargedBarcodeBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEnlargedBarcodeBook(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 relative z-10 text-center">
            <button onClick={() => setEnlargedBarcodeBook(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-800 text-base mb-1">{enlargedBarcodeBook.title}</h3>
            <p className="text-xs font-mono text-sky-700 font-bold mb-4">{enlargedBarcodeBook.id}</p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mb-4">
              <Barcode value={enlargedBarcodeBook.id} />
            </div>
            <p className="text-xs text-slate-400">สามารถใช้เครื่องสแกนบาร์โค้ดหรือกล้องมือถือสแกนภาพนี้ได้ทันที</p>
          </div>
        </div>
      )}

    </div>
  );
}
