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
  SwitchCamera,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { INITIAL_BOOKS, BookItem as Book } from "@/data/initialBooks";
import { findBookByAnyCode } from "@/lib/bookMatcher";

function ScanContent() {
  const [scanStatus, setScanStatus] = useState<"scanning" | "processing" | "success" | "error">("scanning");
  const [statusMessage, setStatusMessage] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [canAutoAdd, setCanAutoAdd] = useState(false);
  const [borrowedBook, setBorrowedBook] = useState<Book | null>(null);
  const [dueDateText, setDueDateText] = useState("");

  // Scanner States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual Input Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [availableBooks, setAvailableBooks] = useState<Book[]>(INITIAL_BOOKS);

  // Load books
  const loadLibraryBooks = async (): Promise<Book[]> => {
    let serverBooks: Book[] | null = null;
    try {
      const res = await fetch("/api/books", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.books && Array.isArray(data.books) && data.books.length > 0) {
          serverBooks = data.books;
        }
      }
    } catch (e) {
      console.warn("Using local books cache:", e);
    }

    // Merge server books with local storage overrides
    let mergedBooks: Book[] = serverBooks || INITIAL_BOOKS;
    try {
      const saved = localStorage.getItem("library_books");
      if (saved) {
        const localList: Book[] = JSON.parse(saved);
        if (Array.isArray(localList) && localList.length > 0) {
          const localMap = new Map(localList.map((b) => [b.id, b]));
          mergedBooks = mergedBooks.map((b) => {
            const local = localMap.get(b.id);
            if (local && (!local.available || local.status === "ถูกยืม")) {
              return { ...b, available: false, status: "ถูกยืม" };
            }
            return b;
          });
          // Also include any new books added locally
          localList.forEach((lb) => {
            if (!mergedBooks.some((b) => b.id === lb.id)) {
              mergedBooks.unshift(lb);
            }
          });
        }
      }
      localStorage.setItem("library_books", JSON.stringify(mergedBooks));
    } catch (e) {
      console.error(e);
    }

    setAvailableBooks(mergedBooks);
    return mergedBooks;
  };

  useEffect(() => {
    loadLibraryBooks();

    // Check if URL has ?borrow= query param from camera scan
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

  const getThaiDueDate = () => {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return `${due.getDate()} ${months[due.getMonth()]} ${due.getFullYear() + 543}`;
  };

  const extractBookCode = (raw: string): string => {
    let clean = raw.trim();
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

  const processBarcode = async (code: string, isAutoAdd = false) => {
    if (scanStatus === "processing") return;
    const cleanCode = extractBookCode(code);
    if (!cleanCode) return;

    setLastScannedCode(cleanCode);
    setScanStatus("processing");
    await stopCamera();

    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: cleanCode, autoAdd: isAutoAdd }),
      });
      const data = await res.json();

      if (data.success && data.book) {
        const borrowedItem: Book = {
          ...data.book,
          available: false,
          status: "ถูกยืม"
        };
        setBorrowedBook(borrowedItem);
        setDueDateText(getThaiDueDate());
        setScanStatus("success");
        setCanAutoAdd(false);

        // Instantly mark as borrowed in availableBooks state & localStorage
        const sourceList = Array.isArray(data.books) && data.books.length > 0 ? data.books : availableBooks;
        const updatedList = sourceList.map((b: Book) =>
          b.id === borrowedItem.id || b.isbn === borrowedItem.isbn
            ? { ...b, available: false, status: "ถูกยืม" }
            : b
        );
        if (!updatedList.some((b: Book) => b.id === borrowedItem.id)) {
          updatedList.unshift(borrowedItem);
        }
        setAvailableBooks(updatedList);

        try {
          localStorage.setItem("library_books", JSON.stringify(updatedList));

          // Also save to my_borrowed_books in localStorage so My Books page is updated immediately
          const today = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
          const myDue = new Date(Date.now() + 14 * 86400000).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
          const newRecord = data.borrowRecord || {
            id: `bw-${Date.now()}`,
            bookId: borrowedItem.id,
            title: borrowedItem.title,
            author: borrowedItem.author,
            borrowDate: today,
            dueDate: myDue,
            status: "ปกติ",
            statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
          };
          const currentBorrowed = JSON.parse(localStorage.getItem("my_borrowed_books") || "[]");
          const filtered = currentBorrowed.filter((r: any) => r.bookId !== borrowedItem.id && r.id !== newRecord.id);
          localStorage.setItem("my_borrowed_books", JSON.stringify([newRecord, ...filtered]));
        } catch (e) {}

        return;
      } else {
        setStatusMessage(data.message || `ไม่พบหนังสือรหัส "${cleanCode}" ในระบบห้องสมุด`);
        setCanAutoAdd(Boolean(data.canAutoAdd || isAutoAdd));
        setScanStatus("error");
        return;
      }
    } catch (apiErr) {
      console.warn("API request failed, falling back to local simulation:", apiErr);
      const allBooks = await loadLibraryBooks();
      let target = findBookByAnyCode(allBooks, cleanCode);

      if (!target && isAutoAdd) {
        const newBook: Book = {
          id: cleanCode.startsWith("B-") ? cleanCode : `B-${cleanCode.slice(-6)}`,
          title: cleanCode.startsWith("978") ? `หนังสือรหัส ISBN: ${cleanCode}` : `หนังสือรหัส ${cleanCode}`,
          author: "บาร์โค้ด / นำเข้าใหม่",
          isbn: cleanCode,
          pages: 180,
          categoryId: "other",
          category: "ทั่วไป",
          image: "/cover_academic.jpg",
          status: "ถูกยืม",
          available: false
        };
        allBooks.unshift(newBook);
        target = newBook;
      }

      if (!target) {
        setStatusMessage(`ไม่พบข้อมูลหนังสือรหัส "${cleanCode}" ในคลัง`);
        setCanAutoAdd(true);
        setScanStatus("error");
        return;
      }

      if ((!target.available || target.status === "ถูกยืม") && !isAutoAdd) {
        setStatusMessage(`หนังสือ "${target.title}" (รหัส: ${target.id}) กำลังถูกยืมอยู่`);
        setCanAutoAdd(false);
        setScanStatus("error");
        return;
      }

      const updated = allBooks.map((b: Book) =>
        b.id === target!.id ? { ...b, available: false, status: "ถูกยืม" } : b
      );

      try {
        localStorage.setItem("library_books", JSON.stringify(updated));
      } catch (e) {}

      setAvailableBooks(updated);
      setBorrowedBook({ ...target, available: false, status: "ถูกยืม" });
      setDueDateText(getThaiDueDate());
      setScanStatus("success");
      setCanAutoAdd(false);
    }
  };

  // Robust Camera Start with Fallbacks
  const startCamera = async () => {
    setCameraError(null);
    setIsStartingCamera(true);

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

      const qrCode = html5QrCodeRef.current;

      // 1. Try to get available cameras
      let selectedCameraConfig: any = { facingMode: "environment" };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Prefer back camera if available
          const backCam = cameras.find((c) => 
            c.label.toLowerCase().includes("back") || 
            c.label.toLowerCase().includes("rear") || 
            c.label.toLowerCase().includes("environment")
          );
          selectedCameraConfig = backCam ? backCam.id : cameras[0].id;
        }
      } catch (camListErr) {
        console.warn("Could not list cameras, using default constraint:", camListErr);
      }

      await qrCode.start(
        selectedCameraConfig,
        {
          fps: 12,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.7);
            return { width: Math.max(edge, 200), height: Math.max(edge, 200) };
          }
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
      console.warn("Primary camera start failed, trying generic fallback:", err);

      // 2. Fallback to generic user-facing or default camera
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: "user" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
              if (decodedText) processBarcode(decodedText);
            },
            () => {}
          );
          setIsCameraActive(true);
          setIsStartingCamera(false);
          return;
        }
      } catch (fallbackErr: any) {
        console.error("All camera start attempts failed:", fallbackErr);
        setIsCameraActive(false);

        const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        if (typeof window !== "undefined" && !window.isSecureContext && !isLocalhost) {
          setCameraError("เบราว์เซอร์จำกัดการเปิดกล้องผ่าน HTTP ครับ เมื่อ Deploy ขึ้น Vercel (HTTPS) จะเปิดกล้องได้ปกติทันที หรือกด 'ถ่ายภาพสแกน' ด้านล่างได้เลยครับ");
        } else {
          setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบว่าได้กดยินยอมให้เบราว์เซอร์เข้าถึงกล้องแล้ว หรือกด 'ถ่ายภาพสแกน' / 'กรอกรหัสเอง' ได้ทันทีครับ");
        }
      }
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (e) {
      console.warn("Stop camera warning:", e);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

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
    <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-6 pb-12">
      
      {/* Header Title */}
      <div className="text-center w-full">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>ระบบยืมหนังสือด้วยตนเอง (Self-Service)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          สแกนบาร์โค้ดเพื่อยืมหนังสือ
        </h1>
        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
          เปิดกล้องเพื่อส่องบาร์โค้ด / คิวอาร์โค้ดบนตัวเล่ม หรือเลือกถ่ายภาพจากเครื่อง
        </p>
      </div>

      {/* Camera Guidance / Error Alert */}
      {cameraError && (
        <div className="w-full bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Camera className="w-4 h-4" /> ถ่ายภาพสแกน
            </button>
            <button onClick={() => setCameraError(null)} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
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

      {/* MAIN SCANNER CARD */}
      <div className="w-full bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200 flex flex-col items-center">
        
        {/* Viewfinder Screen Area */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video max-h-[420px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          
          {/* HTML5-QRCode Scanner Container */}
          <div
            id="interactive-scanner"
            className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
          />

          {/* VIEW WHEN CAMERA IS OFF & SCANNING */}
          {!isCameraActive && scanStatus === "scanning" && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 z-10 flex flex-col items-center justify-center p-6 text-center">
              
              <button
                onClick={startCamera}
                disabled={isStartingCamera}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex flex-col items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group mb-4"
              >
                {isStartingCamera ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold mt-1">แตะเพื่อเปิด</span>
                  </>
                )}
              </button>

              <h3 className="text-white font-bold text-base sm:text-lg">
                {isStartingCamera ? "กำลังเชื่อมต่อกล้อง..." : "กล้องยังไม่เปิดทำงาน"}
              </h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm">
                กดปุ่มสีฟ้าด้านบนเพื่อเปิดกล้อง หรือใช้ปุ่มถ่ายภาพ / กรอกรหัสหนังสือด้านล่าง
              </p>
            </div>
          )}

          {/* SCANNING LASER & CORNERS (Active Camera) */}
          {isCameraActive && scanStatus === "scanning" && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              {/* Target Focus Box */}
              <div className="relative w-64 h-64 border-2 border-sky-400/40 rounded-2xl">
                {/* 4 Corners */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg"></div>

                {/* Animated Scan Line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_12px_3px_rgba(56,189,248,0.8)] animate-[bounce_2.5s_infinite_ease-in-out]"></div>
              </div>

              {/* Status pill at bottom */}
              <div className="absolute bottom-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-2 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <span>กำลังตรวจจับบาร์โค้ดอัตโนมัติ...</span>
              </div>
            </div>
          )}

          {/* PROCESSING STATE */}
          {scanStatus === "processing" && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white font-bold text-sm">กำลังบันทึกรายการยืมหนังสือ...</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {scanStatus === "success" && borrowedBook && (
            <div className="absolute inset-0 bg-emerald-600 z-30 flex flex-col items-center justify-center p-6 text-center text-white animate-[fadeIn_0.3s_ease-out]">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-black">ยืมหนังสือสำเร็จ!</h3>
              <p className="text-emerald-100 text-xs mb-4">ระบบบันทึกรายการยืมเข้าบัญชีของคุณเรียบร้อยแล้ว</p>

              {/* Book Details Box */}
              <div className="bg-white text-slate-800 rounded-2xl p-4 w-full max-w-sm shadow-xl text-left flex gap-3.5 items-center">
                <div className="w-14 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                  <img src={borrowedBook.image} alt={borrowedBook.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {borrowedBook.id}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                      สถานะ: ยืมแล้ว (ไม่ว่าง)
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5">{borrowedBook.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{borrowedBook.author}</p>
                  <p className="text-xs text-emerald-700 font-bold mt-1.5">
                    กำหนดคืน: <span className="underline">{dueDateText}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 w-full max-w-sm mt-5">
                <button 
                  onClick={resetScan}
                  className="flex-1 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
                >
                  สแกนเล่มต่อไป
                </button>
                <Link
                  href="/my-books"
                  className="flex-1 py-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors text-center flex items-center justify-center gap-1"
                >
                  <span>ดูหนังสือฉัน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {scanStatus === "error" && (
            <div className="absolute inset-0 bg-slate-900/95 z-30 flex flex-col items-center justify-center p-6 text-center text-white animate-[fadeIn_0.3s_ease-out]">
              <div className="w-14 h-14 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black mb-1 text-white">ผลการสแกนหนังสือ</h3>
              
              {/* Detected Scanned Code Badge */}
              {lastScannedCode && (
                <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-xs text-sky-300 my-2 inline-flex items-center gap-1.5">
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>รหัสที่สแกนได้: <strong className="text-white">{lastScannedCode}</strong></span>
                </div>
              )}

              <p className="text-slate-300 text-xs sm:text-sm mb-5 max-w-sm">{statusMessage}</p>

              {/* 1-Click Auto Register Button if Book is Not Yet in System */}
              {canAutoAdd && lastScannedCode && (
                <button
                  onClick={() => processBarcode(lastScannedCode, true)}
                  className="w-full max-w-xs py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer mb-2.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>ลงทะเบียนเล่มนี้ & ยืมทันที</span>
                </button>
              )}

              <div className="flex gap-2.5 w-full max-w-xs">
                <button 
                  onClick={resetScan}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors border border-slate-700 shadow-sm cursor-pointer"
                >
                  ลองสแกนใหม่
                </button>
                <button 
                  onClick={() => {
                    resetScan();
                    setIsManualModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  เลือกจากคลัง
                </button>
              </div>
            </div>
          )}

        </div>

        {/* CONTROLS TOOLBAR (Clean, Large, Easy to tap) */}
        <div className="grid grid-cols-3 gap-3 w-full mt-5">
          
          {/* Toggle Live Camera */}
          <button 
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`py-3.5 px-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isCameraActive 
                ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            {isCameraActive ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            <span className="whitespace-nowrap">{isCameraActive ? "ปิดกล้อง" : "เปิดกล้องสด"}</span>
          </button>

          {/* Take Photo Scan */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="py-3.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-5 h-5 text-amber-600" />
            <span className="whitespace-nowrap">ถ่ายภาพ / อัปโหลด</span>
          </button>

          {/* Manual Input */}
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="py-3.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <FileDigit className="w-5 h-5 text-slate-600" />
            <span className="whitespace-nowrap">พิมพ์รหัสเอง</span>
          </button>
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
                  ระบุรหัสหนังสือ (เช่น B-001)
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
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    ยืมเล่มนี้
                  </button>
                </div>
              </div>

              {/* Quick Select Books */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  หรือเลือกหนังสือจากคลัง:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableBooks.map((book) => {
                    const isAvailable = book.available && book.status !== "ถูกยืม";
                    return (
                      <div
                        key={book.id}
                        onClick={() => {
                          if (isAvailable) {
                            setIsManualModalOpen(false);
                            processBarcode(book.id);
                          }
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isAvailable
                            ? "bg-slate-50 hover:bg-sky-50 border-slate-100 hover:border-sky-200 cursor-pointer group"
                            : "bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-slate-200 text-sky-700">
                            {book.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-700">
                            {book.title}
                          </span>
                        </div>
                        {isAvailable ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                            ว่าง (ยืมได้)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                            ถูกยืมแล้ว
                          </span>
                        )}
                      </div>
                    );
                  })}
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
