import { NextResponse } from "next/server";
import { getDb, saveDb, BorrowRecord, findBookByAnyCode } from "@/lib/db";
import { BookItem } from "@/data/initialBooks";

export async function GET(req: Request) {
  const db = getDb();
  return NextResponse.json(
    { success: true, borrowed: db.borrowed, history: db.history },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const { bookId, userId, userName, autoAdd } = await req.json();
    const db = getDb();

    // 1. Find book using robust multi-attribute lookup
    let book = findBookByAnyCode(db.books, bookId);

    // 2. If not found, check if autoAdd was requested or if it's a real book barcode to register
    if (!book && autoAdd) {
      const cleanId = String(bookId || "").trim();
      const generatedId = cleanId.toUpperCase().startsWith("B-") 
        ? cleanId.toUpperCase() 
        : `B-${String(db.books.length + 1).padStart(3, "0")}`;

      const newBook: BookItem = {
        id: generatedId,
        title: cleanId.startsWith("978") ? `หนังสือรหัส ISBN: ${cleanId}` : `หนังสือรหัส ${cleanId}`,
        author: "ไม่ระบุผู้แต่ง",
        isbn: cleanId,
        pages: 200,
        categoryId: "other",
        category: "ทั่วไป",
        image: "/cover_academic.jpg",
        status: "ถูกยืม",
        available: false
      };

      db.books.unshift(newBook);
      book = newBook;
    }

    if (!book) {
      return NextResponse.json({ 
        success: false, 
        canAutoAdd: true,
        scannedCode: bookId,
        message: `ไม่พบข้อมูลหนังสือรหัส: ${bookId}` 
      }, { status: 404 });
    }

    if (!book.available && !autoAdd) {
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
      books: db.books,
      borrowRecord: newRecord,
      borrowed: db.borrowed
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
