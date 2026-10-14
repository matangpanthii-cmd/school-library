"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Search, 
  Filter, 
  BookOpen, 
  ChevronLeft, 
  BookmarkPlus, 
  ArrowRightLeft, 
  RefreshCcw, 
  CheckCircle2, 
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
  ScanLine,
  Printer,
  Copy,
  ExternalLink
} from "lucide-react";
import Barcode from "@/components/Barcode";
import Link from "next/link";

export interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  pages: number;
  categoryId: string;
  category: string;
  image: string;
  status: string;
  available: boolean;
  filter?: string;
  gradient?: string;
  emoji?: string;
}

const INITIAL_BOOKS: BookItem[] = [
  { id: "B-001", title: "คอมพิวเตอร์พื้นฐาน ม.4-6", author: "กระทรวงศึกษาธิการ", isbn: "978-616-576-123-4", pages: 320, categoryId: "academic", category: "วิชาการ", image: "/cover_academic.jpg", status: "ว่าง", available: true },
  { id: "B-002", title: "วรรณกรรมเยาวชน", author: "เจ.เค. โรว์ลิง", isbn: "978-616-04-123-4", pages: 450, categoryId: "fiction", category: "นิยาย", image: "/cover_fiction.jpg", status: "ถูกยืม", available: false },
  { id: "B-003", title: "การ์ตูนความรู้ รอบโลก", author: "นานมีบุ๊คส์", isbn: "978-616-04-567-8", pages: 180, categoryId: "comic", category: "การ์ตูน", image: "/cover_comic.jpg", status: "ว่าง", available: true },
  { id: "B-004", title: "สารานุกรมสัตว์โลก", author: "National Geographic", isbn: "978-616-00-111-1", pages: 200, categoryId: "kids", category: "หนังสือเด็ก", image: "/cover_kids.jpg", status: "ว่าง", available: true },
  { id: "B-005", title: "เทคโนโลยีและนวัตกรรม", author: "สสวท.", isbn: "978-616-00-222-2", pages: 280, categoryId: "academic", category: "วิชาการ", image: "/cover_tech.jpg", status: "ถูกยืม", available: false },
  { id: "B-006", title: "เวทมนตร์และความลับ", author: "ผู้แต่ง นิรนาม", isbn: "978-616-00-333-3", pages: 310, categoryId: "fiction", category: "นิยาย", image: "/cover_fiction.jpg", filter: "hue-rotate-90 saturate-150", status: "ว่าง", available: true },
  { id: "B-007", title: "One Piece เล่ม 1", author: "Eiichiro Oda", isbn: "978-616-00-444-4", pages: 190, categoryId: "comic", category: "การ์ตูน", image: "/cover_comic.jpg", filter: "hue-rotate-180 saturate-200", status: "ว่าง", available: true },
  { id: "B-008", title: "โลกของพืช", author: "สำนักพิมพ์ บีซีดี", isbn: "978-616-00-555-5", pages: 150, categoryId: "kids", category: "หนังสือเด็ก", image: "/cover_kids.jpg", filter: "sepia-[.5] hue-rotate-[-30deg] saturate-150", status: "ว่าง", available: true },
  { id: "B-009", title: "พจนานุกรม ไทย-อังกฤษ", author: "ราชบัณฑิตยสถาน", isbn: "978-616-00-666-6", pages: 500, categoryId: "other", category: "อื่นๆ", image: "/cover_academic.jpg", filter: "grayscale-[.5] sepia-[.3] hue-rotate-[200deg]", status: "ว่าง", available: true },
  { id: "B-010", title: "นิตยสารรายเดือน", author: "สำนักพิมพ์ XYZ", isbn: "978-616-00-777-7", pages: 50, categoryId: "other", category: "อื่นๆ", image: "/hero-elephant.jpg", status: "ว่าง", available: true },
];

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

