import { NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

export async function POST() {
  try {
    const db = resetDb();
    return NextResponse.json({ success: true, message: "Database reset to defaults", books: db.books });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
