import { NextResponse } from "next/server";
import { getDb, saveDb, ReservationRecord } from "@/lib/db";

export async function GET() {
  const db = getDb();
  return NextResponse.json({ success: true, reservations: db.reservations });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();

    if (body.action === "cancel") {
      const reservationId = body.id;
      db.reservations = db.reservations.filter((r) => r.id !== reservationId);
      saveDb(db);
      return NextResponse.json({ success: true, message: "Cancelled successfully", reservations: db.reservations });
    }

    // Add reservation
    const newReservation: ReservationRecord = {
      id: body.id || `res-${Date.now()}`,
      bookId: body.bookId || body.id,
      title: body.title,
      author: body.author || "",
      image: body.image || "/cover_fiction.jpg",
      userId: body.userId || "U-1002",
      userName: body.userName || "ด.ญ. แมนนะ น่ารัก",
      requestDate: body.requestDate || new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }),
      status: body.status || "รอคิว",
      statusColor: body.statusColor || "text-amber-600 bg-amber-100"
    };

    // Check duplicate
    if (!db.reservations.some((r) => r.title === newReservation.title)) {
      db.reservations.unshift(newReservation);
      saveDb(db);
    }

    return NextResponse.json({ success: true, reservations: db.reservations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
