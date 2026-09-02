export const APP_NAME = "Smart Tailor";
export const CURRENCY = "GHS";
export const WHATSAPP_NUMBER = "233000000000";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const MONTHLY_PRICE = 100;

export const fmtMoney = (n: number) => `${CURRENCY} ${n.toFixed(2)}`;

// Tailoring pipeline
export const STATUS_FLOW = ["pending", "cutting", "sewing", "fitting", "completed"] as const;
export type OrderStatus = typeof STATUS_FLOW[number];

export const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; ring: string }> = {
  pending:   { label: "Pending",   color: "text-slate-500",   bg: "bg-slate-500/10",   ring: "ring-slate-500/30" },
  cutting:   { label: "Cutting",   color: "text-blue-500",    bg: "bg-blue-500/10",    ring: "ring-blue-500/30" },
  sewing:    { label: "Sewing",    color: "text-cyan-500",    bg: "bg-cyan-500/10",    ring: "ring-cyan-500/30" },
  fitting:   { label: "Fitting",   color: "text-amber-500",   bg: "bg-amber-500/10",   ring: "ring-amber-500/30" },
  completed: { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" },
};

// Standard tailoring measurement fields (free-text so unit is flexible — e.g. "38 in" or "96 cm").
export const MEASUREMENT_FIELDS = [
  "Chest", "Waist", "Hip", "Shoulder", "Sleeve length",
  "Arm hole", "Neck", "Bicep", "Length", "Inseam", "Thigh", "Ankle",
] as const;
