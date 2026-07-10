import { digitsOnly } from "@/shared/lib/input/digits";

/** Máscara visual HH.MM (ponto entre hora e minuto). */
export function maskTimeDot(value: string): string {
    const d = digitsOnly(value).slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}.${d.slice(2)}`;
}

/** Converte valor canônico HH:mm para exibição HH.MM. */
export function timeToDisplayDot(time: string): string {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    if (!hour) return "";
    if (!minute) return hour;
    return `${hour.padStart(2, "0")}.${minute.padStart(2, "0")}`;
}

/** Converte digitação HH.MM / HH:mm / dígitos para HH:mm. */
export function parseTimeDotToValue(raw: string): string | null {
    const masked = maskTimeDot(raw);
    if (!masked) return "";
    if (masked.length < 5) return null;
    const match = masked.match(/^(\d{2})\.(\d{2})$/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return null;
    return `${match[1]}:${match[2]}`;
}

export const HOUR_ITEMS = Array.from({ length: 24 }, (_, i) => {
    const value = String(i).padStart(2, "0");
    return { value, label: value };
});

export const MINUTE_ITEMS = Array.from({ length: 60 }, (_, i) => {
    const value = String(i).padStart(2, "0");
    return { value, label: value };
});
