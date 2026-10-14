import { NextResponse } from "next/server";
import { getDb, saveDb, BorrowRecord } from "@/lib/db";

export async function GET() {
  const db = getDb();
  return NextResponse.json({ success: true, borrowed: db.borrowed, history: db.history });
}

export async function POST(req: Request) {
  try {
    const { bookId, userId, userName } = await req.json();
    const db = getDb();

    // Find the book (support normalizing B-001 vs B-0001)
    const book = db.books.find(
      (b) => b.id === bookId || b.id === bookId?.replace("B-000", "B-0") || b.id === bookId?.replace("B-0", "B-000")
    );

    if (!book) {
      return NextResponse.json({ success: false, message: `ไม่พบข้อมูลหนังสือรหัส: ${bookId}` }, { status: 404 });
    }

    if (!book.available) {
      return NextResponse.json({ success: false, message: `หนังสือ "${book.title}" กำลังถูกยืมอยู่` }, { status: 400 });
    }

    // Update book status
    book.available = false;
    book.status = "ถูกยืม";

    // Create borrow record
    const today = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
    const dueDate = new Date(Date.now() + 14 * 86400000).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });

    const newRecord: BorrowRecord = {
      id: `bw-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      userId: userId || "U-1002",
      userName: userName || "ด.ญ. แมนนะ น่ารัก",
      borrowDate: today,
      dueDate: dueDate,
      status: "ปกติ",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
    };

    db.borrowed.unshift(newRecord);
    saveDb(db);

    return NextResponse.json({
      success: true,
      message: `ยืมหนังสือ "${book.title}" สำเร็จ!`,
      book,
      borrowRecord: newRecord,
      borrowed: db.borrowed
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
