"use client";

import {
    closestCenter,
    defaultDropAnimationSideEffects,
    DndContext,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
    type DropAnimation,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { Pin, X } from "lucide-react";
import {
    Fragment,
    useCallback,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent,
} from "react";

import {
    WorkspaceTabContextMenu,
    type WorkspaceTabContextMenuState,
} from "@/shared/components/workspace/WorkspaceTabContextMenu";
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

const TAB_DROP_ANIMATION: DropAnimation = {
    duration: 220,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0",
            },
        },
    }),
};

type WorkspaceTabFaceProps = {
    tab: WorkspaceTab;
    active: boolean;
    className?: string;
    style?: CSSProperties;
    showClose?: boolean;
    onSelect?: () => void;
    onClose?: () => void;
    onContextMenu?: (event: MouseEvent) => void;
    onMouseDown?: (event: MouseEvent) => void;
    onAuxClick?: (event: MouseEvent) => void;
    buttonRef?: (node: HTMLButtonElement | null) => void;
} & Record<string, unknown>;

function WorkspaceTabFace({
    tab,
    active,
    className,
    style,
    showClose,
    onSelect,
    onClose,
    onContextMenu,
    onMouseDown,
    onAuxClick,
    buttonRef,
    ...rest
}: WorkspaceTabFaceProps) {
    const title = formatWorkspaceTabTitle(tab);
    const pinned = Boolean(tab.pinned);

    return (
        <button
            ref={buttonRef}
            type="button"
            role="tab"
            aria-selected={active}
            title={title}
            style={style}
            onClick={onSelect}
            onContextMenu={onContextMenu}
            onMouseDown={onMouseDown}
            onAuxClick={onAuxClick}
            className={clsx(
                "gommo-workspace-tab group/tab max-w-60",
                active && "gommo-workspace-tab--active",
                pinned && "gommo-workspace-tab--pinned",
                className,
            )}
            {...rest}
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
            {pinned ? (
                <Pin className="size-3 shrink-0 text-primary/70" strokeWidth={2.25} aria-label="Aba fixada" />
            ) : null}
            {showClose && onClose ? (
                <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Fechar ${title}`}
                    className="workspace-tab-close flex size-5 shrink-0 items-center justify-center rounded-md"
                    onPointerDown={(e) => e.stopPropagation()}
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

function SortableWorkspaceTab({
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
    const pinned = Boolean(tab.pinned);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: tab.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Esconde o item original: o visual do drag fica no DragOverlay (portal).
        opacity: isDragging ? 0 : undefined,
    };

    return (
        <WorkspaceTabFace
            tab={tab}
            active={active}
            showClose={Boolean(onClose) && !pinned}
            onSelect={onSelect}
            onClose={onClose}
            onContextMenu={onContextMenu}
            onMouseDown={(event) => {
                if (event.button === 1 && onClose && !pinned) {
                    event.preventDefault();
                }
            }}
            onAuxClick={(event) => {
                if (event.button === 1 && onClose && !pinned) {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose();
                }
            }}
            buttonRef={setNodeRef}
            style={style}
            className={clsx("touch-none", isDragging && "gommo-workspace-tab--drag-source")}
            {...attributes}
            {...listeners}
        />
    );
}

function DashboardTabButton({
    tab,
    active,
    onSelect,
    onContextMenu,
}: {
    tab: WorkspaceTab;
    active: boolean;
    onSelect: () => void;
    onContextMenu: (event: MouseEvent) => void;
}) {
    return (
        <WorkspaceTabFace
            tab={tab}
            active={active}
            onSelect={onSelect}
            onContextMenu={onContextMenu}
        />
    );
}

export function WorkspaceTabBar({ dashboardTab, moduleTabs, activeTabId, onSelect, onClose }: WorkspaceTabBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const dashboardActive = isDashboardTabId(activeTabId);
    const [contextMenu, setContextMenu] = useState<WorkspaceTabContextMenuState | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const { openRouteCreate } = useWorkspaceNavigation();
    const closeUnpinnedTabs = useWorkspaceStore((s) => s.closeUnpinnedTabs);
    const togglePinTab = useWorkspaceStore((s) => s.togglePinTab);
    const reorderTabs = useWorkspaceStore((s) => s.reorderTabs);

    const tabIds = useMemo(() => moduleTabs.map((tab) => tab.id), [moduleTabs]);
    const activeDragTab = useMemo(
        () => (activeDragId ? moduleTabs.find((tab) => tab.id === activeDragId) ?? null : null),
        [activeDragId, moduleTabs],
    );
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

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

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragId(String(event.active.id));
    }, []);

    const handleDragCancel = useCallback(() => {
        setActiveDragId(null);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveDragId(null);
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            const oldIndex = moduleTabs.findIndex((tab) => tab.id === active.id);
            const newIndex = moduleTabs.findIndex((tab) => tab.id === over.id);
            if (oldIndex < 0 || newIndex < 0) return;
            const activeTab = moduleTabs[oldIndex];
            const overTab = moduleTabs[newIndex];
            if (Boolean(activeTab.pinned) !== Boolean(overTab.pinned)) return;

            const next = [...moduleTabs];
            const [moved] = next.splice(oldIndex, 1);
            next.splice(newIndex, 0, moved);
            reorderTabs(next.map((tab) => tab.id));
        },
        [moduleTabs, reorderTabs],
    );

    const pinnedCount = moduleTabs.filter((tab) => tab.pinned).length;

    return (
        <div className="workspace-tabbar flex shrink-0 items-stretch">
            <div className="gommo-workspace-tabs workspace-tabbar-tabs min-w-0 flex-1">
                <DashboardTabButton
                    tab={dashboardTab}
                    active={dashboardActive}
                    onSelect={() => onSelect(dashboardTab.id)}
                    onContextMenu={(event) => openContextMenu(dashboardTab, event, true)}
                />
                {moduleTabs.length > 0 ? (
                    <>
                        <span className="workspace-tabbar-divider" aria-hidden />
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                        >
                            <div
                                ref={scrollRef}
                                className="workspace-tabbar-scroll flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden"
                                aria-label="Módulos abertos"
                            >
                                <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
                                    <div role="tablist" className="workspace-tabbar-scroll-inner">
                                        {moduleTabs.map((tab, index) => {
                                            const active = tab.id === activeTabId;
                                            const showPinDivider =
                                                pinnedCount > 0 &&
                                                pinnedCount < moduleTabs.length &&
                                                index === pinnedCount;
                                            return (
                                                <Fragment key={tab.id}>
                                                    {showPinDivider ? (
                                                        <span className="workspace-tabbar-pin-divider" aria-hidden />
                                                    ) : null}
                                                    <SortableWorkspaceTab
                                                        tab={tab}
                                                        active={active}
                                                        onSelect={() => onSelect(tab.id)}
                                                        onClose={() => onClose(tab.id)}
                                                        onContextMenu={(event) => openContextMenu(tab, event)}
                                                    />
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                </SortableContext>
                            </div>
                            <DragOverlay dropAnimation={TAB_DROP_ANIMATION} zIndex={300}>
                                {activeDragTab ? (
                                    <div className="workspace-tab-drag-overlay-wrap">
                                        <WorkspaceTabFace
                                            tab={activeDragTab}
                                            active={activeDragTab.id === activeTabId}
                                            className="gommo-workspace-tab--drag-overlay"
                                        />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
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
                onTogglePin={(tab) => togglePinTab(tab.id)}
                onCloseTab={(tab) => onClose(tab.id)}
                onCloseAll={closeUnpinnedTabs}
                closeAllLabel={pinnedCount > 0 ? "Fechar não fixadas" : "Fechar todas"}
            />
        </div>
    );
}
