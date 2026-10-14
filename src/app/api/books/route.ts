import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { BookItem } from "@/data/initialBooks";

export async function GET() {
  const db = getDb();
  return NextResponse.json({ success: true, books: db.books });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDb();

    if (body.action === "delete") {
      const bookId = body.id;
      db.books = db.books.filter((b) => b.id !== bookId);
      saveDb(db);
      return NextResponse.json({ success: true, message: "Deleted successfully", books: db.books });
    }

    const newBook: BookItem = body;
    const existingIndex = db.books.findIndex((b) => b.id === newBook.id);

    if (existingIndex >= 0) {
      db.books[existingIndex] = { ...db.books[existingIndex], ...newBook };
    } else {
      db.books.unshift(newBook);
    }

    saveDb(db);
    return NextResponse.json({ success: true, book: newBook, books: db.books });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
