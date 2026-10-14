import { NextResponse } from "next/server";
import { getDb, saveDb, HistoryRecord } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { bookId, recordId } = await req.json();
    const db = getDb();

    // Find the book
    const book = db.books.find(
      (b) => b.id === bookId || b.id === bookId?.replace("B-000", "B-0") || b.id === bookId?.replace("B-0", "B-000")
    );

    if (book) {
      book.available = true;
      book.status = "ว่าง";
    }

    // Find borrow record
    let returnedRecordIndex = -1;
    if (recordId) {
      returnedRecordIndex = db.borrowed.findIndex((r) => r.id === recordId);
    } else if (bookId) {
      returnedRecordIndex = db.borrowed.findIndex(
        (r) => r.bookId === bookId || r.bookId === bookId?.replace("B-000", "B-0") || r.bookId === bookId?.replace("B-0", "B-000")
      );
    }

    const today = new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });

    if (returnedRecordIndex >= 0) {
      const rec = db.borrowed[returnedRecordIndex];
      db.borrowed.splice(returnedRecordIndex, 1);

      const hist: HistoryRecord = {
        id: `hist-${Date.now()}`,
        bookId: rec.bookId,
        title: rec.title,
        author: rec.author,
        userId: rec.userId,
        borrowDate: rec.borrowDate,
        returnDate: today,
        status: "คืนแล้ว",
        statusColor: "text-slate-600 bg-slate-50 border-slate-200"
      };
      db.history.unshift(hist);
    } else if (book) {
      const hist: HistoryRecord = {
        id: `hist-${Date.now()}`,
        bookId: book.id,
        title: book.title,
        author: book.author,
        borrowDate: today,
        returnDate: today,
        status: "คืนแล้ว",
        statusColor: "text-slate-600 bg-slate-50 border-slate-200"
      };
      db.history.unshift(hist);
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      message: `คืนหนังสือ ${book?.title ? `"${book.title}" ` : ""}เรียบร้อยแล้ว!`,
      book,
      borrowed: db.borrowed,
      history: db.history
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