export default function SearchPage() {
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "title" | "pages">("latest");
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  // Role status (student on the public search page)
  const [role, setRole] = useState<"admin" | "student">("student");

  // Interactive Borrow State
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);

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

  // Generate direct action URL for QR Code (works with ANY standard phone camera app)
  const getQrUrl = (bookId: string) => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const protocol = window.location.protocol;
      return `${protocol}//${host}/scan?borrow=${bookId}`;
    }
    return bookId;
  };

  // Load persisted books and role from server API or localStorage on mount
  useEffect(() => {
    const fetchBooks = async () => {
      let serverBooks: BookItem[] | null = null;
      try {
        const res = await fetch("/api/books", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.books && Array.isArray(data.books) && data.books.length > 0) {
            serverBooks = data.books;
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/books, falling back to local storage");
      }

      let merged: BookItem[] = serverBooks || INITIAL_BOOKS;
      try {
        const savedBooks = localStorage.getItem("library_books");
        if (savedBooks) {
          const parsed = JSON.parse(savedBooks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const localMap = new Map(parsed.map((b: any) => [b.id, b]));
            merged = merged.map((b) => {
              const local = localMap.get(b.id);
              if (local && (!local.available || local.status === "ถูกยืม")) {
                return { ...b, available: false, status: "ถูกยืม" };
              }
              return b;
            });
            parsed.forEach((lb: any) => {
              if (!merged.some((b) => b.id === lb.id)) {
                merged.unshift(lb);
              }
            });
          }
        }
        localStorage.setItem("library_books", JSON.stringify(merged));
      } catch (e) {
        console.error(e);
      }

      setBooks(merged);
      setSelectedBook((prev) => {
        if (!prev) return merged[0] || INITIAL_BOOKS[0];
        const refreshed = merged.find((b) => b.id === prev.id);
        return refreshed || prev;
      });
    };
    fetchBooks();

    const savedRole = localStorage.getItem("appRole") || localStorage.getItem("userRole");
    if (savedRole === "admin" || savedRole === "student") {
      setRole(savedRole as "admin" | "student");
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setSearchQuery(q);
      }
    }
  }, []);

  // Save books to state, localStorage, and server API
  const saveBooks = (newBooks: BookItem[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem("library_books", JSON.stringify(newBooks));
    } catch (e) {
      console.error("Failed to persist books:", e);
    }
  };

  const showToast = (message: string, type: "success" | "danger" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Reset borrow states when selected book changes
  useEffect(() => {
    setIsBorrowing(false);
    setBorrowSuccess(false);
  }, [selectedBook]);

  // Handle Borrow
  const handleBorrowClick = async () => {
    if (!selectedBook) return;
    setIsBorrowing(true);

    try {
      // Call server API
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook.id }),
      });
      const data = await res.json();

      setIsBorrowing(false);
      if (data.success && data.book) {
        setBorrowSuccess(true);
        const updatedBook: BookItem = {
          ...data.book,
          available: false,
          status: "ถูกยืม",
        };
        const sourceList = Array.isArray(data.books) && data.books.length > 0 ? data.books : books;
        const updated = sourceList.map((b: BookItem) => (b.id === selectedBook.id ? updatedBook : b));
        saveBooks(updated);
        setSelectedBook(updatedBook);

        // Also add to my_borrowed_books in localStorage
        try {
          const today = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
          const myDue = new Date(Date.now() + 14 * 86400000).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
          const record = data.borrowRecord || {
            id: `bw-${Date.now()}`,
            bookId: updatedBook.id,
            title: updatedBook.title,
            author: updatedBook.author,
            borrowDate: today,
            dueDate: myDue,
            status: "ปกติ",
            statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
          };
          const currentBorrowed = JSON.parse(localStorage.getItem("my_borrowed_books") || "[]");
          const filtered = currentBorrowed.filter((r: any) => r.bookId !== updatedBook.id && r.id !== record.id);
          localStorage.setItem("my_borrowed_books", JSON.stringify([record, ...filtered]));
        } catch (e) {}

        showToast(`ยืมหนังสือ "${selectedBook.title}" สำเร็จ!`, "success");
        return;
      }
    } catch (err) {
      console.warn("API borrow failed, using local simulation:", err);
    }

    // Local fallback
    setTimeout(() => {
      setIsBorrowing(false);
      setBorrowSuccess(true);
      const updatedBook: BookItem = { ...selectedBook, available: false, status: "ถูกยืม" };
      const updated = books.map((b) =>
        b.id === selectedBook.id ? updatedBook : b
      );
      saveBooks(updated);
      setSelectedBook(updatedBook);

      try {
        const today = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
        const myDue = new Date(Date.now() + 14 * 86400000).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
        const record = {
          id: `bw-${Date.now()}`,
          bookId: updatedBook.id,
          title: updatedBook.title,
          author: updatedBook.author,
          borrowDate: today,
          dueDate: myDue,
          status: "ปกติ",
          statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
        };
        const currentBorrowed = JSON.parse(localStorage.getItem("my_borrowed_books") || "[]");
        const filtered = currentBorrowed.filter((r: any) => r.bookId !== updatedBook.id && r.id !== record.id);
        localStorage.setItem("my_borrowed_books", JSON.stringify([record, ...filtered]));
      } catch (e) {}

      showToast(`ยืมหนังสือ "${selectedBook.title}" สำเร็จ!`, "success");
    }, 600);
  };

  // Handle Reserve
  const handleReserveClick = async () => {
    if (!selectedBook) return;
    try {
      // Call server API
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBook.id,
          bookId: selectedBook.id,
          title: selectedBook.title,
          author: selectedBook.author,
          image: selectedBook.image || "/cover_fiction.jpg",
          status: selectedBook.available ? "พร้อมรับ" : "รอคิว",
          statusColor: selectedBook.available ? "text-emerald-600 bg-emerald-100" : "text-amber-600 bg-amber-100",
        }),
      });

      // Also cache in local storage
      const saved = localStorage.getItem("my_reservations");
      const list = saved ? JSON.parse(saved) : [];
      if (!list.some((item: any) => item.title === selectedBook.title || item.id === selectedBook.id)) {
        const newReservation = {
          id: selectedBook.id,
          title: selectedBook.title,
          author: selectedBook.author,
          image: selectedBook.image || "/cover_fiction.jpg",
          requestDate: new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }),
          status: selectedBook.available ? "พร้อมรับ" : "รอคิว",
          statusColor: selectedBook.available ? "text-emerald-600 bg-emerald-100" : "text-amber-600 bg-amber-100",
        };
        localStorage.setItem("my_reservations", JSON.stringify([newReservation, ...list]));
      }
      showToast(`จองหนังสือ "${selectedBook.title}" สำเร็จ! ตรวจสอบได้ที่หน้ารายการจอง`, "success");
    } catch (e) {
      console.error(e);
      showToast("เกิดข้อผิดพลาดในการบันทึกการจอง", "danger");
    }
  };

  // Open Modal to Add
  const handleOpenAddModal = () => {
    const nextNumber = books.length + 1;
    const autoId = `B-${String(nextNumber).padStart(3, "0")}`;
    setFormData({
      id: autoId,
      title: "",
      author: "",
      isbn: `978-616-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1 + Math.random() * 9)}`,
      pages: 200,
      categoryId: "academic",
      image: "/cover_academic.jpg",
      available: true,
    });
    setModalMode("add");
    setIsModalOpen(true);
  };

  // Open Modal to Edit
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

  // Delete Book
  const handleDeleteBook = async (bookId: string) => {
    const bookToDelete = books.find((b) => b.id === bookId);
    if (!bookToDelete) return;

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือ "${bookToDelete.title}" (รหัส: ${bookToDelete.id}) ออกจากคลัง?`)) {
      try {
        await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id: bookId }),
        });
      } catch (err) {}

      const updated = books.filter((b) => b.id !== bookId);
      saveBooks(updated);
      if (selectedBook?.id === bookId) {
        setSelectedBook(updated.length > 0 ? updated[0] : null);
      }
      showToast(`ลบหนังสือ "${bookToDelete.title}" เรียบร้อยแล้ว`, "danger");
    }
  };

  // Save Book (Add or Edit)
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("กรุณากรอกชื่อหนังสือ");
      return;
    }
    if (!formData.author.trim()) {
      alert("กรุณากรอกชื่อผู้แต่ง");
      return;
    }

    const catObj = CATEGORIES_CONFIG.find((c) => c.id === formData.categoryId);
    const categoryName = catObj ? catObj.name : "อื่นๆ";

    if (modalMode === "add") {
      const newBook: BookItem = {
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
          body: JSON.stringify(newBook),
        });
      } catch (err) {}

      const updated = [newBook, ...books];
      saveBooks(updated);
      setSelectedBook(newBook);
      setIsModalOpen(false);
      showToast(`เพิ่มหนังสือ "${newBook.title}" เข้าระบบเรียบร้อย!`, "success");
    } else {
      // Edit mode
      const updatedBook: BookItem = {
        id: formData.id,
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
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
          body: JSON.stringify(updatedBook),
        });
      } catch (err) {}

      const updated = books.map((b) => (b.id === formData.id ? { ...b, ...updatedBook } : b));
      saveBooks(updated);
      const editedBook = updated.find((b) => b.id === formData.id) || null;
      setSelectedBook(editedBook);
      setIsModalOpen(false);
      showToast(`บันทึกการแก้ไข "${formData.title}" เรียบร้อยแล้ว`, "success");
    }
  };

  // Reset to default mock
  const handleResetToDefault = async () => {
    if (confirm("ต้องการรีเซ็ตคลังหนังสือกลับเป็นข้อมูลเริ่มต้น 10 เล่มหรือไม่?")) {
      try {
        await fetch("/api/reset", { method: "POST" });
      } catch (err) {}
      saveBooks(INITIAL_BOOKS);
      setSelectedBook(INITIAL_BOOKS[0]);
      showToast("รีเซ็ตคลังหนังสือกลับสู่ค่าเริ่มต้นแล้ว", "info");
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filtered & Sorted books
  const filteredBooks = books
    .filter((b) => {
      const matchCat = activeCategory === "all" || b.categoryId === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title, "th");
      if (sortBy === "pages") return b.pages - a.pages;
      return 0; // default latest order
    });

  // Dynamic category counts
  const getCategoryCount = (catId: string) => {
    if (catId === "all") return books.length;
    return books.filter((b) => b.categoryId === catId).length;
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full pb-10 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className={`px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20" 
              : toast.type === "danger" 
                ? "bg-rose-500 text-white border-rose-400 shadow-rose-500/20"
                : "bg-blue-600 text-white border-blue-500 shadow-blue-500/20"
          }`}>
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === "danger" && <AlertCircle className="w-5 h-5 shrink-0" />}
            {toast.type === "info" && <Sparkles className="w-5 h-5 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Breadcrumbs & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <span>หน้าหลัก</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">{role === "admin" ? "จัดการคลังหนังสือ" : "ค้นหาและยืมหนังสือ"}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0c4a6e] flex items-center gap-3">
            {role === "admin" ? "คลังหนังสือทั้งหมด" : "ค้นหาและยืมหนังสือ"}
            <span className="text-xs bg-sky-100 text-sky-700 px-3 py-1 rounded-full font-bold">
              ทั้งหมด {books.length} เล่ม
            </span>
          </h1>
        </div>

        {/* Action Buttons: Only visible for Admin */}
        {role === "admin" && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Open Barcode Sheet Button */}
            <button
              onClick={() => setShowBarcodeSheet(true)}
              className="px-4 py-2.5 bg-white border border-sky-200 hover:border-sky-400 text-sky-700 hover:bg-sky-50 rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
            >
              <QrCode className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="whitespace-nowrap">แผ่นบาร์โค้ดหนังสือ</span>
            </button>

            <button
              onClick={handleResetToDefault}
              title="รีเซ็ตกลับเป็นค่าเริ่มต้น"
              className="p-2.5 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">รีเซ็ต</span>
            </button>
            
            <button
              onClick={handleOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">เพิ่มหนังสือใหม่</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, รหัส หรือ ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium whitespace-nowrap">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="latest">ล่าสุด / ทั้งหมด</option>
              <option value="title">ชื่อหนังสือ (ก-ฮ)</option>
              <option value="pages">จำนวนหน้า (มากไปน้อย)</option>
            </select>
          </div>
          
          <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl">
            พบ {filteredBooks.length} เล่ม
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Sidebar: Categories */}
        <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            หมวดหมู่หนังสือ
          </h3>
          <div className="space-y-2">
            {CATEGORIES_CONFIG.map((cat) => {
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    activeCategory === cat.id 
                      ? "bg-blue-50 border border-blue-200 shadow-sm" 
                      : "bg-transparent hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.bg} ${cat.color}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className={`font-bold text-sm ${activeCategory === cat.id ? "text-blue-700" : "text-slate-700"}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    activeCategory === cat.id ? "bg-blue-600 text-white" : "text-slate-400 bg-slate-100"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Content: Book Grid */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm w-full">
          
          {filteredBooks.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Search className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-lg text-slate-700">ไม่พบหนังสือตามเงื่อนไขที่ค้นหา</h4>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ล้างการค้นหา
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBooks.map((book) => (
                <div 
                  key={book.id} 
                  onClick={() => setSelectedBook(book)}
                  className={`group cursor-pointer rounded-2xl p-3 border-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative flex flex-col justify-between ${
                    selectedBook?.id === book.id 
                      ? "border-blue-500 bg-blue-50/30 shadow-lg ring-2 ring-blue-500/20" 
                      : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    {/* Book Cover */}
                    <div 
                      className={`w-full aspect-[3/4] bg-cover bg-center rounded-xl mb-3 shadow-md shadow-slate-200 flex flex-col justify-between p-3 relative border-l-8 border-black/20 overflow-hidden ${book.gradient || ""}`} 
                      style={book.image ? { backgroundImage: `url(${book.image})` } : {}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0"></div>
                      
                      <div className="relative z-10 flex justify-between items-center text-white/90">
                        <span className="text-[10px] font-mono font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                          {book.id}
                        </span>
                        
                        {/* Quick Barcode Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEnlargedBarcodeBook(book);
                          }}
                          title="สแกนบาร์โค้ดเล่มนี้"
                          className="p-1 rounded-md bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <ScanLine className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative z-10">
                        <h4 className="text-white font-bold text-center text-sm leading-snug drop-shadow-md line-clamp-2">
                          {book.title}
                        </h4>
                        <div className="text-white/80 text-[10px] text-center mt-1 truncate">
                          {book.author}
                        </div>
                      </div>
                    </div>
                    
                    {/* Title & Info */}
                    <p className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                      {book.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {book.author}
                    </p>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                      {book.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      book.available ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${book.available ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                      {book.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Right Sidebar: Book Details Panel */}
        {selectedBook && (
          <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 hidden xl:block animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">รายละเอียดหนังสือ</span>
              <div className="flex items-center gap-1">
                {/* Admin Quick Action: Edit & Delete */}
                {role === "admin" && (
                  <>
                    <button 
                      onClick={() => handleOpenEditModal(selectedBook)}
                      title="แก้ไขข้อมูลหนังสือ"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBook(selectedBook.id)}
                      title="ลบหนังสือ"
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedBook(null)} 
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Book Cover in Details Panel */}
            <div 
              className={`w-40 mx-auto aspect-[3/4] bg-cover bg-center rounded-2xl mb-4 shadow-xl shadow-slate-200 flex flex-col justify-between p-4 relative border-l-8 border-black/30 overflow-hidden ${selectedBook.gradient || ""}`} 
              style={selectedBook.image ? { backgroundImage: `url(${selectedBook.image})` } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 z-0"></div>
              
              <div className="relative z-10 flex justify-between items-center text-white/80">
                <span className="text-xs font-mono font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                  {selectedBook.id}
                </span>
                <BookOpen className="w-5 h-5 text-white/70" />
              </div>

              <div className="relative z-10 text-center">
                <h4 className="text-white font-bold text-center text-base leading-snug drop-shadow-md">
                  {selectedBook.title}
                </h4>
                <div className="text-white/80 text-xs mt-1">
                  {selectedBook.author}
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 leading-tight mb-2 text-center">{selectedBook.title}</h2>
            <div className="flex justify-center mb-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                selectedBook.available ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}>
                <span className={`w-2 h-2 rounded-full ${selectedBook.available ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                {selectedBook.status}
              </span>
            </div>

            {/* REAL BARCODE CARD FOR MOBILE SCANNING */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-5 flex flex-col items-center text-center">
              <div className="w-full flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <ScanLine className="w-3.5 h-3.5 text-sky-600" />
                  <span>สแกนด้วยมือถือ</span>
                </div>
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    onClick={() => setBarcodeDisplayMode("qrcode")}
                    className={`px-2 py-0.5 rounded ${barcodeDisplayMode === "qrcode" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                  >QR</button>
                  <button
                    onClick={() => setBarcodeDisplayMode("barcode")}
                    className={`px-2 py-0.5 rounded ${barcodeDisplayMode === "barcode" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                  >Bar</button>
                </div>
              </div>
              
              <div 
                onClick={() => setEnlargedBarcodeBook(selectedBook)}
                className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-102 transition-all cursor-pointer w-full flex justify-center"
                title="แตะเพื่อขยายใหญ่"
              >
                <Barcode 
                  value={barcodeDisplayMode === "qrcode" ? getQrUrl(selectedBook.id) : selectedBook.id} 
                  type={barcodeDisplayMode} 
                  width={2} 
                  height={45} 
                  fontSize={14} 
                />
              </div>

              <button
                onClick={() => setEnlargedBarcodeBook(selectedBook)}
                className="mt-2 text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" /> แตะเพื่อขยายสแกนเต็มจอ
              </button>
            </div>

            {/* Book Meta Info */}
            <div className="space-y-2.5 text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">รหัสหนังสือ</span>
                <span className="font-bold text-slate-800 font-mono">{selectedBook.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">ผู้แต่ง</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[160px]">{selectedBook.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">หมวดหมู่</span>
                <span className="font-bold text-slate-800">{selectedBook.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">ISBN</span>
                <span className="font-bold text-slate-800 font-mono text-xs">{selectedBook.isbn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">จำนวนหน้า</span>
                <span className="font-bold text-slate-800">{selectedBook.pages} หน้า</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button 
                disabled={!selectedBook.available || selectedBook.status === "ถูกยืม" || isBorrowing || borrowSuccess} 
                onClick={handleBorrowClick}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  borrowSuccess 
                    ? "bg-emerald-500 text-white shadow-sm" 
                    : selectedBook.available && selectedBook.status !== "ถูกยืม"
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer" 
                      : "bg-slate-100 text-rose-500 border border-slate-200 cursor-not-allowed font-semibold"
              }`}>
                {borrowSuccess ? (
                  <><CheckCircle2 className="w-5 h-5" /> ยืมสำเร็จ!</>
                ) : isBorrowing ? (
                  <><RefreshCcw className="w-5 h-5 animate-spin" /> กำลังดำเนินการ...</>
                ) : selectedBook.available && selectedBook.status !== "ถูกยืม" ? (
                  <><ArrowRightLeft className="w-5 h-5" /> ยืมหนังสือเล่มนี้</>
                ) : (
                  <><X className="w-5 h-5 text-rose-500" /> หนังสือถูกยืมอยู่ (ไม่ว่าง)</>
                )}
              </button>

              {/* Reserve Button */}
              <button
                onClick={handleReserveClick}
                className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer shadow-xs"
              >
                <BookmarkPlus className="w-4 h-4 text-amber-600" />
                <span>เพิ่มในรายการจอง</span>
              </button>

              {role === "admin" && (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleOpenEditModal(selectedBook)}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" /> แก้ไขข้อมูล
                  </button>
                  <button 
                    onClick={() => handleDeleteBook(selectedBook.id)}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบหนังสือ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ENLARGED SINGLE BARCODE MODAL */}
      {enlargedBarcodeBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-6 flex flex-col items-center text-center relative">
            
            <button
              onClick={() => setEnlargedBarcodeBook(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-3">
              <ScanLine className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-xl text-slate-800">
              บาร์โค้ดสำหรับสแกนยืม
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
              {barcodeDisplayMode === "qrcode" 
                ? "ใช้กล้องมือถือทั่วไป (iPhone/Android) ส่องคิวอาร์โค้ดนี้เพื่อยืมทันที!" 
                : "เปิดหน้าสแกนยืมด้วยมือถือ (/scan) หรือใช้เครื่องยิงบาร์โค้ดส่องแท่งนี้"}
            </p>

            {/* Switch QR vs Barcode */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 w-full">
              <button
                onClick={() => setBarcodeDisplayMode("qrcode")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  barcodeDisplayMode === "qrcode" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                คิวอาร์โค้ด (กล้องมือถือส่องได้ทันที)
              </button>
              <button
                onClick={() => setBarcodeDisplayMode("barcode")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  barcodeDisplayMode === "barcode" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                บาร์โค้ดแท่ง (1D)
              </button>
            </div>

            {/* High-Contrast Large Barcode Display */}
            <div className="bg-white p-5 rounded-3xl border-4 border-slate-900 shadow-xl w-full mb-4 flex flex-col items-center">
              <p className="text-xs font-bold text-slate-500 mb-1">{enlargedBarcodeBook.title}</p>
              <Barcode 
                value={barcodeDisplayMode === "qrcode" ? getQrUrl(enlargedBarcodeBook.id) : enlargedBarcodeBook.id} 
                type={barcodeDisplayMode} 
                width={2.5} 
                height={80} 
                fontSize={20} 
              />
              <div className="mt-2 text-xs font-bold text-slate-400 font-mono">
                ISBN: {enlargedBarcodeBook.isbn}
              </div>
            </div>

            {/* Status & Quick Actions */}
            <div className="w-full flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs mb-5 font-bold">
              <span className="text-slate-500">สถานะหนังสือ:</span>
              <span className={`px-2.5 py-1 rounded-full ${
                enlargedBarcodeBook.available ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}>
                {enlargedBarcodeBook.status}
              </span>
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={() => handleCopyCode(enlargedBarcodeBook.id)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedId ? "คัดลอกรหัสแล้ว!" : "คัดลอกรหัส (ID)"}
              </button>

              <Link
                href="/scan"
                onClick={() => setEnlargedBarcodeBook(null)}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-400/30 transition-all text-center"
              >
                <ExternalLink className="w-4 h-4" /> ไปหน้าสแกนกล้อง
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE BARCODE SHEET MODAL (แผ่นรวมบาร์โค้ดสำหรับสแกนและพิมพ์) */}
      {showBarcodeSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">
                    แผ่นบาร์โค้ดหนังสือสำหรับสแกน & สั่งพิมพ์
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    ใช้หน้าจอนี้ส่องสแกนผ่านมือถือได้ทันที หรือสั่งพิมพ์เป็นสติกเกอร์ติดสันหนังสือ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" /> พิมพ์แผ่นบาร์โค้ด
                </button>
                <button
                  onClick={() => setShowBarcodeSheet(false)}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Barcode Grid Body */}
            <div id="printable-barcode-sheet" className="p-6 overflow-y-auto flex-1 bg-slate-100/60">
              
              <div className="mb-4 bg-sky-50 border border-sky-200 p-3.5 rounded-2xl text-xs text-sky-800 font-bold flex flex-col sm:flex-row gap-3 items-center justify-between">
                <span>นำมือถือเปิดหน้า <b>/scan</b> แล้วส่องโค้ดด้านล่างนี้เพื่อทดสอบยืมหนังสือได้เลย!</span>
                
                {/* Mode toggle */}
                <div className="flex bg-white border border-sky-200 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setBarcodeDisplayMode("qrcode")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      barcodeDisplayMode === "qrcode" ? "bg-sky-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    คิวอาร์โค้ด
                  </button>
                  <button
                    onClick={() => setBarcodeDisplayMode("barcode")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      barcodeDisplayMode === "barcode" ? "bg-sky-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    บาร์โค้ดแท่ง
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-400 transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {book.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          book.available ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                          {book.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1 mt-1">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mb-2">
                        {book.author} • {book.category}
                      </p>
                    </div>

                    {/* Barcode / QR Rendering */}
                    <div className="bg-white border border-slate-100 rounded-xl p-2 flex justify-center shadow-inner">
                      <Barcode 
                        value={barcodeDisplayMode === "qrcode" ? getQrUrl(book.id) : book.id} 
                        type={barcodeDisplayMode} 
                        width={1.8} 
                        height={45} 
                        fontSize={13} 
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT BOOK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
                  modalMode === "add" ? "bg-blue-600 shadow-blue-500/20" : "bg-amber-500 shadow-amber-500/20"
                }`}>
                  {modalMode === "add" ? <Plus className="w-6 h-6" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">
                    {modalMode === "add" ? "เพิ่มหนังสือใหม่เข้าระบบ" : "แก้ไขข้อมูลหนังสือ"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {modalMode === "add" ? "กรอกรายละเอียดหนังสือเพื่อลงทะเบียนในคลัง" : `รหัสหนังสือ: ${formData.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveBook} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    รหัสหนังสือ (ID / Barcode) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === "edit"}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="เช่น B-011"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="academic">วิชาการ</option>
                    <option value="fiction">นิยาย</option>
                    <option value="comic">การ์ตูน</option>
                    <option value="kids">หนังสือเด็ก</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
              </div>

              {/* Barcode Live Preview in Form */}
              {formData.id && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    พรีวิวบาร์โค้ดหนังสือ (Barcode Preview)
                  </span>
                  <Barcode value={formData.id} width={1.8} height={40} fontSize={12} />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อหนังสือ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น วิทยาศาสตร์มหัศจรรย์ เล่ม 1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ผู้แต่ง / ผู้แปล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="เช่น สสวท. หรือ นามปากกา"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    เลข ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="เช่น 978-616-04-123-4"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    จำนวนหน้า
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    สถานะการยืม
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, available: true })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        formData.available 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      ว่าง (พร้อมให้ยืม)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, available: false })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        !formData.available 
                          ? "bg-rose-50 text-rose-700 border-rose-300 shadow-sm" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      ถูกยืมอยู่
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  เลือกรูปหน้าปกหนังสือ
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {COVER_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.src}
                      onClick={() => setFormData({ ...formData, image: preset.src })}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                        formData.image === preset.src 
                          ? "border-blue-600 ring-2 ring-blue-600/30 scale-105" 
                          : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={preset.src} alt={preset.label} className="w-full h-full object-cover rounded-lg" />
                      {formData.image === preset.src && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white bg-blue-600 rounded-full p-0.5" />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 right-1 text-[8px] bg-black/60 text-white font-bold text-center rounded py-0.5">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {modalMode === "add" ? "บันทึกหนังสือใหม่" : "บันทึกการแก้ไข"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
