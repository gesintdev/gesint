export type MaskNumberOptions = {
    integer?: boolean;
    decimalPlaces?: number;
    thousandSeparator?: boolean;
};

function formatThousands(digits: string): string {
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function maskNumber(value: string, options: MaskNumberOptions = {}): string {
    const { integer = false, decimalPlaces = 2, thousandSeparator = false } = options;
    let raw = value.replace(/[^\d.,-]/g, "");
    const negative = raw.startsWith("-");
    raw = raw.replace(/-/g, "");
    if (integer) {
        const intPart = raw.replace(/\D/g, "");
        const formatted = thousandSeparator ? formatThousands(intPart) : intPart;
        return `${negative ? "-" : ""}${formatted}`;
    }
    raw = raw.replace(/\./g, ",");
    const parts = raw.split(",");
    const intDigits = (parts[0] ?? "").replace(/\D/g, "");
    const decPart = (parts[1] ?? "").replace(/\D/g, "").slice(0, decimalPlaces);
    const intFormatted = thousandSeparator ? formatThousands(intDigits) : intDigits;
    if (parts.length > 1 || raw.endsWith(",")) {
        return `${negative ? "-" : ""}${intFormatted},${decPart}`;
    }
    return `${negative ? "-" : ""}${intFormatted}`;
}

export function unmaskNumber(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const negative = trimmed.startsWith("-");
    const body = trimmed.replace(/-/g, "");
    const commaIdx = body.lastIndexOf(",");
    if (commaIdx >= 0) {
        const intPart = body.slice(0, commaIdx).replace(/\./g, "").replace(/\D/g, "");
        const decPart = body.slice(commaIdx + 1).replace(/\D/g, "");
        const n = decPart ? `${intPart}.${decPart}` : intPart;
        return negative ? `-${n}` : n;
    }
    const intOnly = body.replace(/\./g, "").replace(/\D/g, "");
    return negative ? `-${intOnly}` : intOnly;
}

export function numberMaskOptions(options: MaskNumberOptions): MaskNumberOptions {
    return {
        integer: options.integer ?? false,
        decimalPlaces: options.decimalPlaces ?? 2,
        thousandSeparator: options.thousandSeparator ?? false,
    };
}

export function defaultNumberPlaceholder(options: MaskNumberOptions): string {
    const resolved = numberMaskOptions(options);
    if (resolved.integer) return "0";
    return `0,${"0".repeat(resolved.decimalPlaces ?? 2)}`;
}

export function numberToMaskInput(
    value: number | null | undefined,
    options: Pick<MaskNumberOptions, "integer" | "decimalPlaces">,
): string {
    if (value == null || Number.isNaN(value)) return "";
    if (options.integer) return String(Math.trunc(value));
    const places = options.decimalPlaces ?? 2;
    return value.toFixed(places);
}

export function unmaskedStringToNumber(unmasked: string, integer: boolean): number | null {
    if (!unmasked) return null;
    const n = integer ? Number.parseInt(unmasked, 10) : Number.parseFloat(unmasked);
    return Number.isNaN(n) ? null : n;
}
