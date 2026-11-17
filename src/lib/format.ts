const intFormat = new Intl.NumberFormat("en-US");

const trimDecimal = (value: number, digits = 1) => {
  const fixed = value.toFixed(digits);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
};

export const formatInt = (value: number) => intFormat.format(Math.round(value));

/** Indian short scale: ₹18K, ₹4.2L, ₹1.1Cr */
export function formatINR(value: number) {
  if (value >= 1e7) return `₹${trimDecimal(value / 1e7)}Cr`;
  if (value >= 1e5) return `₹${trimDecimal(value / 1e5)}L`;
  if (value >= 1e3) return `₹${trimDecimal(value / 1e3)}K`;
  return `₹${Math.round(value)}`;
}

export function formatUSD(value: number, digits = 1) {
  if (value >= 1e6) return `$${trimDecimal(value / 1e6, digits)}M`;
  if (value >= 1e3) return `$${trimDecimal(value / 1e3, 0)}K`;
  return `$${Math.round(value)}`;
}

/** 251 → "04:11" */
export function formatClock(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const formatSigned = (value: number, suffix = "%") =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value)}${suffix}`;

export const formatPct = (value: number, digits = 0) => `${value.toFixed(digits)}%`;
