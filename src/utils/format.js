export const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"];

export const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Expense dates are stored as UTC midnight, so format in UTC to avoid off-by-one days.
export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export const toDateInput = (d) => new Date(d).toISOString().slice(0, 10);

export const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

// RFC 4180 quoting + neutralise spreadsheet formulas (=, +, -, @).
export const csvCell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const downloadCSV = (filename, rows) => {
  const body = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + body], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ---- date helpers -------------------------------------------------------
// Expenses are stored as UTC midnight of the chosen calendar day, so personal
// pages compare calendar days (YYYY-MM-DD), not local-time instants.
export const dateKey = (d) => new Date(d).toISOString().slice(0, 10);

const pad = (n) => String(n).padStart(2, "0");
export const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const monthOf = (d) => new Date(d).getUTCMonth();
export const yearOf = (d) => new Date(d).getUTCFullYear();
