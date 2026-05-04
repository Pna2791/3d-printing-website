const JUNK_NAME_FRAGMENTS = new Set([
  "123456",
  "654321",
  "111111",
  "000000",
  "asdfgh",
  "qwerty",
  "abcdef",
  "testtest",
  "testuser",
  "username",
  "noname",
  "nonamee",
  "aaaaaa",
  "bbbbbb",
]);

/** Bỏ ký tự không phải số (dùng trước khi kiểm tra SĐT). */
export function stripNonDigits(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Chuẩn hóa SĐT VN về dạng nội địa 10 số (bắt đầu bằng 0).
 * - `+84935864160` → `0935864160` (84 + 9 số thuê bao)
 * - `0084935864160` → `0935864160`
 */
export function normalizeVietnamesePhoneDigits(raw: string): string {
  const d = stripNonDigits(raw);
  if (d.startsWith("0084") && d.length >= 12) {
    return `0${d.slice(4)}`;
  }
  if (d.startsWith("84") && d.length === 11) {
    return `0${d.slice(2)}`;
  }
  return d;
}

/** SĐT VN di động: đúng 10 số, bắt đầu 03 / 05 / 07 / 08 / 09 (đã chuẩn hóa nội địa). */
export function isValidVietnameseMobile10(digits: string): boolean {
  return /^0(3|5|7|8|9)\d{8}$/.test(digits);
}

export type NameValidation = { ok: true; name: string } | { ok: false; message: string };

/**
 * Họ tên: trim, tối thiểu 2 ký tự, chỉ chữ cái (Unicode, có dấu) và khoảng trắng / dấu nối tên;
 * không số; chặn chuỗi rác phổ biến.
 */
export function validateCustomerName(raw: string): NameValidation {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2) {
    return { ok: false, message: "Họ tên cần ít nhất 2 ký tự." };
  }
  if (name.length > 120) {
    return { ok: false, message: "Họ tên quá dài." };
  }
  if (/\d/.test(name)) {
    return { ok: false, message: "Họ tên không được chứa số." };
  }
  if (!/^[\p{L}\s'-]+$/u.test(name)) {
    return { ok: false, message: "Họ tên chỉ dùng chữ cái, khoảng trắng hoặc dấu (-, ')." };
  }
  const compact = name.toLowerCase().replace(/\s+/g, "");
  for (const junk of JUNK_NAME_FRAGMENTS) {
    if (compact.includes(junk) || name.toLowerCase() === junk) {
      return { ok: false, message: "Vui lòng nhập họ tên thật." };
    }
  }
  return { ok: true, name };
}

export type PhoneValidation = { ok: true; digits: string } | { ok: false; message: string };

export function validateVietnamesePhone(raw: string): PhoneValidation {
  const digits = normalizeVietnamesePhoneDigits(raw);
  if (digits.length !== 10) {
    return {
      ok: false,
      message:
        "Số điện thoại không hợp lệ. Dùng 10 số nội địa (vd: 093…) hoặc quốc tế +84 (vd: +8493…).",
    };
  }
  if (!isValidVietnameseMobile10(digits)) {
    return { ok: false, message: "Số máy không hợp lệ (dùng đầu số 03, 05, 07, 08, 09)." };
  }
  return { ok: true, digits };
}

const NOTE_MAX = 2000;

export type NoteValidation = { ok: true; note: string } | { ok: false; message: string };

export function validateOrderNotes(raw: string): NoteValidation {
  const note = raw.trim();
  if (note.length > NOTE_MAX) {
    return { ok: false, message: `Ghi chú tối đa ${NOTE_MAX} ký tự.` };
  }
  return { ok: true, note };
}
