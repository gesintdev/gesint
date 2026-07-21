"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { Fragment, useCallback, useRef, useState, type MouseEvent } from "react";

import { WorkspaceTabContextMenu, type WorkspaceTabContextMenuState } from "@/shared/components/workspace/WorkspaceTabContextMenu";
import { WorkspaceTabIcon } from "@/shared/components/workspace/WorkspaceTabIcon";
import { WorkspaceTabOverflowMenu } from "@/shared/components/workspace/WorkspaceTabOverflowMenu";
import { WorkspaceTabSystemBadge } from "@/shared/components/workspace/WorkspaceTabSystemBadge";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import type { WorkspaceTab } from "@/shared/workspace/workspace.types";
import { formatWorkspaceTabTitle } from "@/shared/workspace/workspace.types";
import { isDashboardTabId } from "@/shared/workspace/workspace-dashboard";
import { findRouteById } from "@/shared/workspace/workspace-routes";

type WorkspaceTabBarProps = {
    dashboardTab: WorkspaceTab;
    moduleTabs: WorkspaceTab[];
    activeTabId: string | null;
    onSelect: (tabId: string) => void;
    onClose: (tabId: string) => void;
};

function WorkspaceTabButton({
    tab,
    active,
    onSelect,
    onClose,
    onContextMenu,
}: {
    tab: WorkspaceTab;
    active: boolean;
    onSelect: () => void;
    onClose?: () => void;
    onContextMenu: (event: MouseEvent) => void;
}) {
    const title = formatWorkspaceTabTitle(tab);

    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            title={title}
            onClick={onSelect}
            onContextMenu={onContextMenu}
            onMouseDown={(event) => {
                // Evita auto-scroll do navegador no clique do meio
                if (event.button === 1 && onClose) {
                    event.preventDefault();
                }
            }}
            onAuxClick={(event) => {
                if (event.button === 1 && onClose) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose();
                }
            }}
            className={clsx("gommo-workspace-tab group/tab max-w-60", active && "gommo-workspace-tab--active")}
        >
            <WorkspaceTabIcon
                tab={tab}
                className={clsx(
                    "size-3.5 shrink-0 transition-colors",
                    active ? "text-primary" : "text-base-content/40 group-hover/tab:text-base-content/60",
                )}
            />
            <WorkspaceTabSystemBadge href={tab.href} />
            <span className="min-w-0 flex-1 truncate text-left tracking-tight">{title}</span>
            {onClose ? (
                <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Fechar ${title}`}
                    className="workspace-tab-close flex size-5 shrink-0 items-center justify-center rounded-md"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }
                    }}
                >
                    <X className="size-3" strokeWidth={2.25} />
                </span>
            ) : null}
        </button>
    );
}

export function WorkspaceTabBar({ dashboardTab, moduleTabs, activeTabId, onSelect, onClose }: WorkspaceTabBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const dashboardActive = isDashboardTabId(activeTabId);
    const [contextMenu, setContextMenu] = useState<WorkspaceTabContextMenuState | null>(null);
    const { openRouteCreate } = useWorkspaceNavigation();
    const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs);

    const openContextMenu = useCallback((tab: WorkspaceTab, event: MouseEvent, isDashboard = false) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({
            tab,
            x: event.clientX,
            y: event.clientY,
            isDashboard,
        });
    }, []);

    const handleDuplicate = useCallback(
        (tab: WorkspaceTab) => {
            const route = findRouteById(tab.routeId);
            if (!route?.href) return;
            openRouteCreate(route, undefined, { insertAfterTabId: tab.id });
        },
        [openRouteCreate],
    );

    return (
        <div className="workspace-tabbar flex shrink-0 items-stretch">
            <div className="gommo-workspace-tabs workspace-tabbar-tabs min-w-0 flex-1">
                <WorkspaceTabButton
                    tab={dashboardTab}
                    active={dashboardActive}
                    onSelect={() => onSelect(dashboardTab.id)}
                    onContextMenu={(event) => openContextMenu(dashboardTab, event, true)}
                />
                {moduleTabs.length > 0 ? (
                    <>
                        <span className="workspace-tabbar-divider" aria-hidden />
                        <div
                            ref={scrollRef}
                            className="workspace-tabbar-scroll flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden"
                            aria-label="Módulos abertos"
                        >
                            <div role="tablist" className="workspace-tabbar-scroll-inner">
                                {moduleTabs.map((tab, index) => {
                                    const active = tab.id === activeTabId;
                                    const isLast = index === moduleTabs.length - 1;
                                    return (
                                        <Fragment key={tab.id}>
                                            <WorkspaceTabButton
                                                tab={tab}
                                                active={active}
                                                onSelect={() => onSelect(tab.id)}
                                                onClose={() => onClose(tab.id)}
                                                onContextMenu={(event) => openContextMenu(tab, event)}
                                            />
                                            {!isLast ? (
                                                <span className="workspace-tabbar-sep text-base-300">|</span>
                                            ) : null}
                                        </Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
            <div className="workspace-tabbar-actions flex shrink-0 items-stretch">
                <WorkspaceTabOverflowMenu moduleTabs={moduleTabs} activeTabId={activeTabId} onSelect={onSelect} />
            </div>
            <WorkspaceTabContextMenu
                state={contextMenu}
                onClose={() => setContextMenu(null)}
                onDuplicate={handleDuplicate}
                onCloseTab={(tab) => onClose(tab.id)}
                onCloseAll={closeAllTabs}
            />
        </div>
    );
}
