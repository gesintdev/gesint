"use client";

import {
    closestCenter,
    defaultDropAnimationSideEffects,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    type DropAnimation,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pin, X } from "lucide-react";
import {
    type CSSProperties,
    type MouseEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { Button } from "@/shared/components/ui/Button";
import {
    WorkspaceTabContextMenu,
    type WorkspaceTabContextMenuState,
} from "@/shared/components/workspace/WorkspaceTabContextMenu";
import { WorkspaceTabIcon } from "@/shared/components/workspace/WorkspaceTabIcon";
import { WorkspaceTabOverflowMenu } from "@/shared/components/workspace/WorkspaceTabOverflowMenu";
import { confirmDiscardUnsavedChanges } from "@/shared/workspace/dirty-tab-guard";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import type { WorkspaceTab } from "@/shared/workspace/workspace.types";
import { formatWorkspaceTabTitle } from "@/shared/workspace/workspace.types";
import { isDashboardTabId } from "@/shared/workspace/workspace-dashboard";
import { findRouteGroupShortLabel } from "@/shared/workspace/workspace-routes";
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

/** Entrada/saída + deslocamento na trilha. Layout desliga durante drag (dnd-kit). */
const TAB_EASE = [0.22, 1, 0.36, 1] as const;
const TAB_MOUNT_TRANSITION = {
    duration: 0.24,
    ease: TAB_EASE,
    layout: { duration: 0.28, ease: TAB_EASE },
};

type WorkspaceTabFaceProps = {
    tab: WorkspaceTab;
    active: boolean;
    /** Aba fixa do Painel — não fecha e tem estilo próprio. */
    home?: boolean;
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
    home = false,
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
    const title = formatWorkspaceTabTitle(tab, findRouteGroupShortLabel(tab.routeId));
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
                "gesint-workspace-tab group/tab max-w-36 sm:max-w-48 lg:max-w-60",
                active && "gesint-workspace-tab--active",
                home && "gesint-workspace-tab--home",
                pinned && "gesint-workspace-tab--pinned",
                className,
            )}
            {...rest}
        >
            {home ? (
                <span className="workspace-tab-home-mark" aria-hidden>
                    <WorkspaceTabIcon tab={tab} className="size-3 shrink-0" />
                </span>
            ) : (
                <WorkspaceTabIcon
                    tab={tab}
                    className={clsx(
                        "size-4 shrink-0 transition-colors", /* 16px — mesma faixa do menu */
                        active
                            ? "text-primary"
                            : "text-base-content/45 group-hover/tab:text-base-content/65",
                    )}
                />
            )}
            <span className="workspace-tab-label min-w-0 text-left" data-title={title}>
                <span>{title}</span>
            </span>
            {pinned && !home ? (
                <Pin className="size-3 shrink-0 text-base-content/45" strokeWidth={1.5} aria-label="Aba fixada" />
            ) : null}
            {showClose && onClose ? (
                <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Fechar ${title}`}
                    className="workspace-tab-close flex shrink-0 items-center justify-center"
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
                    <X className="size-3" strokeWidth={1.5} />
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
            className={clsx("touch-none", isDragging && "gesint-workspace-tab--drag-source")}
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
            home
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
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const { openRouteCreate } = useWorkspaceNavigation();
    const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs);
    const closeUnpinnedTabs = useWorkspaceStore((s) => s.closeUnpinnedTabs);
    const closeOtherTabs = useWorkspaceStore((s) => s.closeOtherTabs);
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

    const updateTabScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }
        const max = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 1);
        setCanScrollRight(max > 1 && el.scrollLeft < max - 1);
    }, []);

    const scrollTabsBy = useCallback(
        (direction: -1 | 1) => {
            const el = scrollRef.current;
            if (!el) return;
            const step = Math.max(160, Math.round(el.clientWidth * 0.55));
            el.scrollBy({ left: direction * step, behavior: "smooth" });
        },
        [],
    );

    useLayoutEffect(() => {
        updateTabScrollState();
    }, [moduleTabs, activeTabId, updateTabScrollState]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateTabScrollState();
        const onScroll = () => updateTabScrollState();
        el.addEventListener("scroll", onScroll, { passive: true });
        const ro = new ResizeObserver(() => updateTabScrollState());
        ro.observe(el);
        const inner = el.firstElementChild;
        if (inner) ro.observe(inner);
        return () => {
            el.removeEventListener("scroll", onScroll);
            ro.disconnect();
        };
    }, [moduleTabs.length, updateTabScrollState]);

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

    const handleCloseBulkTabs = useCallback(async () => {
        const tabIds =
            pinnedCount > 0
                ? moduleTabs.filter((tab) => !tab.pinned).map((tab) => tab.id)
                : moduleTabs.map((tab) => tab.id);
        if (!(await confirmDiscardUnsavedChanges(tabIds))) return;
        if (pinnedCount > 0) closeUnpinnedTabs();
        else closeAllTabs();
    }, [closeAllTabs, closeUnpinnedTabs, moduleTabs, pinnedCount]);

    const handleCloseOtherTabs = useCallback(
        async (tab: WorkspaceTab) => {
            const otherIds = moduleTabs.filter((item) => item.id !== tab.id).map((item) => item.id);
            if (otherIds.length === 0) return;
            if (!(await confirmDiscardUnsavedChanges(otherIds))) return;
            closeOtherTabs(tab.id);
        },
        [closeOtherTabs, moduleTabs],
    );

    const activeModuleTab = moduleTabs.find((tab) => tab.id === activeTabId) ?? null;
    const mobileActiveTab = activeModuleTab ?? (dashboardActive ? dashboardTab : null);

    return (
        <div className="workspace-tabbar flex shrink-0 items-stretch">
            {/* Trilha horizontal só no desktop — no mobile/tablet fica só a listagem de abas. */}
            <div className="gesint-workspace-tabs workspace-tabbar-tabs hidden min-w-0 flex-1 lg:flex">
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
                            <div className="workspace-tabbar-scroll-wrap">
                                {canScrollLeft ? (
                                    <div className="workspace-tabbar-scroll-edge workspace-tabbar-scroll-edge--start">
                                        <button
                                            type="button"
                                            aria-label="Abas anteriores"
                                            className="workspace-tabbar-scroll-btn"
                                            onClick={() => scrollTabsBy(-1)}
                                        >
                                            <ChevronLeft className="size-3.5" strokeWidth={1.5} />
                                        </button>
                                    </div>
                                ) : null}
                                <div
                                    ref={scrollRef}
                                    className="workspace-tabbar-scroll flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden"
                                    aria-label="Módulos abertos"
                                >
                                    <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
                                        <div
                                            role="tablist"
                                            className="workspace-tabbar-scroll-inner relative"
                                        >
                                            {/* popLayout: abas que saem saem do fluxo na hora; as que ficam deslizam com layout. */}
                                            <AnimatePresence initial={false} mode="popLayout">
                                                {moduleTabs.map((tab, index) => {
                                                    const active = tab.id === activeTabId;
                                                    const showPinDivider =
                                                        pinnedCount > 0 &&
                                                        pinnedCount < moduleTabs.length &&
                                                        index === pinnedCount;
                                                    return (
                                                        <motion.div
                                                            key={tab.id}
                                                            layout={activeDragId ? false : "position"}
                                                            initial={{ opacity: 0, scale: 0.94, x: 6 }}
                                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                                            exit={{
                                                                opacity: 0,
                                                                scale: 0.94,
                                                                x: -4,
                                                                transition: { duration: 0.2, ease: "easeOut" },
                                                            }}
                                                            transition={TAB_MOUNT_TRANSITION}
                                                            className="inline-flex shrink-0 items-center gap-1"
                                                            style={{ transformOrigin: "left center" }}
                                                        >
                                                            {index > 0 && !showPinDivider ? (
                                                                <span className="workspace-tabbar-sep" aria-hidden>
                                                                    |
                                                                </span>
                                                            ) : null}
                                                            {showPinDivider ? (
                                                                <span
                                                                    className="workspace-tabbar-pin-divider"
                                                                    aria-hidden
                                                                />
                                                            ) : null}
                                                            <SortableWorkspaceTab
                                                                tab={tab}
                                                                active={active}
                                                                onSelect={() => onSelect(tab.id)}
                                                                onClose={() => onClose(tab.id)}
                                                                onContextMenu={(event) =>
                                                                    openContextMenu(tab, event)
                                                                }
                                                            />
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </SortableContext>
                                </div>
                                {canScrollRight ? (
                                    <div className="workspace-tabbar-scroll-edge workspace-tabbar-scroll-edge--end">
                                        <button
                                            type="button"
                                            aria-label="Próximas abas"
                                            className="workspace-tabbar-scroll-btn"
                                            onClick={() => scrollTabsBy(1)}
                                        >
                                            <ChevronRight className="size-3.5" strokeWidth={1.5} />
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                            <DragOverlay dropAnimation={TAB_DROP_ANIMATION} zIndex={300}>
                                {activeDragTab ? (
                                    <div className="workspace-tab-drag-overlay-wrap">
                                        <WorkspaceTabFace
                                            tab={activeDragTab}
                                            active={activeDragTab.id === activeTabId}
                                            className="gesint-workspace-tab--drag-overlay"
                                        />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </>
                ) : null}
            </div>
            <div className="workspace-tabbar-actions flex min-w-0 flex-1 items-stretch lg:flex-none">
                <WorkspaceTabOverflowMenu
                    dashboardTab={dashboardTab}
                    moduleTabs={moduleTabs}
                    activeTabId={activeTabId}
                    activeDisplayTab={mobileActiveTab}
                    onSelect={onSelect}
                />
            </div>
            <WorkspaceTabContextMenu
                state={contextMenu}
                onClose={() => setContextMenu(null)}
                onDuplicate={handleDuplicate}
                onTogglePin={(tab) => togglePinTab(tab.id)}
                onCloseTab={(tab) => onClose(tab.id)}
                onCloseOtherTabs={(tab) => {
                    void handleCloseOtherTabs(tab);
                }}
                canCloseOtherTabs={moduleTabs.length > 1}
                onCloseAll={() => {
                    void handleCloseBulkTabs();
                }}
                closeAllLabel={pinnedCount > 0 ? "Fechar não fixadas" : "Fechar todas"}
            />
        </div>
    );
}
