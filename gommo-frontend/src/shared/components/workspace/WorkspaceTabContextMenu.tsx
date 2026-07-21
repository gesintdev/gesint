"use client";

import { CopyPlus, Pin, PinOff, X, XCircle } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { WorkspaceTab } from "@/shared/workspace/workspace.types";

export type WorkspaceTabContextMenuState = {
    tab: WorkspaceTab;
    x: number;
    y: number;
    /** Dashboard não fecha/duplica/fixa; só permite fechar não fixadas. */
    isDashboard?: boolean;
};

type WorkspaceTabContextMenuProps = {
    state: WorkspaceTabContextMenuState | null;
    onClose: () => void;
    onDuplicate: (tab: WorkspaceTab) => void;
    onTogglePin: (tab: WorkspaceTab) => void;
    onCloseTab: (tab: WorkspaceTab) => void;
    onCloseAll: () => void;
    closeAllLabel?: string;
};

const MENU_MIN_WIDTH = 176;

export function WorkspaceTabContextMenu({
    state,
    onClose,
    onDuplicate,
    onTogglePin,
    onCloseTab,
    onCloseAll,
    closeAllLabel = "Fechar todas",
}: WorkspaceTabContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ left: 0, top: 0 });

    useLayoutEffect(() => {
        if (!state || !menuRef.current) return;
        const rect = menuRef.current.getBoundingClientRect();
        const pad = 8;
        setPos({
            left: Math.min(state.x, window.innerWidth - rect.width - pad),
            top: Math.min(state.y, window.innerHeight - rect.height - pad),
        });
    }, [state]);

    useEffect(() => {
        if (!state) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) {
                onClose();
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        const onScroll = () => onClose();
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [onClose, state]);

    if (!state || typeof document === "undefined") return null;

    const pinned = Boolean(state.tab.pinned);
    const itemClass =
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-base-content/85 hover:bg-base-content/8";

    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            aria-label="Ações da aba"
            className="surface-card fixed z-[80] min-w-[11rem] border border-base-content/10 p-1 shadow-lg"
            style={{ left: pos.left, top: pos.top, minWidth: MENU_MIN_WIDTH }}
        >
            {!state.isDashboard ? (
                <>
                    <button
                        type="button"
                        role="menuitem"
                        className={itemClass}
                        onClick={() => {
                            onDuplicate(state.tab);
                            onClose();
                        }}
                    >
                        <CopyPlus className="size-3.5 shrink-0 text-base-content/45" strokeWidth={2} />
                        Duplicar
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        className={itemClass}
                        onClick={() => {
                            onTogglePin(state.tab);
                            onClose();
                        }}
                    >
                        {pinned ? (
                            <PinOff className="size-3.5 shrink-0 text-base-content/45" strokeWidth={2} />
                        ) : (
                            <Pin className="size-3.5 shrink-0 text-base-content/45" strokeWidth={2} />
                        )}
                        {pinned ? "Desafixar" : "Fixar"}
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        className={itemClass}
                        onClick={() => {
                            onCloseTab(state.tab);
                            onClose();
                        }}
                    >
                        <X className="size-3.5 shrink-0 text-base-content/45" strokeWidth={2} />
                        Fechar
                    </button>
                    <div className="my-1 h-px bg-base-content/8" />
                </>
            ) : null}
            <button
                type="button"
                role="menuitem"
                className={`${itemClass} text-error hover:bg-error/10 hover:text-error`}
                onClick={() => {
                    onCloseAll();
                    onClose();
                }}
            >
                <XCircle className="size-3.5 shrink-0" strokeWidth={2} />
                {closeAllLabel}
            </button>
        </div>,
        document.body,
    );
}
