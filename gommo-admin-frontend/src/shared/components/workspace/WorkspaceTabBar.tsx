"use client";

import clsx from "clsx";
import {X} from "lucide-react";
import {useRef} from "react";

import {WorkspaceTabIcon} from "@/shared/components/workspace/WorkspaceTabIcon";
import {WorkspaceTabOverflowMenu} from "@/shared/components/workspace/WorkspaceTabOverflowMenu";
import type {WorkspaceTab} from "@/shared/workspace/workspace.types";
import {formatWorkspaceTabTitle} from "@/shared/workspace/workspace.types";
import {isDashboardTabId} from "@/shared/workspace/workspace-dashboard";

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
}: {
    tab: WorkspaceTab;
    active: boolean;
    onSelect: () => void;
    onClose?: () => void;
}) {
    const title = formatWorkspaceTabTitle(tab);

    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            title={title}
            onClick={onSelect}
            className={clsx(
                "gommo-workspace-tab group/tab max-w-[240px] min-w-[120px]",
                active && "gommo-workspace-tab--active",
            )}
        >
            <WorkspaceTabIcon
                tab={tab}
                className={clsx(
                    "size-3.5 shrink-0 transition-colors",
                    active
                        ? "text-primary"
                        : "text-base-content/40 group-hover/tab:text-base-content/60",
                )}
            />
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

export function WorkspaceTabBar({
    dashboardTab,
    moduleTabs,
    activeTabId,
    onSelect,
    onClose,
}: WorkspaceTabBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const dashboardActive = isDashboardTabId(activeTabId);

    return (
        <div className="workspace-tabbar flex shrink-0 items-stretch">
            <div className="gommo-workspace-tabs workspace-tabbar-tabs min-w-0 flex-1">
                <WorkspaceTabButton
                    tab={dashboardTab}
                    active={dashboardActive}
                    onSelect={() => onSelect(dashboardTab.id)}
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
                                {moduleTabs.map((tab) => (
                                    <WorkspaceTabButton
                                        key={tab.id}
                                        tab={tab}
                                        active={tab.id === activeTabId}
                                        onSelect={() => onSelect(tab.id)}
                                        onClose={() => onClose(tab.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            <div className="workspace-tabbar-actions flex shrink-0 items-stretch">
                <WorkspaceTabOverflowMenu
                    moduleTabs={moduleTabs}
                    activeTabId={activeTabId}
                    onSelect={onSelect}
                />
            </div>
        </div>
    );
}
