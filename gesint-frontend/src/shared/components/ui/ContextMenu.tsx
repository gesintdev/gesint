"use client";

import { type ReactNode,useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { placeAnchoredPanel } from "@/shared/components/ui/input/popover-placement";

export type ContextMenuItem = {
    id: string;
    label: string;
    icon: ReactNode;
    disabled?: boolean;
    /** Ação destrutiva: texto e hover de erro, como "Fechar todas" nas abas. */
    danger?: boolean;
    onSelect: () => void;
};

export type ContextMenuEntry =
    | { type: "item"; item: ContextMenuItem }
    | { type: "separator" };

type ContextMenuProps = {
    x: number;
    y: number;
    ariaLabel: string;
    entries: ContextMenuEntry[];
    onClose: () => void;
};

const MENU_MIN_WIDTH = 176;

const itemClass =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-base-content/85 hover:bg-base-content/8";

/**
 * Dropdown de botão direito. Mesma casca das ações da aba do workspace.
 * Só deve ser aberto em ponteiro de desktop; o chamador decide isso.
 */
export function ContextMenu({ x, y, ariaLabel, entries, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ left: 0, top: 0 });

    useLayoutEffect(() => {
        if (!menuRef.current) return;
        const rect = menuRef.current.getBoundingClientRect();
        const placed = placeAnchoredPanel({
            anchor: new DOMRect(x, y, 0, 0),
            panelWidth: Math.max(rect.width, MENU_MIN_WIDTH),
            panelHeight: rect.height,
            gap: 0,
        });
        setPos({ left: placed.left, top: placed.top });
    }, [x, y]);

    useEffect(() => {
        let armed = false;
        const onPointerDown = (event: MouseEvent) => {
            if (!armed) return;
            if (!menuRef.current?.contains(event.target as Node)) {
                onClose();
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        const onScroll = () => {
            if (!armed) return;
            onClose();
        };
        // O gesto que abriu o menu (mousedown/click/scroll de foco) não pode fechá-lo.
        const armTimer = window.setTimeout(() => {
            armed = true;
        }, 0);
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            window.clearTimeout(armTimer);
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [onClose]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            aria-label={ariaLabel}
            className="surface-card fixed z-[80] min-w-[11rem] border border-base-content/10 p-1 shadow-lg"
            style={{ position: "fixed", left: pos.left, top: pos.top, minWidth: MENU_MIN_WIDTH }}
        >
            {entries.map((entry, index) => {
                if (entry.type === "separator") {
                    return <div key={`sep-${index}`} className="my-1 h-px bg-base-content/8" />;
                }
                const { item } = entry;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        disabled={item.disabled}
                        className={
                            item.danger
                                ? `${itemClass} text-error hover:bg-error/10 hover:text-error`
                                : `${itemClass} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`
                        }
                        onClick={() => {
                            if (item.disabled) return;
                            item.onSelect();
                            onClose();
                        }}
                    >
                        <span className="gesint-context-menu__icon" aria-hidden>
                            {item.icon}
                        </span>
                        <span className="min-w-0">{item.label}</span>
                    </button>
                );
            })}
        </div>,
        document.body,
    );
}
