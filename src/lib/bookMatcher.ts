import { BookItem } from "@/data/initialBooks";

export function findBookByAnyCode(books: BookItem[], rawCode: string): BookItem | undefined {
  if (!rawCode || typeof rawCode !== "string") return undefined;

  let code = rawCode.trim();
  try {
    code = decodeURIComponent(code);
  } catch (e) {}

  // Parse if it's a URL
  if (code.includes("borrow=")) {
    code = code.split("borrow=")[1].split("&")[0].split("#")[0];
  } else if (code.includes("code=")) {
    code = code.split("code=")[1].split("&")[0].split("#")[0];
  } else if (code.includes("q=")) {
    code = code.split("q=")[1].split("&")[0].split("#")[0];
  } else if (code.includes("/") && !code.startsWith("978")) {
    const parts = code.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) code = last.split("?")[0].split("#")[0];
  }

  code = code.trim().replace(/^['"]|['"]$/g, '');
  const codeUpper = code.toUpperCase();
  const digitsOnly = code.replace(/\D/g, "");

  // 1. Direct match on ID (case-insensitive)
  const directId = books.find((b) => b.id.toUpperCase() === codeUpper);
  if (directId) return directId;

  // 2. Normalized alphanumeric match (B-001 vs B001 vs B-0001)
  const normalizedCode = codeUpper.replace(/[^A-Z0-9]/g, "");
  const normalizedMatch = books.find((b) => b.id.toUpperCase().replace(/[^A-Z0-9]/g, "") === normalizedCode);
  if (normalizedMatch) return normalizedMatch;

  // 3. Numeric ID match (e.g. user scanned "1" or "001" which corresponds to "B-001")
  if (digitsOnly.length > 0 && digitsOnly.length <= 4) {
    const num = parseInt(digitsOnly, 10);
    const numMatch = books.find((b) => {
      const bDigits = b.id.replace(/\D/g, "");
      return bDigits ? parseInt(bDigits, 10) === num : false;
    });
    if (numMatch) return numMatch;
  }

  // 4. ISBN match (exact string or digits-only)
  const isbnExact = books.find((b) => b.isbn && b.isbn.toUpperCase() === codeUpper);
  if (isbnExact) return isbnExact;

  const isbnNoDash = books.find((b) => b.isbn && b.isbn.replace(/-/g, "").toUpperCase() === codeUpper.replace(/-/g, ""));
  if (isbnNoDash) return isbnNoDash;

  if (digitsOnly.length >= 8) {
    const isbnDigitsMatch = books.find((b) => {
      if (!b.isbn) return false;
      const bIsbnDigits = b.isbn.replace(/\D/g, "");
      return bIsbnDigits === digitsOnly || bIsbnDigits.includes(digitsOnly) || digitsOnly.includes(bIsbnDigits);
    });
    if (isbnDigitsMatch) return isbnDigitsMatch;
  }

  // 5. Title match (if the QR code contains title)
  const titleMatch = books.find((b) => b.title && b.title.trim().toLowerCase() === code.toLowerCase());
  if (titleMatch) return titleMatch;

  return undefined;
}
