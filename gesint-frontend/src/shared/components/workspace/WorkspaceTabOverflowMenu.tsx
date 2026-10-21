import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { WorkspaceTabIcon } from "@/shared/components/workspace/WorkspaceTabIcon";
import { WorkspaceTabSystemBadge } from "@/shared/components/workspace/WorkspaceTabSystemBadge";
import { confirmDiscardUnsavedChanges } from "@/shared/workspace/dirty-tab-guard";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import type { WorkspaceTab } from "@/shared/workspace/workspace.types";
import { formatWorkspaceTabTitle } from "@/shared/workspace/workspace.types";
import { findRouteGroupShortLabel } from "@/shared/workspace/workspace-routes";

type WorkspaceTabOverflowMenuProps = {
    dashboardTab: WorkspaceTab;
    moduleTabs: WorkspaceTab[];
    activeTabId: string | null;
    /** Aba ativa exibida no trigger compacto (mobile/tablet). */
    activeDisplayTab?: WorkspaceTab | null;
    onSelect: (tabId: string) => void;
};

export function WorkspaceTabOverflowMenu({
    dashboardTab,
    moduleTabs,
    activeTabId,
    activeDisplayTab = null,
    onSelect,
}: WorkspaceTabOverflowMenuProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs);
    const closeUnpinnedTabs = useWorkspaceStore((s) => s.closeUnpinnedTabs);
    const closeTab = useWorkspaceStore((s) => s.closeTab);
    const hasPinned = moduleTabs.some((tab) => tab.pinned);
    const activeTitle = activeDisplayTab
        ? formatWorkspaceTabTitle(activeDisplayTab, findRouteGroupShortLabel(activeDisplayTab.routeId))
        : "Abas abertas";

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    return (
        <div ref={rootRef} className="relative flex h-full min-w-0 flex-1 items-center lg:flex-none">
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={`Listar abas abertas (${moduleTabs.length})`}
                onClick={() => setOpen((v) => !v)}
                className="workspace-tabbar-menu-trigger flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 px-2.5 lg:flex-none"
            >
                {activeDisplayTab ? (
                    <span className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
                        <WorkspaceTabIcon
                            tab={activeDisplayTab}
                            className="size-3.5 shrink-0 text-base-content/50"
                        />
                        <WorkspaceTabSystemBadge href={activeDisplayTab.href} />
                        <span className="min-w-0 truncate text-[13px] font-medium text-base-content">
                            {activeTitle}
                        </span>
                    </span>
                ) : (
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-base-content/55 lg:hidden">
                        Abas abertas
                    </span>
                )}
                <ChevronDown className={clsx("size-4 shrink-0 transition-transform", open && "rotate-180")} />
                <span className="shrink-0 tabular-nums text-[12px] font-semibold">{moduleTabs.length}</span>
            </button>
            {open && (
                <div
                    role="menu"
                    className="surface-card absolute end-0 top-full z-50 mt-1 flex max-h-80 w-[min(20rem,calc(100vw-1.25rem))] min-w-[16rem] flex-col border border-base-content/10 shadow-lg lg:w-auto"
                >
                    <ul className="min-h-0 flex-1 overflow-y-auto py-1">
                        <li role="none">
                            <button
                                type="button"
                                role="menuitem"
                                className={clsx(
                                    "flex w-full cursor-pointer items-center gap-2 truncate px-3 py-2 text-left text-[13px] transition-colors",
                                    activeTabId === dashboardTab.id && "bg-primary/8",
                                )}
                                onClick={() => {
                                    onSelect(dashboardTab.id);
                                    setOpen(false);
                                }}
                            >
                                <WorkspaceTabIcon
                                    tab={dashboardTab}
                                    className="size-3.5 shrink-0 text-base-content/50"
                                />
                                <span className="truncate">
                                    {formatWorkspaceTabTitle(
                                        dashboardTab,
                                        findRouteGroupShortLabel(dashboardTab.routeId),
                                    )}
                                </span>
                            </button>
                        </li>
                        {moduleTabs.length === 0 ? (
                            <li className="px-3 py-2 text-[13px] text-base-content/50">Nenhum módulo aberto</li>
                        ) : null}
                        {moduleTabs.map((tab) => {
                            const title = formatWorkspaceTabTitle(tab, findRouteGroupShortLabel(tab.routeId));
                            const active = tab.id === activeTabId;
                            return (
                                <li key={tab.id} role="none">
                                    <div
                                        className={clsx(
                                            "flex items-center gap-0.5 pe-1 transition-colors",
                                            active && "bg-primary/8",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 truncate px-3 py-2 text-left text-[13px]"
                                            onClick={() => {
                                                onSelect(tab.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <WorkspaceTabIcon
                                                tab={tab}
                                                className="size-3.5 shrink-0 text-base-content/50"
                                            />
                                            <WorkspaceTabSystemBadge href={tab.href} />
                                            <span className="truncate">{title}</span>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={`Fechar ${title}`}
                                            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-base-content/50 hover:bg-base-content/10"
                                            onClick={() => {
                                                void (async () => {
                                                    const { confirmCloseDirtyTab } = await import(
                                                        "@/shared/workspace/dirty-tab-guard"
                                                    );
                                                    if (await confirmCloseDirtyTab(tab.id)) {
                                                        closeTab(tab.id);
                                                    }
                                                })();
                                            }}
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="shrink-0 border-t border-base-content/10 p-1">
                        <button
                            type="button"
                            role="menuitem"
                            className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-[13px] font-medium text-error hover:bg-error/10"
                            onClick={() => {
                                void (async () => {
                                    const tabIds = hasPinned
                                        ? moduleTabs.filter((tab) => !tab.pinned).map((tab) => tab.id)
                                        : moduleTabs.map((tab) => tab.id);
                                    if (!(await confirmDiscardUnsavedChanges(tabIds))) return;
                                    if (hasPinned) closeUnpinnedTabs();
                                    else closeAllTabs();
                                    setOpen(false);
                                })();
                            }}
                        >
                            {hasPinned ? "Fechar não fixadas" : "Fechar todas as abas"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
