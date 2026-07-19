import { digitsOnly } from "@/shared/lib/input/digits";

/** Valor em centavos (string de inteiros) -> exibição BRL */
export function maskCurrencyFromCents(cents: string): string {
    const d = digitsOnly(cents);
    if (!d) return "";
    const n = Number(d);
    return (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseCurrencyToCents(display: string): string {
    const d = digitsOnly(display);
    return d.replace(/^0+(?=\d)/, "") || "";
}

export function centsToDecimal(cents: string): string {
    if (!cents) return "";
    const n = Number(cents);
    return (n / 100).toFixed(2);
}

/** Decimal (number) -> string de centavos para máscara */
export function decimalToCents(value?: number | null): string {
    if (value == null || !Number.isFinite(value)) return "";
    return String(Math.round(value * 100));
}

/** String de centavos -> number decimal (undefined se vazio) */
export function centsToNumber(cents: string): number | undefined {
    if (!cents) return undefined;
    return Number(cents) / 100;
}
