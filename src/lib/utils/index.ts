import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: "ar" | "en" = "ar"): string {
  const formatted = amount.toLocaleString(locale === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return locale === "ar" ? `${formatted} ج.م` : `${formatted} EGP`;
}

export function generateOrderRef(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `BD-${year}-${randomNum}`;
}

export function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Matches Egyptian mobile patterns: 010, 011, 012, 015 followed by 8 digits, or +2010...
  const regex = /^(?:\+?20|0)?1[0125][0-9]{8}$/;
  return regex.test(cleaned);
}

export function normalizeEgyptianPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+20")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("20") && cleaned.length === 12) {
    cleaned = "0" + cleaned.slice(2);
  }
  return cleaned;
}
