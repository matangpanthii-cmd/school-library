"use client";

import { useState, useEffect, useRef } from "react";
import { UserCircle, Book, Calendar, Clock, AlertCircle, Sparkles, School, CheckCircle2, Printer, ShieldCheck } from "lucide-react";
import JsBarcode from "jsbarcode";

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

export default function AdminProfilePage() {
  const teacher = {
    id: "U-2001",
    name: "ครูปัณฑิตา คำพัด",
    role: "teacher",
    department: "กลุ่มสาระการเรียนรู้การงานอาชีพและเทคโนโลยี",
    position: "หัวหน้างานห้องสมุดและสื่อการเรียนรู้",
    teacherId: "T-8899",
    borrowed: 1,
    limit: 10,
    fines: 0,
    avatar: "/avatar_teacher.jpg",
    history: [
      { id: "B-005", title: "เทคโนโลยีและนวัตกรรม", borrowDate: "2024-09-20", dueDate: "2024-10-20", status: "Active" },
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col gap-6">

      {/* Header & Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1e3a8a]">
              บัตรประจำตัวบุคลากร / บรรณารักษ์ (Staff Digital ID)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
              เจ้าหน้าที่
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">ใช้บาร์โค้ดนี้สำหรับทำรายการที่เคาน์เตอร์ห้องสมุดและยืนยันสิทธิ์บรรณารักษ์</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-md flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 shrink-0" /> <span>พิมพ์บัตรเจ้าหน้าที่</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Col: ID Card */}
        <div className="lg:col-span-4 space-y-6">
          <div id="printable-id-card" className="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden relative">
            
            {/* Header Pattern */}
            <div className="h-32 p-6 flex justify-between items-start relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <School className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10 text-white">
                <h3 className="font-black text-xl tracking-tight opacity-90">บัตรเจ้าหน้าที่ห้องสมุด</h3>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest mt-1">Staff & Librarian Card</p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 pt-20 relative text-center">
              <div className="w-28 h-28 mx-auto rounded-full bg-white border-4 border-amber-400 shadow-md absolute -top-14 left-1/2 -translate-x-1/2 flex items-center justify-center overflow-hidden">
                <img src={teacher.avatar} className="w-full h-full object-cover" alt={teacher.name} />
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-amber-100 text-amber-800 border border-amber-300">
                  LIBRARIAN / บรรณารักษ์
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">{teacher.name}</h2>
                <p className="text-slate-500 font-bold mt-1 text-xs">{teacher.position}</p>
                <div className="mt-6 flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium text-xs">รหัสบุคลากร</span>
                    <span className="font-bold text-slate-800">{teacher.teacherId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium text-xs">รหัสสมาชิกห้องสมุด</span>
                    <span className="font-bold font-mono text-blue-700">{teacher.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium text-xs">สิทธิ์การจัดการ</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 text-xs">
                      <ShieldCheck className="w-4 h-4" /> แอดมินเต็มระบบ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Footer */}
            <div className="border-t-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center bg-slate-50/80">
              <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                สแกนที่โต๊ะเคาน์เตอร์
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <Barcode value={teacher.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Stats & History */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <h2 className="text-2xl font-bold text-slate-800 hidden lg:block">ภาพรวมสิทธิพิเศษบุคลากร</h2>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><Book className="w-6 h-6" /></div>
                <p className="font-bold text-slate-500 text-xs">โควตายืมหนังสือ</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-800">{teacher.borrowed}</h3>
                <span className="text-xl font-bold text-slate-400">/ {teacher.limit}</span>
                <span className="font-medium text-slate-500 text-xs">เล่ม (สิทธิ์ครู)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Clock className="w-6 h-6" /></div>
                <p className="font-bold text-slate-500 text-xs">ระยะเวลายืม</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-800">30</h3>
                <span className="font-medium text-slate-500 text-xs">วันทำการ</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><ShieldCheck className="w-6 h-6" /></div>
                <p className="font-bold text-slate-500 text-xs">สิทธิ์เคาน์เตอร์</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-emerald-600">อนุมัติทันที</h3>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-grow flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg"><Calendar className="w-5 h-5 text-indigo-600" /></div>
                ประวัติการยืมของเจ้าหน้าที่
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4 uppercase">ชื่อหนังสือ</th>
                    <th className="px-6 py-4 uppercase">วันที่ยืม</th>
                    <th className="px-6 py-4 uppercase">กำหนดคืน</th>
                    <th className="px-6 py-4 uppercase text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {teacher.history.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-800">{item.title}</td>
                      <td className="px-6 py-4 text-slate-500">{item.borrowDate}</td>
                      <td className="px-6 py-4 text-slate-500">{item.dueDate}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700">
                          กำลังยืม
                        </span>
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
