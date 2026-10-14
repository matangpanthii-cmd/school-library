"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { 
  ScanLine, 
  CheckCircle2, 
  X, 
  Camera, 
  Zap, 
  FileDigit, 
  AlertCircle, 
  BookOpen, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Search, 
  VideoOff, 
  Upload,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { INITIAL_BOOKS, BookItem as Book } from "@/data/initialBooks";

function ScanContent() {
  const [scanStatus, setScanStatus] = useState<"scanning" | "processing" | "success" | "error">("scanning");
  const [statusMessage, setStatusMessage] = useState("");
  const [borrowedBook, setBorrowedBook] = useState<Book | null>(null);
  const [dueDateText, setDueDateText] = useState("");

  // Scanner States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual Input Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [availableBooks, setAvailableBooks] = useState<Book[]>(INITIAL_BOOKS);

  // Helper to load or initialize books (fetch from server API with local fallback)
  const loadLibraryBooks = async (): Promise<Book[]> => {
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        if (data.books && Array.isArray(data.books) && data.books.length > 0) {
          setAvailableBooks(data.books);
          try {
            localStorage.setItem("library_books", JSON.stringify(data.books));
          } catch (e) {}
          return data.books;
        }
      }
    } catch (e) {
      console.warn("Using local books cache:", e);
    }

    try {
      const saved = localStorage.getItem("library_books");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableBooks(parsed);
          return parsed;
        }
      }
      localStorage.setItem("library_books", JSON.stringify(INITIAL_BOOKS));
    } catch (e) {
      console.error(e);
    }
    setAvailableBooks(INITIAL_BOOKS);
    return INITIAL_BOOKS;
  };

  // Load available books on mount and check ?borrow= query parameter
  useEffect(() => {
    loadLibraryBooks();

    // Check if URL has ?borrow=B-xxx parameter (e.g. from standard Phone Camera scan)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const borrowCode = params.get("borrow") || params.get("code");
      if (borrowCode) {
        setTimeout(() => {
          processBarcode(borrowCode);
        }, 500);
      }
    }
  }, []);

  // Format Thai Due Date (14 days from now)
  const getThaiDueDate = () => {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return `${due.getDate()} ${months[due.getMonth()]} ${due.getFullYear() + 543}`;
  };

  // Extract clean book code from any raw text or URL
  const extractBookCode = (raw: string): string => {
    let clean = raw.trim();
    // Check if it's a URL like .../scan?borrow=B-001
    if (clean.includes("borrow=")) {
      const parts = clean.split("borrow=");
      clean = parts[1].split("&")[0];
    } else if (clean.includes("code=")) {
      const parts = clean.split("code=");
      clean = parts[1].split("&")[0];
    } else if (clean.includes("/")) {
      const segments = clean.split("/");
      clean = segments[segments.length - 1];
    }
    return clean.toUpperCase();
  };

  // Process a scanned or entered barcode
  const processBarcode = async (code: string) => {
    if (scanStatus === "processing") return;
    const cleanCode = extractBookCode(code);
    if (!cleanCode) return;

    setScanStatus("processing");
    stopCamera();

    try {
      // 1. Try real-time server API first
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: cleanCode }),
      });
      const data = await res.json();

      if (data.success && data.book) {
        setBorrowedBook(data.book);
        setDueDateText(getThaiDueDate());
        setScanStatus("success");

        // Sync local storage
        await loadLibraryBooks();
        return;
      } else {
        setStatusMessage(data.message || `ไม่สามารถยืมหนังสือรหัส "${cleanCode}" ได้`);
        setScanStatus("error");
        return;
      }
    } catch (apiErr) {
      console.warn("API request failed, falling back to local simulation:", apiErr);
      // Fallback local logic
      const allBooks = await loadLibraryBooks();
      const target = allBooks.find((b: Book) => b.id.toUpperCase() === cleanCode || b.id.replace("-0", "-00").toUpperCase() === cleanCode);

      if (!target) {
        setStatusMessage(`ไม่พบหนังสือรหัส "${cleanCode}" ในระบบห้องสมุด`);
        setScanStatus("error");
        return;
      }

      if (!target.available) {
        setStatusMessage(`หนังสือ "${target.title}" (รหัส: ${target.id}) ถูกยืมไปแล้ว`);
        setScanStatus("error");
        return;
      }

      const updated = allBooks.map((b: Book) =>
        b.id === target.id ? { ...b, available: false, status: "ถูกยืม" } : b
      );

      try {
        localStorage.setItem("library_books", JSON.stringify(updated));
      } catch (e) {}

      setBorrowedBook(target);
      setDueDateText(getThaiDueDate());
      setScanStatus("success");
    }
  };

  // Start Real Camera using Html5Qrcode
  const startCamera = async () => {
    setCameraError(null);
    try {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (!window.isSecureContext && !isLocalhost) {
        setCameraError("เบราว์เซอร์มือถือจำกัดการเปิดกล้องผ่าน HTTP กรุณาใช้ปุ่ม 'ถ่ายภาพสแกน' ด้านล่างแทนครับ");
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("interactive-scanner", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.CODE_39
          ],
          verbose: false
        });
      }

      const qrCode = html5QrCodeRef.current;
      await qrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          if (decodedText) {
            processBarcode(decodedText);
          }
        },
        () => {}
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setIsCameraActive(false);
      setCameraError("ไม่สามารถเปิดกล้องสดได้ กรุณากดปุ่ม 'ถ่ายภาพสแกน' หรือ 'กรอกรหัสเอง' ด้านล่างครับ");
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (e) {
      console.error("Stop camera error:", e);
    }
    setIsCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle Photo File Scan (Guaranteed to work on ALL mobile browsers even over HTTP)
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus("processing");
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("interactive-scanner", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.CODE_39
          ],
          verbose: false
        });
      }

      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      if (decodedText) {
        processBarcode(decodedText);
      } else {
        setStatusMessage("ไม่พบบาร์โค้ดหรือคิวอาร์โค้ดในภาพ กรุณาถ่ายใกล้และชัดเจนขึ้นครับ");
        setScanStatus("error");
      }
    } catch (err) {
      console.error("File scan failed:", err);
      setStatusMessage("ไม่สามารถอ่านโค้ดจากภาพได้ กรุณาถ่ายภาพให้ชัดเจน หรือใช้การกรอกรหัสครับ");
      setScanStatus("error");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetScan = () => {
    setScanStatus("scanning");
    setBorrowedBook(null);
    setStatusMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 w-full flex-grow flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      
      {/* Page Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#0c4a6e] mb-2 flex items-center justify-center gap-2">
          <ScanLine className="w-8 h-8 text-sky-500" /> ยืมหนังสือด้วยมือถือ
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          สแกนคิวอาร์โค้ดหรือบาร์โค้ดของหนังสือเพื่อทำรายการยืมทันที
        </p>
      </div>

      {/* Camera Guidance Banner */}
      {cameraError && (
        <div className="w-full max-w-sm mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-2xl text-xs font-bold flex flex-col gap-2 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-start justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              {cameraError}
            </span>
            <button onClick={() => setCameraError(null)} className="text-amber-500 hover:text-amber-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Camera className="w-4 h-4" /> แตะเพื่อถ่ายภาพสแกน
          </button>
        </div>
      )}

      {/* Hidden File Input for Native Camera Photo Capture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileScan}
        className="hidden"
      />

      {/* Phone Mockup Frame */}
      <div className="w-full max-w-sm bg-slate-900 rounded-[2.8rem] p-4 pb-7 shadow-2xl relative overflow-hidden border-8 border-slate-800">
        
        {/* Top Speaker / Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-800 rounded-b-2xl flex justify-center items-end pb-1 z-30">
          <div className="w-16 h-1.5 bg-slate-900 rounded-full"></div>
        </div>

        {/* Viewfinder Screen Area */}
        <div 
          className="relative w-full aspect-[3/4] bg-slate-950 rounded-3xl overflow-hidden mt-6 flex items-center justify-center select-none"
        >
          {/* HTML5-QRCode Scanner Container */}
          <div
            id="interactive-scanner"
            className={`absolute inset-0 w-full h-full z-10 [&_video]:w-full [&_video]:h-full [&_video]:object-cover ${
              isCameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Fallback Viewfinder Background when camera is off */}
          {!isCameraActive && scanStatus === "scanning" && (
            <div 
              className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 z-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div 
                onClick={() => processBarcode("B-001")}
                className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-400/20 flex items-center justify-center mb-3 text-sky-400 shadow-lg shadow-sky-500/10 cursor-pointer hover:scale-105 transition-all"
                title="แตะเพื่อทดสอบยืม B-001"
              >
                <ScanLine className="w-10 h-10 animate-pulse" />
              </div>

              <p className="text-white font-bold text-sm">พร้อมสแกนหนังสือ</p>
              <p className="text-slate-400 text-xs mt-1 mb-4">กดปุ่มสีส้มด้านล่างเพื่อถ่ายภาพ หรือแตะเล่มเพื่อทดสอบ</p>

              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> เลือกหนังสือทดลองยืม
              </button>
            </div>
          )}

          {/* SCANNING STATE OVERLAY */}
          {scanStatus === "scanning" && (
            <>
              {/* Corner Markers */}
              <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-sky-400 rounded-tl-2xl z-20 pointer-events-none"></div>
              <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-sky-400 rounded-tr-2xl z-20 pointer-events-none"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-sky-400 rounded-bl-2xl z-20 pointer-events-none"></div>
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-sky-400 rounded-br-2xl z-20 pointer-events-none"></div>
              
              {/* Animated Laser Scanning Line */}
              <div className="absolute top-8 left-8 right-8 h-1 bg-sky-400 shadow-[0_0_15px_4px_rgba(56,189,248,0.7)] z-20 animate-[bounce_3s_infinite_ease-in-out] pointer-events-none"></div>
              
              {/* Instruction Text */}
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/90 text-xs flex flex-col items-center gap-1.5 z-20 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>ส่องบาร์โค้ดหรือคิวอาร์โค้ด</span>
                </div>
              </div>
            </>
          )}

          {/* PROCESSING STATE */}
          {scanStatus === "processing" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="w-16 h-16 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-bold text-sm">กำลังตรวจสอบข้อมูลหนังสือ...</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {scanStatus === "success" && borrowedBook && (
            <div className="absolute inset-0 bg-emerald-600 z-30 flex flex-col items-center justify-between p-6 text-center text-white animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col items-center mt-2">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black">ยืมสำเร็จแล้ว</h3>
                <p className="text-emerald-100 text-xs mt-1">บันทึกข้อมูลเข้าสู่บัญชีของคุณเรียบร้อย</p>
              </div>

              {/* Book Info Card */}
              <div className="bg-white text-slate-800 rounded-2xl p-4 w-full shadow-2xl text-left border border-white/20">
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-18 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <img src={borrowedBook.image} alt="Book" className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {borrowedBook.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 truncate mt-1">{borrowedBook.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{borrowedBook.author}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">กำหนดส่งคืน:</span>
                  <span className="font-bold text-emerald-700">{dueDateText}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button 
                  onClick={resetScan}
                  className="w-full py-3 bg-white text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
                >
                  สแกนเล่มต่อไป
                </button>
                <Link
                  href="/my-books"
                  className="w-full py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors text-center"
                >
                  ดูหนังสือของฉัน →
                </Link>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {scanStatus === "error" && (
            <div className="absolute inset-0 bg-rose-600 z-30 flex flex-col items-center justify-center p-6 text-center text-white animate-[fadeIn_0.3s_ease-out]">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-black mb-1">ไม่สามารถทำรายการได้</h3>
              <p className="text-rose-100 text-xs mb-6 max-w-xs">{statusMessage}</p>

              <button 
                onClick={resetScan}
                className="px-6 py-2.5 bg-white text-rose-700 font-bold text-xs rounded-full hover:bg-rose-50 transition-colors shadow-sm cursor-pointer"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}

        </div>

        {/* Action Controls Toolbar */}
        <div className="flex justify-between items-center mt-5 px-1">
          
          {/* Toggle Live Camera */}
          <button 
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
              isCameraActive ? "text-sky-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <div className={`p-3 rounded-full transition-all ${
              isCameraActive ? "bg-sky-500/20 ring-2 ring-sky-400" : "bg-slate-800"
            }`}>
              {isCameraActive ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap">
              {isCameraActive ? "ปิดกล้อง" : "เปิดกล้องสด"}
            </span>
          </button>

          {/* Take Photo Scan (Always works on all phones over HTTP) */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <div className="p-3 bg-amber-500/20 ring-2 ring-amber-400/40 rounded-full">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap">ถ่ายภาพสแกน</span>
          </button>

          {/* Manual Input */}
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <div className="p-3 bg-slate-800 rounded-full">
              <FileDigit className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap">กรอกรหัสเอง</span>
          </button>

          {/* Cancel */}
          <Link 
            href="/search"
            onClick={stopCamera}
            className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <div className="p-3 bg-slate-800 rounded-full">
              <X className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap">กลับคลัง</span>
          </Link>
        </div>

      </div>

      {/* MODAL: MANUAL CODE INPUT OR QUICK SELECT */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <FileDigit className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-base text-slate-800">กรอกรหัสหนังสือเพื่อยืม</h3>
              </div>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ระบุรหัสหนังสือ (Barcode ID)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น B-001 หรือ B-003"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:border-sky-500 outline-none uppercase"
                  />
                  <button
                    onClick={() => {
                      if (manualCode.trim()) {
                        setIsManualModalOpen(false);
                        processBarcode(manualCode.trim());
                      }
                    }}
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    ยืมเล่มนี้
                  </button>
                </div>
              </div>

              {/* Quick Select Available Books */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  หรือเลือกหนังสือที่พร้อมให้ยืมในระบบ:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableBooks
                    .filter((b) => b.available)
                    .map((book) => (
                      <div
                        key={book.id}
                        onClick={() => {
                          setIsManualModalOpen(false);
                          processBarcode(book.id);
                        }}
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-100 hover:border-sky-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200 text-sky-700">
                            {book.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-700">
                            {book.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          ว่าง
                        </span>
                      </div>
                    ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ScanToBorrowPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500">กำลังโหลดระบบสแกน...</div>}>
      <ScanContent />
    </Suspense>
  );
}
