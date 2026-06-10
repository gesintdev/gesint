import { digitsOnly } from "@/shared/lib/input/digits";
/** Valor em centavos (string de inteiros) -> exibi\u00e7\u00e3o BRL */
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
