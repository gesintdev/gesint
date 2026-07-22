import type { ReactNode } from "react";

import { GOMMO_SECONDARY_COLOR } from "@/shared/components/ui/input/InputColor";

export type KanbanItem = {
    id: string;
    title: string;
    subtitle?: string;
    meta?: ReactNode;
};

export type KanbanColumn<TItem extends KanbanItem = KanbanItem> = {
    id: string;
    title: string;
    /** Hex `#RRGGBB`. Se omitido, usa a cor secundária do layout. */
    color?: string | null;
    items: TItem[];
    /**
     * Disparado ao soltar um card nesta coluna vindo de outra coluna.
     * O item e opcional no sentido de tipagem flexivel do consumidor; o board sempre passa o card.
     */
    onDrop?: (item?: TItem) => void;
};

export type KanbanItemMoveEvent = {
    itemId: string;
    fromColumnId: string;
    toColumnId: string;
    fromIndex: number;
    toIndex: number;
};

export function resolveKanbanColumnColor(color?: string | null): string {
    const trimmed = color?.trim();
    if (trimmed && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
        return trimmed.toUpperCase();
    }
    if (typeof window !== "undefined") {
        const fromCss = getComputedStyle(document.documentElement)
            .getPropertyValue("--color-secondary")
            .trim();
        if (fromCss) {
            if (/^#[0-9A-Fa-f]{6}$/i.test(fromCss)) return fromCss.toUpperCase();
            // DaisyUI pode expor oklch/rgb — fallback estável do token.
            if (fromCss.startsWith("#")) return fromCss;
        }
    }
    return GOMMO_SECONDARY_COLOR;
}
