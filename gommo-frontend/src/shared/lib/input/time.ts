import { digitsOnly } from "@/shared/lib/input/digits";

/**
 * Máscara visual HH:mm.
 * 1–2 dígitos: hora em digitação.
 * 3 dígitos (`830`): hora simples → `08:30`.
 * 4 dígitos (`0830` / `1230`): `08:30` / `12:30`.
 */
export function maskTimeInput(value: string): string {
    const d = digitsOnly(value).slice(0, 4);
    if (d.length === 0) return "";
    if (d.length <= 2) return d;
    if (d.length === 3) {
        // Primeiro dígito ≠ 0 → hora 0X (ex.: 830 → 08:30)
        return `0${d[0]}:${d.slice(1)}`;
    }
    return `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** Converte valor canônico HH:mm para exibição HH:mm. */
export function timeToDisplay(time: string): string {
    if (!time) return "";
    const normalized = time.replace(".", ":");
    const [hour, minute] = normalized.split(":");
    if (!hour) return "";
    if (!minute) return hour;
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/**
 * Converte digitação HH:mm / HH.MM / dígitos para HH:mm.
 * Hora inteira: `8` ou `08` → `08:00`.
 * Três dígitos: `830` → `08:30` (hora 0X quando o 1º dígito não é zero).
 */
export function parseTimeInputToValue(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    const d = digitsOnly(trimmed).slice(0, 4);
    if (!d) return null;

    let hour: number;
    let minute: number;

    if (d.length <= 2) {
        hour = Number(d);
        minute = 0;
    } else if (d.length === 3) {
        // 830 → 08:30 (primeiro dígito é a hora; completa com zero à esquerda)
        hour = Number(d[0]);
        minute = Number(d.slice(1));
    } else if (d[0] !== "0" && Number(d.slice(0, 2)) > 23) {
        // Caso extremo: interpreta como 0H:MM + dígito extra inválido
        return null;
    } else {
        hour = Number(d.slice(0, 2));
        minute = Number(d.slice(2));
    }

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    if (hour > 23 || minute > 59) return null;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** @deprecated Use maskTimeInput */
export const maskTimeDot = maskTimeInput;
/** @deprecated Use timeToDisplay */
export const timeToDisplayDot = timeToDisplay;
/** @deprecated Use parseTimeInputToValue */
export const parseTimeDotToValue = parseTimeInputToValue;

export const HOUR_ITEMS = Array.from({ length: 24 }, (_, i) => {
    const value = String(i).padStart(2, "0");
    return { value, label: value };
});

export const MINUTE_ITEMS = Array.from({ length: 60 }, (_, i) => {
    const value = String(i).padStart(2, "0");
    return { value, label: value };
});
