import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ฟังก์ชันช่วยรวม Class Name (Tailwind)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const nfNoDecimal = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const nf2 = (value: number, digits = 0) =>
  new Intl.NumberFormat("th-TH", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

const nfInput = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });

// จัดรูปแบบตัวเลข (มี comma, ไม่มีทศนิยม)
export const formatNumber = (value: string | number) => {
  const num = typeof value === "string" ? Number(String(value).replace(/,/g, "") || 0) : value;
  return isNaN(num) ? "0" : nfNoDecimal.format(num);
};

// จัดรูปแบบตัวเลขพร้อมทศนิยม
export const formatNumber2 = (value: number, digits = 0) => {
  return isNaN(value) ? "0" : nf2(value, digits);
};

// จัดรูปแบบสำหรับ Input Field
export function formatInputDisplay(v: string | number) {
  const num = typeof v === "string" ? Number(String(v).replace(/,/g, "") || 0) : v;
  return isNaN(num) ? "0" : nfInput.format(num);
}

// ปัดเศษทศนิยม 2 ตำแหน่ง
export const round2 = (num: number) => Math.round(num * 100) / 100;

// แปลงค่าจาก Input กลับเป็นตัวเลข
export function parseInputValue(v: string | number) {
  const num = Number(String(v || "").replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}
