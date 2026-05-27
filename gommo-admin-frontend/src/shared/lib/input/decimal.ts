/** M\u00e1scara visual; retorno sem separador de milhar, ponto decimal */
export function maskDecimal(value: string, maxDecimals = 4): string {
  let raw = value.replace(/[^\d.,-]/g, "");
  const negative = raw.startsWith("-");
  raw = raw.replace(/-/g, "");
  raw = raw.replace(/\./g, ",");

  const parts = raw.split(",");
  const intPart = (parts[0] ?? "").replace(/\D/g, "");
  let decPart = (parts[1] ?? "").replace(/\D/g, "").slice(0, maxDecimals);

  if (parts.length > 1) {
    decPart = decPart.slice(0, maxDecimals);
    return `${negative ? "-" : ""}${intPart},${decPart}`;
  }
  return `${negative ? "-" : ""}${intPart}`;
}

export function unmaskDecimal(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const negative = trimmed.startsWith("-");
  const n = trimmed.replace(/-/g, "").replace(/\./g, "").replace(",", ".");
  return negative ? `-${n}` : n;
}
