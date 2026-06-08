import type { LineItem, Quote, Invoice, InvoiceStatus } from "./types";

/**
 * Display status for an invoice. "overdue" is derived from the due date rather
 * than set by hand, so an unpaid invoice past its due date shows as overdue.
 */
export function effectiveInvoiceStatus(inv: {
  status: InvoiceStatus;
  dueDate?: string;
}): InvoiceStatus {
  if (inv.status === "paid") return "paid";
  if (inv.dueDate) {
    const due = new Date(inv.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!Number.isNaN(due.getTime()) && due < today) return "overdue";
  }
  return "unpaid";
}

/** Compute the total for a single line item based on its pricing type. */
export function lineItemTotal(item: LineItem): number {
  const qty = item.quantity || 1;
  switch (item.type) {
    case "hourly":
      return (item.rate || 0) * (item.hours || 0) * (item.days || 0) * qty;
    case "daily":
      return (item.rate || 0) * (item.days || 0) * qty;
    case "fixed":
      return (item.rate || 0) * qty;
    default:
      return 0;
  }
}

/** Human-readable breakdown of how a line item total is reached. */
export function lineItemBreakdown(item: LineItem, currency = "R"): string {
  const qty = item.quantity || 1;
  const qtyPart = qty > 1 ? ` × ${qty}` : "";
  switch (item.type) {
    case "hourly":
      return `${currency}${formatNumber(item.rate)}/hr × ${
        item.hours || 0
      } hrs × ${item.days || 0} days${qtyPart}`;
    case "daily":
      return `${currency}${formatNumber(item.rate)}/day × ${
        item.days || 0
      } days${qtyPart}`;
    case "fixed":
      return `${currency}${formatNumber(item.rate)}${qtyPart}`;
    default:
      return "";
  }
}

export interface DocTotals {
  subtotal: number;
  vat: number;
  total: number;
}

export function documentTotals(doc: Quote | Invoice): DocTotals {
  const subtotal = doc.items.reduce((sum, i) => sum + lineItemTotal(i), 0);
  const vat = doc.vatEnabled ? subtotal * (doc.vatRate || 0) : 0;
  return { subtotal, vat, total: subtotal + vat };
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatCurrency(n: number, symbol = "R"): string {
  return `${symbol} ${formatNumber(n)}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
