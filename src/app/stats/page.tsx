"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/stats");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-bold text-sm">
      กำลังนำทางไปยังรายงานสถิติระบบหลังบ้าน...
    </div>
  );
}
