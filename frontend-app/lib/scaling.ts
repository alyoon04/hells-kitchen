export function formatAmount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

export function scaleAmount(raw: string, factor: number): string {
  const trimmed = raw.trim();

  const fractionMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    const num = Number(fractionMatch[1]);
    const den = Number(fractionMatch[2]);
    if (den !== 0) return formatAmount((num / den) * factor);
  }

  const parsed = parseFloat(trimmed);
  if (Number.isFinite(parsed) && trimmed.match(/^[\d.]+$/)) {
    return formatAmount(parsed * factor);
  }

  return factor === 1 ? raw : `${raw} ×${formatAmount(factor)}`;
}
