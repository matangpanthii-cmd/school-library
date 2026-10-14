"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Clock, Star, CheckCircle2, XCircle, Trash2, Calendar, Search, ArrowRight } from "lucide-react";

interface ReservationItem {
  id: string | number;
  title: string;
  author: string;
  image: string;
  requestDate: string;
  status: string;
  statusColor: string;
}

const DEFAULT_ACTIVE: ReservationItem[] = [
  { id: 1, title: "แฮร์รี่ พอตเตอร์ (ชุด)", author: "เจ.เค. โรว์ลิง", image: "/cover_fiction.jpg", requestDate: "28 ก.ย. 2568", status: "รอคิว", statusColor: "text-amber-600 bg-amber-100" },
  { id: 2, title: "ประวัติศาสตร์ไทย 101", author: "กระทรวงศึกษาธิการ", image: "/cover_academic.jpg", requestDate: "05 ต.ค. 2568", status: "พร้อมรับ", statusColor: "text-emerald-600 bg-emerald-100" },
];

const DEFAULT_HISTORY: ReservationItem[] = [
  { id: 3, title: "คอมพิวเตอร์พื้นฐาน ม.4-6", author: "กระทรวงศึกษาธิการ", image: "/cover_academic.jpg", requestDate: "10 ก.ย. 2568", status: "รับแล้ว", statusColor: "text-sky-600 bg-sky-100" },
  { id: 4, title: "โลกของสัตว์", author: "สำนักพิมพ์ บีซีดี", image: "/cover_kids.jpg", requestDate: "01 ก.ย. 2568", status: "ยกเลิก", statusColor: "text-slate-500 bg-slate-100" },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [activeReservations, setActiveReservations] = useState<ReservationItem[]>(DEFAULT_ACTIVE);
  const [historyReservations, setHistoryReservations] = useState<ReservationItem[]>(DEFAULT_HISTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved reservations from server API or localStorage on mount
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch("/api/reservations");
        if (res.ok) {
          const data = await res.json();
          if (data.reservations && Array.isArray(data.reservations)) {
            setActiveReservations(data.reservations);
            try {
              localStorage.setItem("my_reservations", JSON.stringify(data.reservations));
            } catch (e) {}
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/reservations, using local fallback");
      }

      try {
        const savedActive = localStorage.getItem("my_reservations");
        if (savedActive) {
          const parsed = JSON.parse(savedActive);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActiveReservations(parsed);
          }
        }

        const savedHistory = localStorage.getItem("my_reservations_history");
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            setHistoryReservations(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchReservations();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelReservation = async (item: ReservationItem) => {
    if (confirm(`คุณต้องการยกเลิกการจอง "${item.title}" ใช่หรือไม่?`)) {
      try {
        await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel", id: item.id }),
        });
      } catch (err) {}

      const newActive = activeReservations.filter((r) => r.id !== item.id);
      const cancelledItem: ReservationItem = {
        ...item,
        status: "ยกเลิก",
        statusColor: "text-slate-500 bg-slate-100",
      };
      const newHistory = [cancelledItem, ...historyReservations];

      setActiveReservations(newActive);
      setHistoryReservations(newHistory);

      try {
        localStorage.setItem("my_reservations", JSON.stringify(newActive));
        localStorage.setItem("my_reservations_history", JSON.stringify(newHistory));
      } catch (e) {
        console.error(e);
      }

      showToast(`ยกเลิกรายการจอง "${item.title}" เรียบร้อยแล้ว`);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "พร้อมรับ") return <Star className="w-4 h-4" />;
    if (status === "รับแล้ว") return <CheckCircle2 className="w-4 h-4" />;
    if (status === "ยกเลิก") return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const currentList = activeTab === "active" ? activeReservations : historyReservations;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
          <div className="px-5 py-3 rounded-2xl shadow-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0c4a6e] mb-2 flex items-center gap-3">
            <div className="bg-sky-100 p-2 rounded-xl text-sky-500">
              <Bookmark className="w-8 h-8" />
            </div>
            รายการจองหนังสือ
          </h1>
          <p className="text-slate-500 font-medium text-lg">ดูรายการหนังสือที่คุณกดจองคิวไว้ได้ที่นี่เลย!</p>
        </div>

        <Link
          href="/search"
          className="self-start sm:self-auto px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/20 hover:shadow-sky-500/30 flex items-center gap-2 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>ค้นหาหนังสือเพื่อจองเพิ่ม</span>
        </Link>
      </div>

      <div className="bg-white rounded-[40px] border-4 border-white shadow-xl shadow-sky-100/40 overflow-hidden flex flex-col min-h-[600px] relative">
        {/* Decorative background inside the main container */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('/elephant-bg.jpg')", backgroundSize: '150px' }}></div>
        
        {/* Cute Jelly Tabs */}
        <div className="flex items-center gap-4 px-8 pt-8 pb-4 relative z-10">
          <button 
            onClick={() => setActiveTab("active")}
            className={`px-8 py-3.5 rounded-full font-bold text-base transition-all cursor-pointer ${activeTab === 'active' ? 'bg-sky-400 text-white shadow-[0_4px_15px_rgba(56,189,248,0.4)] scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:scale-105'}`}
          >
            รายการจอง ({activeReservations.length})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-8 py-3.5 rounded-full font-bold text-base transition-all cursor-pointer ${activeTab === 'history' ? 'bg-sky-400 text-white shadow-[0_4px_15px_rgba(56,189,248,0.4)] scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:scale-105'}`}
          >
            ประวัติการจอง ({historyReservations.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-sky-50/30 relative z-10 border-t border-sky-50">
          {currentList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentList.map((item) => (
                <div key={item.id} className="bg-white rounded-[24px] p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-sky-100 flex gap-5 items-center relative group">
                  
                  {/* Book Cover */}
                  <div className="w-24 h-32 shrink-0 rounded-xl bg-cover bg-center shadow-md border-2 border-slate-100 overflow-hidden relative" style={{ backgroundImage: `url(${item.image || '/cover_fiction.jpg'})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800 text-lg line-clamp-2 pr-2 leading-tight">{item.title}</h3>
                      {activeTab === 'active' && (
                        <button 
                          onClick={() => handleCancelReservation(item)}
                          title="ยกเลิกการจอง"
                          className="text-slate-300 hover:text-rose-500 transition-colors p-2 bg-slate-50 rounded-full hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-4 font-medium">{item.author}</p>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${item.statusColor}`}>
                        {getStatusIcon(item.status)}
                        <span>{item.status}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span>{item.requestDate}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-32 h-32 mb-6 opacity-60 mix-blend-multiply grayscale">
                <img src="/hero-elephant.jpg" alt="No data" className="w-full h-full object-cover rounded-full" />
              </div>
              <p className="text-lg font-bold text-slate-700">ไม่มีรายการในหมวดนี้</p>
              <p className="text-sm font-medium mt-2 max-w-sm text-center text-slate-400">หากต้องการยืมหนังสือ สามารถเลือกจองได้จากหน้าค้นหาเลยครับ</p>
              <Link
                href="/search"
                className="mt-6 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md shadow-sky-500/20"
              >
                <span>ไปยังคลังหนังสือ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
