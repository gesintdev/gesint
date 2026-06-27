import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { WorkspaceTabIcon } from "@/shared/components/workspace/WorkspaceTabIcon";
import { WorkspaceTabSystemBadge } from "@/shared/components/workspace/WorkspaceTabSystemBadge";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import type { WorkspaceTab } from "@/shared/workspace/workspace.types";
import { formatWorkspaceTabTitle } from "@/shared/workspace/workspace.types";

type WorkspaceTabOverflowMenuProps = {
    moduleTabs: WorkspaceTab[];
    activeTabId: string | null;
    onSelect: (tabId: string) => void;
};

export function WorkspaceTabOverflowMenu({ moduleTabs, activeTabId, onSelect }: WorkspaceTabOverflowMenuProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs);
    const closeTab = useWorkspaceStore((s) => s.closeTab);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    return (
        <div ref={rootRef} className="relative flex h-full items-center">
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={`Listar abas abertas (${moduleTabs.length})`}
                onClick={() => setOpen((v) => !v)}
                className="workspace-tabbar-menu-trigger flex cursor-pointer items-center gap-1.5 px-2.5"
            >
                <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
                <span className="tabular-nums text-[12px] font-semibold">{moduleTabs.length}</span>
            </button>
            {open && (
                <div
                    role="menu"
                    className="surface-card absolute end-0 top-full z-50 mt-1 flex max-h-80 min-w-[16rem] flex-col border border-base-content/10 shadow-lg"
                >
                    <ul className="min-h-0 flex-1 overflow-y-auto py-1">
                        {moduleTabs.length === 0 ? (
                            <li className="px-3 py-2 text-[13px] text-base-content/50">Nenhum módulo aberto</li>
                        ) : null}
                        {moduleTabs.map((tab) => {
                            const title = formatWorkspaceTabTitle(tab);
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
                                            onClick={() => closeTab(tab.id)}
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
                                closeAllTabs();
                                setOpen(false);
                            }}
                        >
                            Fechar todas as abas
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
