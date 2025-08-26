export function formatPKR(amount: number): string {
  if (!isFinite(amount)) return "PKR 0";
  try {
    // Use en-PK for grouping and PKR currency; drop non-breaking space for consistency
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/\u00A0/g, " ");
  } catch {
    // Fallback formatting
    const n = Math.max(0, Math.floor(amount || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `PKR ${n}`;
  }
}
