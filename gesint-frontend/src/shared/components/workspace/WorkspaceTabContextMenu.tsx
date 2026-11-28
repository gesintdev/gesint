"use client";

import {
    CopyPlus,
    CopyX,
    FoldHorizontal,
    PanelLeft,
    Pin,
    PinOff,
    SquareX,
    UnfoldHorizontal,
    X,
    XCircle,
} from "lucide-react";

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
    /** "Ir para Menu": mostra o item da tela no menu lateral. */
    onRevealInMenu: (tab: WorkspaceTab) => void;
    /** "Fechar grupo": só aparece quando a aba está num grupo de sistema. */
    onCloseGroup?: (tab: WorkspaceTab) => void;
    /** Rótulo do grupo da aba (ex.: "GP"), exibido em "Fechar grupo". */
    groupLabel?: string;
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
    onRevealInMenu,
    onCloseGroup,
    groupLabel,
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
                    id: "reveal-in-menu",
                    label: "Ir para Menu",
                    icon: <PanelLeft className={iconClass} strokeWidth={2} />,
                    onSelect: () => onRevealInMenu(state.tab),
                },
            },
            { type: "separator" },
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
        );
        if (onCloseGroup) {
            entries.push({
                type: "item",
                item: {
                    id: "close-group",
                    label: groupLabel ? `Fechar grupo ${groupLabel}` : "Fechar grupo",
                    icon: <SquareX className={iconClass} strokeWidth={2} />,
                    onSelect: () => onCloseGroup(state.tab),
                },
            });
        }
        entries.push({ type: "separator" });
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

export type WorkspaceTabGroupContextMenuState = {
    /** Sigla e nome do sistema do grupo. */
    acronym: string;
    name: string;
    x: number;
    y: number;
    collapsed: boolean;
};

type WorkspaceTabGroupContextMenuProps = {
    state: WorkspaceTabGroupContextMenuState | null;
    onClose: () => void;
    onToggleCollapsed: () => void;
    /** Troca o rail para o sistema do grupo (menu lateral daquele sistema). */
    onOpenSystemMenu: () => void;
    onCloseOtherGroups: () => void;
    onCloseGroup: () => void;
    /** Desabilita "Fechar outros grupos" quando só há este. */
    canCloseOtherGroups?: boolean;
};

/** Botão direito no chip do grupo (sigla do sistema). */
export function WorkspaceTabGroupContextMenu({
    state,
    onClose,
    onToggleCollapsed,
    onOpenSystemMenu,
    onCloseOtherGroups,
    onCloseGroup,
    canCloseOtherGroups = true,
}: WorkspaceTabGroupContextMenuProps) {
    if (!state) return null;

    const entries: ContextMenuEntry[] = [
        {
            type: "item",
            item: {
                id: "toggle-group",
                label: state.collapsed ? "Expandir grupo" : "Recolher grupo",
                icon: state.collapsed ? (
                    <UnfoldHorizontal className={iconClass} strokeWidth={2} />
                ) : (
                    <FoldHorizontal className={iconClass} strokeWidth={2} />
                ),
                onSelect: onToggleCollapsed,
            },
        },
        {
            type: "item",
            item: {
                id: "open-system-menu",
                label: `Ir para o menu do ${state.acronym}`,
                icon: <PanelLeft className={iconClass} strokeWidth={2} />,
                onSelect: onOpenSystemMenu,
            },
        },
        { type: "separator" },
        {
            type: "item",
            item: {
                id: "close-other-groups",
                label: "Fechar outros grupos",
                icon: <CopyX className={iconClass} strokeWidth={2} />,
                disabled: !canCloseOtherGroups,
                onSelect: onCloseOtherGroups,
            },
        },
        {
            type: "item",
            item: {
                id: "close-group",
                label: `Fechar grupo ${state.acronym}`,
                danger: true,
                icon: <SquareX className="size-3.5 shrink-0" strokeWidth={2} />,
                onSelect: onCloseGroup,
            },
        },
    ];

    return (
        <ContextMenu
            x={state.x}
            y={state.y}
            ariaLabel={`Ações do grupo ${state.name}`}
            entries={entries}
            onClose={onClose}
        />
    );
}
