export function splitLines(value?: string | null): string[] {
    if (!value) return [];
    return value
        .split(/\r?\n|;/)
        .map((line) => line.trim())
        .filter(Boolean);
}

export function formatSalaryRange(min?: number | null, max?: number | null): string | null {
    const format = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
            value,
        );
    if (min != null && max != null) return `${format(min)} – ${format(max)}`;
    if (min != null) return format(min);
    if (max != null) return format(max);
    return null;
}

export function formatDateLabel(value?: string | null): string | null {
    if (!value) return null;
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("pt-BR");
}

/** "Publicada há 3 dias" — leitura rápida na lista de vagas. */
export function formatRelativePublished(value?: string | null, now = new Date()): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
    if (days <= 0) return "Publicada hoje";
    if (days === 1) return "Publicada ontem";
    if (days < 30) return `Publicada há ${days} dias`;
    return `Publicada em ${date.toLocaleDateString("pt-BR")}`;
}

/** Vaga com data prevista de encerramento nos próximos 7 dias. */
export function isClosingSoon(expectedCompletionDate?: string | null, now = new Date()): boolean {
    if (!expectedCompletionDate) return false;
    const end = new Date(`${expectedCompletionDate}T23:59:59`);
    if (Number.isNaN(end.getTime())) return false;
    const diff = end.getTime() - now.getTime();
    return diff >= 0 && diff <= 7 * 86_400_000;
}

/** Aceita links de YouTube/Vimeo e devolve a URL de embed (ou null). */
export function toVideoEmbedUrl(url?: string | null): string | null {
    if (!url) return null;
    const value = url.trim();
    const youtube = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
    if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
    const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return null;
}

export function isSafeHttpUrl(url?: string | null): boolean {
    if (!url) return false;
    return /^https?:\/\//i.test(url.trim());
}
