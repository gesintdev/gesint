const LOWERCASE_PARTICLES = new Set(["da", "de", "do", "dos", "das", "e", "del", "van", "von"]);

export function formatPersonName(value?: string | null): string {
    if (!value?.trim()) {
        return value ?? "";
    }
    return value
        .trim()
        .split(/\s+/)
        .map((token, index) => formatToken(token, index > 0))
        .join(" ");
}

function formatToken(token: string, afterFirst: boolean): string {
    const lower = token.toLowerCase();
    if (afterFirst && LOWERCASE_PARTICLES.has(lower)) {
        return lower;
    }
    if (lower.length <= 1) {
        return lower.toUpperCase();
    }
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}
