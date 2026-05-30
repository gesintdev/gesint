"use client";

import clsx from "clsx";
import {LayoutGrid, X} from "lucide-react";
import {Fragment, useRef} from "react";
import type {WorkspaceTab} from "@/shared/workspace/workspace.types";
import {formatWorkspaceTabTitle} from "@/shared/workspace/workspace.types";
import {WorkspaceTabIcon} from "@/shared/components/workspace/WorkspaceTabIcon";
import {WorkspaceTabSystemBadge} from "@/shared/components/workspace/WorkspaceTabSystemBadge";
import {WorkspaceTabOverflowMenu} from "@/shared/components/workspace/WorkspaceTabOverflowMenu";

type WorkspaceTabBarProps = {
    tabs: WorkspaceTab[];
    activeTabId: string | null;
    onSelect: (tabId: string) => void;
    onClose: (tabId: string) => void;
};

export function WorkspaceTabBar({tabs, activeTabId, onSelect, onClose}: WorkspaceTabBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (tabs.length === 0) return null;

    return (
        <div className="workspace-tabbar flex shrink-0 items-stretch">
            <div
                ref={scrollRef}
                className="workspace-tabbar-scroll flex min-w-0 flex-1 items-end overflow-x-auto overflow-y-hidden"
                aria-label="Módulos abertos"
            >
                <div role="tablist" className="gommo-workspace-tabs">
                    {tabs.map((tab, idex) => {
                        const active = tab.id === activeTabId;
                        const title = formatWorkspaceTabTitle(tab);
                        const isDashboard = tab.routeId === "dashboard" && tab.entityKey === "list";
                        const isLast = idex === tabs.length - 1;

                        return (
                            <Fragment key={tab.id}>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    title={title}
                                    onClick={() => onSelect(tab.id)}
                                    className={clsx(
                                        "gommo-workspace-tab group/tab max-w-60 min-w-30",
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
                                    <WorkspaceTabSystemBadge href={tab.href} />
                                    <span className="min-w-0 flex-1 truncate text-left tracking-tight">
                                    {title}
                                </span>
                                    {!isDashboard ? (
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Fechar ${title}`}
                                            className="workspace-tab-close flex size-5 shrink-0 items-center justify-center rounded-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClose(tab.id);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onClose(tab.id);
                                                }
                                            }}
                                        >
                                        <X className="size-3" strokeWidth={2.25}/>
                                    </span>
                                    ) : null}
                                </button>
                                {!isLast && (
                                    <label className={'text-base-300'}>|</label>
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="workspace-tabbar-actions flex shrink-0 items-stretch">
                <WorkspaceTabOverflowMenu tabs={tabs} activeTabId={activeTabId} onSelect={onSelect}/>
            </div>
        </div>
    );
}

export function WorkspaceTabBarEmptyHint() {
    return (
        <div className="workspace-tabbar-empty gap-2">
            <LayoutGrid className="size-3.5"/>
            Nenhuma aba aberta — exibindo o painel inicial
        </div>
    );
}
