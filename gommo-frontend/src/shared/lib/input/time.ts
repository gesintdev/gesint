import { digitsOnly } from "@/shared/lib/input/digits";

/**
 * Máscara visual progressiva HH:mm (enquanto digita).
 * 1–2 dígitos: hora em digitação (`9`, `12`).
 * 3 dígitos (`123`): `12:3` — sem zero à esquerda prematuro (`01:23`).
 * 4 dígitos (`1231` / `0830`): `12:31` / `08:30`.
 * Completar 3 dígitos como `H:MM` (`830` → `08:30`) fica em `parseTimeInputToValue` (blur/commit).
 */
export function maskTimeInput(value: string): string {
    const d = digitsOnly(value).slice(0, 4);
    if (d.length === 0) return "";
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** Quantidade de dígitos à esquerda do cursor (ignora `:` e outros). */
export function digitsBeforeCursor(value: string, cursor: number): number {
    return digitsOnly(value.slice(0, Math.max(0, cursor))).length;
}

/** Posição do caret no valor mascarado após N dígitos. */
export function cursorForDigitCount(masked: string, digitCount: number): number {
    if (digitCount <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < masked.length; i++) {
        const ch = masked[i]!;
        if (ch >= "0" && ch <= "9") {
            seen += 1;
            if (seen >= digitCount) return i + 1;
        }
    }
    return masked.length;
}

/**
 * Aplica `maskTimeInput` preservando o caret por contagem de dígitos
 * (evita o jump para o fim em inputs controlados).
 */
export function maskTimeInputWithCaret(
    raw: string,
    selectionStart: number | null,
): {value: string; caret: number} {
    const cursor = selectionStart ?? raw.length;
    const value = maskTimeInput(raw);
    return {
        value,
        caret: cursorForDigitCount(value, digitsBeforeCursor(raw, cursor)),
    };
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
