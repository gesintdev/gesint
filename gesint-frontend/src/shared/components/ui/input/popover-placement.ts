"use client";

import { type RefObject, useCallback, useEffect, useLayoutEffect, useState } from "react";

export const POPOVER_EDGE = 8;

export type PopoverAlign = "start" | "end";

export type AnchoredPanelBox = {
    top: number;
    left: number;
    width: number;
    /** Altura máxima quando o lado escolhido é menor que o painel. `null` quando cabe inteiro. */
    maxHeight: number | null;
    openUp: boolean;
};

function clamp(value: number, min: number, max: number) {
    if (max < min) return min;
    return Math.min(max, Math.max(min, value));
}

/**
 * Posiciona um painel fixo no campo. Abre para baixo. Se a altura não cabe
 * abaixo da tela e há mais espaço acima, abre para cima.
 */
export function placeAnchoredPanel(options: {
    anchor: DOMRect;
    panelWidth: number;
    panelHeight: number;
    gap?: number;
    edge?: number;
    align?: PopoverAlign;
}): AnchoredPanelBox {
    const { anchor, gap = 4, edge = POPOVER_EDGE, align = "start" } = options;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const width = Math.min(Math.max(options.panelWidth, 1), Math.max(viewportW - edge * 2, 1));
    const left = clamp(align === "end" ? anchor.right - width : anchor.left, edge, viewportW - width - edge);

    const spaceBelow = Math.max(0, viewportH - anchor.bottom - gap - edge);
    const spaceAbove = Math.max(0, anchor.top - gap - edge);
    const height = Math.max(options.panelHeight, 1);
    const openUp = height > spaceBelow && spaceAbove > spaceBelow;
    const available = openUp ? spaceAbove : spaceBelow;
    const capped = height > available;
    const maxHeight = capped ? available : null;
    const used = capped ? available : height;
    const top = openUp ? Math.max(edge, anchor.top - gap - used) : anchor.bottom + gap;

    return { top, left, width, maxHeight, openUp };
}

type AnchoredPanelOptions = {
    gap?: number;
    align?: PopoverAlign;
    /** `anchor` trava a largura no campo. `content` usa a largura natural do painel. */
    width?: "anchor" | "content";
    minWidth?: number;
    fallbackHeight?: number;
};

const EMPTY_BOX: AnchoredPanelBox = { top: 0, left: 0, width: 0, maxHeight: null, openUp: false };

export function useAnchoredPanelPosition(
    open: boolean,
    anchorRef: RefObject<HTMLElement | null>,
    panelRef: RefObject<HTMLElement | null>,
    options?: AnchoredPanelOptions,
): AnchoredPanelBox {
    const gap = options?.gap ?? 4;
    const align = options?.align ?? "start";
    const widthMode = options?.width ?? "anchor";
    const minWidth = options?.minWidth ?? 0;
    const fallbackHeight = options?.fallbackHeight ?? 240;
    const [box, setBox] = useState<AnchoredPanelBox>(EMPTY_BOX);

    const update = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor || typeof window === "undefined") return;
        const anchorRect = anchor.getBoundingClientRect();
        const panel = panelRef.current;
        const measuredWidth = panel?.getBoundingClientRect().width ?? 0;
        const measuredHeight = panel?.scrollHeight || panel?.getBoundingClientRect().height || 0;
        const panelWidth =
            widthMode === "anchor"
                ? Math.max(anchorRect.width, minWidth)
                : Math.max(measuredWidth || minWidth || anchorRect.width, minWidth);
        const panelHeight = measuredHeight || fallbackHeight;
        const next = placeAnchoredPanel({
            anchor: anchorRect,
            panelWidth,
            panelHeight,
            gap,
            align,
        });
        setBox((current) =>
            current.top === next.top &&
            current.left === next.left &&
            current.width === next.width &&
            current.maxHeight === next.maxHeight &&
            current.openUp === next.openUp
                ? current
                : next,
        );
    }, [align, anchorRef, fallbackHeight, gap, minWidth, panelRef, widthMode]);

    useLayoutEffect(() => {
        if (!open) return;
        update();
    }, [open, update]);

    useEffect(() => {
        if (!open) return;
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [open, update]);

    return box;
}
