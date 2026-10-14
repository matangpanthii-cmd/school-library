"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CounterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/counter");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-bold text-sm">
      กำลังเปิดโต๊ะเคาน์เตอร์ระบบหลังบ้าน...
    </div>
  );
}
