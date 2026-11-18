"use client";

import { CopyPlus, CopyX, Pin, PinOff, X, XCircle } from "lucide-react";

import {
    ContextMenu,
    type ContextMenuEntry,
} from "@/shared/components/ui/ContextMenu";
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
    onCloseOtherTabs: (tab: WorkspaceTab) => void;
    onCloseAll: () => void;
    /** Desabilita "Fechar outras abas" quando não há outras. */
    canCloseOtherTabs?: boolean;
    closeAllLabel?: string;
};

const iconClass = "size-3.5 shrink-0 text-base-content/45";

export function WorkspaceTabContextMenu({
    state,
    onClose,
    onDuplicate,
    onTogglePin,
    onCloseTab,
    onCloseOtherTabs,
    onCloseAll,
    canCloseOtherTabs = true,
    closeAllLabel = "Fechar todas",
}: WorkspaceTabContextMenuProps) {
    if (!state) return null;

    const pinned = Boolean(state.tab.pinned);
    const entries: ContextMenuEntry[] = [];

    if (!state.isDashboard) {
        entries.push(
            {
                type: "item",
                item: {
                    id: "duplicate",
                    label: "Duplicar",
                    icon: <CopyPlus className={iconClass} strokeWidth={2} />,
                    onSelect: () => onDuplicate(state.tab),
                },
            },
            {
                type: "item",
                item: {
                    id: "pin",
                    label: pinned ? "Desafixar" : "Fixar",
                    icon: pinned ? (
                        <PinOff className={iconClass} strokeWidth={2} />
                    ) : (
                        <Pin className={iconClass} strokeWidth={2} />
                    ),
                    onSelect: () => onTogglePin(state.tab),
                },
            },
            {
                type: "item",
                item: {
                    id: "close",
                    label: "Fechar",
                    icon: <X className={iconClass} strokeWidth={2} />,
                    onSelect: () => onCloseTab(state.tab),
                },
            },
            {
                type: "item",
                item: {
                    id: "close-others",
                    label: "Fechar outras abas",
                    icon: <CopyX className={iconClass} strokeWidth={2} />,
                    disabled: !canCloseOtherTabs,
                    onSelect: () => onCloseOtherTabs(state.tab),
                },
            },
            { type: "separator" },
        );
    }

    entries.push({
        type: "item",
        item: {
            id: "close-all",
            label: closeAllLabel,
            danger: true,
            icon: <XCircle className="size-3.5 shrink-0" strokeWidth={2} />,
            onSelect: onCloseAll,
        },
    });

    return (
        <ContextMenu
            x={state.x}
            y={state.y}
            ariaLabel="Ações da aba"
            entries={entries}
            onClose={onClose}
        />
    );
}
