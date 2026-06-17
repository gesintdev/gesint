"use client";
import { useCallback, useEffect, useState } from "react";

import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export function useListboxKeyboard(
    items: SelectItem[],
    open: boolean,
    onSelect: (item: SelectItem) => void,
    onClose: () => void,
) {
    const itemsSignature = items.map((item) => item.value).join("|");
    const [activeIndex, setActiveIndex] = useState(0);
    const [listSync, setListSync] = useState({ open: false, itemsSignature: "" });
    if (open) {
        if (!listSync.open || listSync.itemsSignature !== itemsSignature) {
            setListSync({ open: true, itemsSignature });
            setActiveIndex(0);
        }
    } else if (listSync.open) {
        setListSync({ open: false, itemsSignature: listSync.itemsSignature });
    }
    const move = useCallback(
        (delta: number) => {
            if (!items.length) return;
            setActiveIndex((prev) => {
                let next = prev + delta;
                while (next >= 0 && next < items.length && items[next]?.disabled) {
                    next += delta;
                }

                if (next < 0) next = items.length - 1;
                if (next >= items.length) next = 0;
                while (items[next]?.disabled && next !== prev) {
                    next += delta > 0 ? 1 : -1;
                    if (next < 0) next = items.length - 1;
                    if (next >= items.length) next = 0;
                }
                return next;
            });
        },
        [items],
    );
    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!open) {
                if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    return "open";
                }
                return;
            }
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    move(1);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    move(-1);
                    break;
                case "Home":
                    e.preventDefault();
                    setActiveIndex(0);
                    break;
                case "End":
                    e.preventDefault();
                    setActiveIndex(Math.max(0, items.length - 1));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (items[activeIndex] && !items[activeIndex].disabled) {
                        onSelect(items[activeIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
                case "Tab":
                    onClose();
                    break;
            }
        },
        [activeIndex, items, move, onClose, onSelect, open],
    );
    return { activeIndex, setActiveIndex, onKeyDown };
}

type RefTarget = React.RefObject<HTMLElement | null>;

export function useClickOutside(refs: RefTarget | RefTarget[], onOutside: () => void, enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;
        const refList = Array.isArray(refs) ? refs : [refs];
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const inside = refList.some((ref) => ref.current?.contains(target));
            if (!inside) onOutside();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [enabled, onOutside, refs]);
}
