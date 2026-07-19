import { digitsOnly } from "@/shared/lib/input/digits";

function maskSinglePhone(value: string): string {
    const d = digitsOnly(value).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/** Máscara de telefone BR; aceita múltiplos números separados por `/`. */
export function maskPhone(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.includes("/")) {
        return trimmed
            .split("/")
            .map((part) => maskSinglePhone(part.trim()))
            .filter(Boolean)
            .join(" / ");
    }
    return maskSinglePhone(trimmed);
}
