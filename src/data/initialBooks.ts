export interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  pages: number;
  categoryId: string;
  category: string;
  image: string;
  status: string;
  available: boolean;
  filter?: string;
  gradient?: string;
  emoji?: string;
}

export const INITIAL_BOOKS: BookItem[] = [
  { id: "B-001", title: "คอมพิวเตอร์พื้นฐาน ม.4-6", author: "กระทรวงศึกษาธิการ", isbn: "978-616-576-123-4", pages: 320, categoryId: "academic", category: "วิชาการ", image: "/cover_academic.jpg", status: "ว่าง", available: true },
  { id: "B-002", title: "วรรณกรรมเยาวชน", author: "เจ.เค. โรว์ลิง", isbn: "978-616-04-123-4", pages: 450, categoryId: "fiction", category: "นิยาย", image: "/cover_fiction.jpg", status: "ถูกยืม", available: false },
  { id: "B-003", title: "การ์ตูนความรู้ รอบโลก", author: "นานมีบุ๊คส์", isbn: "978-616-04-567-8", pages: 180, categoryId: "comic", category: "การ์ตูน", image: "/cover_comic.jpg", status: "ว่าง", available: true },
  { id: "B-004", title: "สารานุกรมสัตว์โลก", author: "National Geographic", isbn: "978-616-00-111-1", pages: 200, categoryId: "kids", category: "หนังสือเด็ก", image: "/cover_kids.jpg", status: "ว่าง", available: true },
  { id: "B-005", title: "เทคโนโลยีและนวัตกรรม", author: "สสวท.", isbn: "978-616-00-222-2", pages: 280, categoryId: "academic", category: "วิชาการ", image: "/cover_tech.jpg", status: "ถูกยืม", available: false },
  { id: "B-006", title: "เวทมนตร์และความลับ", author: "ผู้แต่ง นิรนาม", isbn: "978-616-00-333-3", pages: 310, categoryId: "fiction", category: "นิยาย", image: "/cover_fiction.jpg", filter: "hue-rotate-90 saturate-150", status: "ว่าง", available: true },
  { id: "B-007", title: "One Piece เล่ม 1", author: "Eiichiro Oda", isbn: "978-616-00-444-4", pages: 190, categoryId: "comic", category: "การ์ตูน", image: "/cover_comic.jpg", filter: "hue-rotate-180 saturate-200", status: "ว่าง", available: true },
  { id: "B-008", title: "โลกของพืช", author: "สำนักพิมพ์ บีซีดี", isbn: "978-616-00-555-5", pages: 150, categoryId: "kids", category: "หนังสือเด็ก", image: "/cover_kids.jpg", filter: "sepia-[.5] hue-rotate-[-30deg] saturate-150", status: "ว่าง", available: true },
  { id: "B-009", title: "พจนานุกรม ไทย-อังกฤษ", author: "ราชบัณฑิตยสถาน", isbn: "978-616-00-666-6", pages: 500, categoryId: "other", category: "อื่นๆ", image: "/cover_academic.jpg", filter: "grayscale-[.5] sepia-[.3] hue-rotate-[200deg]", status: "ว่าง", available: true },
  { id: "B-010", title: "นิตยสารรายเดือน", author: "สำนักพิมพ์ XYZ", isbn: "978-616-00-777-7", pages: 50, categoryId: "other", category: "อื่นๆ", image: "/hero-elephant.jpg", status: "ว่าง", available: true },
];
