// Formatting + status->tone helpers shared across the admin module.
// Self-contained: no imports from outside lib/admin.

export type Tone = "positive" | "attention" | "adverse" | "muted";

const POSITIVE = new Set(["active", "approved", "delivered", "successful", "read", "converted", "paid", "published", "verified"]);
const ATTENTION = new Set(["pending", "on_hold", "in_transit", "queued", "shipped", "assigned", "quoted", "new", "out_for_delivery", "created", "picked_up"]);
const ADVERSE = new Set(["rejected", "failed", "cancelled", "suspended", "returned", "escalated", "out_of_stock", "refunded", "inactive"]);

export function toneOf(status: string | null | undefined): Tone {
  const s = (status || "").toLowerCase().trim();
  if (POSITIVE.has(s)) return "positive";
  if (ATTENTION.has(s)) return "attention";
  if (ADVERSE.has(s)) return "adverse";
  return "muted";
}

export function toneClass(status: string | null | undefined): string {
  return `tag tag-${toneOf(status)}`;
}

export function displayStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return String(status).replace(/_/g, " ");
}

export function money(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function formatDate(value: unknown): string {
  if (!value || (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date))) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function relativeTime(value: unknown): string {
  if (!value || (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date))) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "—";
}
