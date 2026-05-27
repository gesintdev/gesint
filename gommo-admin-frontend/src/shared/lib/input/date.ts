import { digitsOnly } from "@/shared/lib/input/digits";

/** Máscara visual DD/MM/AAAA */
export function maskDateBr(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** ISO YYYY-MM-DD -> exibição DD/MM/AAAA */
export function isoToDateBr(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

/** DD/MM/AAAA -> ISO YYYY-MM-DD ou null se inválido */
export function parseDateBrToIso(br: string): string | null {
  const match = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (
    date.getUTCFullYear() !== Number(yyyy) ||
    date.getUTCMonth() + 1 !== Number(mm) ||
    date.getUTCDate() !== Number(dd)
  ) {
    return null;
  }
  return iso;
}

export function maskTime(value: string): string {
  const d = digitsOnly(value).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** ISO local YYYY-MM-DDTHH:mm */
export function splitDatetime(isoLocal: string): { date: string; time: string } {
  if (!isoLocal) return { date: "", time: "" };
  const [date, time] = isoLocal.split("T");
  return { date: date ?? "", time: (time ?? "").slice(0, 5) };
}

export function joinDatetime(date: string, time: string): string {
  if (!date) return "";
  if (!time) return date;
  return `${date}T${time}`;
}

export function splitTime(time: string): { hour: string; minute: string } {
  if (!time) return { hour: "", minute: "" };
  const [hour, minute] = time.split(":");
  return { hour: hour ?? "", minute: minute ?? "" };
}

export function joinTime(hour: string, minute: string): string {
  if (!hour || !minute) return "";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/** Exibição: DD/MM/AAAA HH:mm */
export function formatDatetimeBr(isoLocal: string): string {
  const { date, time } = splitDatetime(isoLocal);
  const br = isoToDateBr(date);
  if (!br) return "";
  const { hour, minute } = splitTime(time);
  if (!hour || !minute) return `${br} --:--`;
  return `${br} ${joinTime(hour, minute)}`;
}

export function parseIsoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
