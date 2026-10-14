import fs from "fs";
import path from "path";
import { INITIAL_BOOKS, BookItem } from "@/data/initialBooks";

export interface BorrowRecord {
  id: string;
  bookId: string;
  title: string;
  author?: string;
  userId: string;
  userName?: string;
  borrowDate: string;
  dueDate: string;
  status: string;
  statusColor: string;
}

export interface ReservationRecord {
  id: string;
  bookId: string;
  title: string;
  author: string;
  image: string;
  userId?: string;
  userName?: string;
  requestDate: string;
  status: string;
  statusColor: string;
}

export interface HistoryRecord {
  id: string;
  bookId?: string;
  title: string;
  author?: string;
  userId?: string;
  borrowDate: string;
  returnDate: string;
  status: string;
  statusColor: string;
}

export interface DatabaseSchema {
  books: BookItem[];
  borrowed: BorrowRecord[];
  reservations: ReservationRecord[];
  history: HistoryRecord[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "library_db.json");
const TMP_FILE = path.join(process.platform === "win32" ? DB_DIR : "/tmp", "library_db_active.json");

const DEFAULT_DB: DatabaseSchema = {
  books: INITIAL_BOOKS,
  borrowed: [
    {
      id: "bw-1",
      bookId: "B-001",
      title: "คอมพิวเตอร์พื้นฐาน ม.4-6",
      author: "กระทรวงศึกษาธิการ",
      userId: "U-1001",
      userName: "ด.ช. สมชาย สายลม",
      borrowDate: "05 ต.ค. 2568",
      dueDate: "19 ต.ค. 2568",
      status: "ปกติ",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      id: "bw-2",
      bookId: "B-002",
      title: "วรรณกรรมเยาวชน",
      author: "เจ.เค. โรว์ลิง",
      userId: "U-1002",
      userName: "ด.ญ. แมนนะ น่ารัก",
      borrowDate: "01 ต.ค. 2568",
      dueDate: "15 ต.ค. 2568",
      status: "ใกล้ถึงกำหนด",
      statusColor: "text-amber-600 bg-amber-50 border-amber-200"
    }
  ],
  reservations: [
    {
      id: "res-1",
      bookId: "B-002",
      title: "วรรณกรรมเยาวชน",
      author: "เจ.เค. โรว์ลิง",
      image: "/cover_fiction.jpg",
      userId: "U-1002",
      userName: "ด.ญ. แมนนะ น่ารัก",
      requestDate: "28 ก.ย. 2568",
      status: "รอคิว",
      statusColor: "text-amber-600 bg-amber-100"
    },
    {
      id: "res-2",
      bookId: "B-001",
      title: "คอมพิวเตอร์พื้นฐาน ม.4-6",
      author: "กระทรวงศึกษาธิการ",
      image: "/cover_academic.jpg",
      userId: "U-1002",
      userName: "ด.ญ. แมนนะ น่ารัก",
      requestDate: "05 ต.ค. 2568",
      status: "พร้อมรับ",
      statusColor: "text-emerald-600 bg-emerald-100"
    }
  ],
  history: [
    {
      id: "hist-1",
      bookId: "B-004",
      title: "สารานุกรมสัตว์โลก",
      author: "National Geographic",
      userId: "U-1001",
      borrowDate: "20 ก.ย. 2568",
      returnDate: "27 ก.ย. 2568",
      status: "คืนแล้ว",
      statusColor: "text-slate-600 bg-slate-50 border-slate-200"
    },
    {
      id: "hist-2",
      bookId: "B-006",
      title: "เวทมนตร์และความลับ",
      author: "ผู้แต่ง นิรนาม",
      userId: "U-1002",
      borrowDate: "15 ก.ย. 2568",
      returnDate: "22 ก.ย. 2568",
      status: "คืนแล้ว",
      statusColor: "text-slate-600 bg-slate-50 border-slate-200"
    }
  ]
};

declare global {
  // eslint-disable-next-line no-var
  var _globalLibraryDb: DatabaseSchema | undefined;
}

export function getDb(): DatabaseSchema {
  if (globalThis._globalLibraryDb) {
    return globalThis._globalLibraryDb;
  }

  // 1. Try reading from TMP_FILE (for serverless environments where /tmp is writable)
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.books) && parsed.books.length > 0) {
        globalThis._globalLibraryDb = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  // 2. Try reading from primary DB_FILE
  try {
    if (!fs.existsSync(DB_DIR)) {
      try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (e) {}
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.books) && parsed.books.length > 0) {
        globalThis._globalLibraryDb = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read DB_FILE, using memory fallback:", err);
  }

  const initial = JSON.parse(JSON.stringify(DEFAULT_DB));
  globalThis._globalLibraryDb = initial;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
  } catch (e) {}
  return initial;
}

export function saveDb(data: DatabaseSchema): boolean {
  globalThis._globalLibraryDb = data;
  let written = false;

  try {
    if (!fs.existsSync(DB_DIR)) {
      try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (e) {}
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    written = true;
  } catch (err) {
    // Expected on read-only serverless filesystems like Vercel
  }

  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), "utf-8");
    written = true;
  } catch (e) {}

  return written;
}

export function resetDb(): DatabaseSchema {
  const fresh = JSON.parse(JSON.stringify(DEFAULT_DB));
  globalThis._globalLibraryDb = fresh;
  saveDb(fresh);
  return fresh;
}

export { findBookByAnyCode } from "./bookMatcher";


