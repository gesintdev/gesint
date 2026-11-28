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
import {
    horizontalListSortingStrategy,
    SortableContext,
    type SortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
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

import { type SystemEnum, SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
import {
    WorkspaceTabContextMenu,
    type WorkspaceTabContextMenuState,
    WorkspaceTabGroupContextMenu,
} from "@/shared/components/workspace/WorkspaceTabContextMenu";
import { WorkspaceTabIcon } from "@/shared/components/workspace/WorkspaceTabIcon";
import { WorkspaceTabOverflowMenu } from "@/shared/components/workspace/WorkspaceTabOverflowMenu";
import { useOptionalActiveSystem } from "@/shared/context/ActiveSystemContext";
import { confirmDiscardUnsavedChanges } from "@/shared/workspace/dirty-tab-guard";
import { requestSidebarReveal } from "@/shared/workspace/sidebar-reveal";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import type { WorkspaceTab } from "@/shared/workspace/workspace.types";
import { formatWorkspaceTabTitle } from "@/shared/workspace/workspace.types";
import { isDashboardTabId } from "@/shared/workspace/workspace-dashboard";
import { findRouteGroupShortLabel } from "@/shared/workspace/workspace-routes";
import { findRouteById } from "@/shared/workspace/workspace-routes";
import {
    computeWorkspaceTabGroups,
    WORKSPACE_TAB_GROUP_TONE,
    workspaceTabSystem,
} from "@/shared/workspace/workspace-tab-groups";

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

/** Chip do grupo (sigla do sistema). Clique recolhe/expande o grupo, como no navegador. */
/** Id do chip no `SortableContext` (convive com os ids das abas). */
const GROUP_DRAG_PREFIX = "group:";

function groupDragId(system: SystemEnum): string {
    return `${GROUP_DRAG_PREFIX}${system}`;
}

function systemFromGroupDragId(id: string): SystemEnum | null {
    return id.startsWith(GROUP_DRAG_PREFIX) ? (id.slice(GROUP_DRAG_PREFIX.length) as SystemEnum) : null;
}

type WorkspaceTabGroupChipProps = {
    system: SystemEnum;
    count: number;
    collapsed: boolean;
    onToggle?: () => void;
    onContextMenu?: (event: MouseEvent) => void;
    className?: string;
    style?: CSSProperties;
    buttonRef?: (node: HTMLButtonElement | null) => void;
} & Record<string, unknown>;

/** Chip do grupo (sigla do sistema): clique recolhe/expande, botão direito abre as ações do grupo. */
function WorkspaceTabGroupChip({
    system,
    count,
    collapsed,
    onToggle,
    onContextMenu,
    className,
    style,
    buttonRef,
    ...rest
}: WorkspaceTabGroupChipProps) {
    const { acronym, name } = SystemEnumHelper.getById(system);
    const label = `${name}: ${count} ${count === 1 ? "aba" : "abas"}`;
    return (
        <button
            ref={buttonRef}
            type="button"
            className={clsx("workspace-tab-group-chip", className)}
            style={style}
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? "Expandir" : "Recolher"} grupo ${label}`}
            title={`${label} · clique para ${collapsed ? "expandir" : "recolher"}, arraste para reordenar`}
            onClick={onToggle}
            onContextMenu={onContextMenu}
            {...rest}
        >
            <span>{acronym}</span>
            {collapsed ? <span className="workspace-tab-group-chip__count">{count}</span> : null}
        </button>
    );
}

/** Chip arrastável: arrastar o chip move o grupo inteiro de lugar na trilha. */
function SortableWorkspaceTabGroupChip(props: {
    system: SystemEnum;
    count: number;
    collapsed: boolean;
    onToggle: () => void;
    onContextMenu: (event: MouseEvent) => void;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: groupDragId(props.system) });
    return (
        <WorkspaceTabGroupChip
            {...props}
            buttonRef={setNodeRef}
            // O visual do arraste vai no DragOverlay; o chip original fica no lugar, apagado.
            style={{ opacity: isDragging ? 0.35 : undefined }}
            className="touch-none"
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

export function WorkspaceTabBar({
    dashboardTab: baseDashboardTab,
    moduleTabs,
    activeTabId,
    onSelect,
    onClose,
}: WorkspaceTabBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeSystemCtx = useOptionalActiveSystem();
    const activeSystem = activeSystemCtx?.activeSystem ?? null;
    // Painel + sigla do sistema do rail ("Painel GP"): o conteúdo do Painel é do sistema ativo.
    const dashboardTab = useMemo<WorkspaceTab>(() => {
        const acronym = activeSystemCtx?.isSettingsMode
            ? "CFG"
            : activeSystem
              ? SystemEnumHelper.getById(activeSystem).acronym
              : null;
        if (!acronym) return baseDashboardTab;
        const label = `${baseDashboardTab.routeLabel} ${acronym}`;
        return { ...baseDashboardTab, routeLabel: label, shortLabel: label };
    }, [activeSystem, activeSystemCtx?.isSettingsMode, baseDashboardTab]);
    const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<SystemEnum>>(() => new Set());
    /*
     * Grupos por sistema, como grupos de abas do navegador. Com uma aba só não há grupo; fixadas
     * ficam fora. A ordem já vem agrupada da store (`arrangeWorkspaceTabs`).
     */
    const tabGroups = useMemo(() => computeWorkspaceTabGroups(moduleTabs), [moduleTabs]);
    const toggleGroup = useCallback((system: SystemEnum) => {
        setCollapsedGroups((current) => {
            const next = new Set(current);
            if (next.has(system)) next.delete(system);
            else next.add(system);
            return next;
        });
    }, []);
    const dashboardActive = isDashboardTabId(activeTabId);
    const [contextMenu, setContextMenu] = useState<WorkspaceTabContextMenuState | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const { openRouteCreate, focusTabById } = useWorkspaceNavigation();
    const closeAllTabs = useWorkspaceStore((s) => s.closeAllTabs);
    const closeUnpinnedTabs = useWorkspaceStore((s) => s.closeUnpinnedTabs);
    const closeOtherTabs = useWorkspaceStore((s) => s.closeOtherTabs);
    const togglePinTab = useWorkspaceStore((s) => s.togglePinTab);
    const reorderTabs = useWorkspaceStore((s) => s.reorderTabs);

    // Ordem dos itens arrastáveis como aparecem na trilha: chip de cada grupo antes das abas dele.
    const sortableIds = useMemo(() => {
        const ids: string[] = [];
        for (const tab of moduleTabs) {
            const group = tabGroups.info.get(tab.id);
            if (group?.system && group.start) ids.push(groupDragId(group.system));
            ids.push(tab.id);
        }
        return ids;
    }, [moduleTabs, tabGroups]);
    const draggingGroup = activeDragId ? systemFromGroupDragId(activeDragId) : null;
    // Arrastando um grupo, as abas não se deslocam: o grupo inteiro muda de lugar ao soltar.
    const sortingStrategy = useCallback<SortingStrategy>(
        (args) => (draggingGroup ? null : horizontalListSortingStrategy(args)),
        [draggingGroup],
    );
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
            const activeGroup = systemFromGroupDragId(String(active.id));
            if (activeGroup) {
                const overId = String(over.id);
                const overSystem =
                    systemFromGroupDragId(overId) ?? tabGroups.info.get(overId)?.system ?? null;
                if (!overSystem || overSystem === activeGroup) return;
                const order: SystemEnum[] = [];
                for (const tab of moduleTabs) {
                    const system = tabGroups.info.get(tab.id)?.system;
                    if (system && !order.includes(system)) order.push(system);
                }
                const from = order.indexOf(activeGroup);
                const to = order.indexOf(overSystem);
                order.splice(from, 1);
                order.splice(to, 0, activeGroup);
                const ungrouped = moduleTabs.filter((tab) => !tabGroups.info.get(tab.id)?.system);
                const grouped = order.flatMap((system) =>
                    moduleTabs.filter((tab) => tabGroups.info.get(tab.id)?.system === system),
                );
                reorderTabs([...ungrouped, ...grouped].map((tab) => tab.id));
                return;
            }
            const oldIndex = moduleTabs.findIndex((tab) => tab.id === active.id);
            // Aba solta sobre o chip do próprio grupo vai para o início do grupo.
            const overGroup = systemFromGroupDragId(String(over.id));
            const newIndex = overGroup
                ? moduleTabs.findIndex((tab) => tabGroups.info.get(tab.id)?.system === overGroup)
                : moduleTabs.findIndex((tab) => tab.id === over.id);
            if (oldIndex < 0 || newIndex < 0) return;
            const activeTab = moduleTabs[oldIndex];
            const overTab = moduleTabs[newIndex];
            if (Boolean(activeTab.pinned) !== Boolean(overTab.pinned)) return;
            // Reordena só dentro do grupo do sistema (a store também mantém o agrupamento).
            if (!activeTab.pinned && workspaceTabSystem(activeTab) !== workspaceTabSystem(overTab)) return;

            const next = [...moduleTabs];
            const [moved] = next.splice(oldIndex, 1);
            next.splice(newIndex, 0, moved);
            reorderTabs(next.map((tab) => tab.id));
        },
        [moduleTabs, reorderTabs, tabGroups],
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
        const nextActiveId = useWorkspaceStore.getState().activeTabId;
        if (nextActiveId) focusTabById(nextActiveId, "replace");
    }, [closeAllTabs, closeUnpinnedTabs, focusTabById, moduleTabs, pinnedCount]);

    const handleCloseOtherTabs = useCallback(
        async (tab: WorkspaceTab) => {
            const otherIds = moduleTabs.filter((item) => item.id !== tab.id).map((item) => item.id);
            if (otherIds.length === 0) return;
            if (!(await confirmDiscardUnsavedChanges(otherIds))) return;
            closeOtherTabs(tab.id);
            focusTabById(tab.id, "replace");
        },
        [closeOtherTabs, focusTabById, moduleTabs],
    );

    /** "Ir para Menu": troca o rail para o sistema da aba, se preciso, e mostra o item no menu. */
    const handleRevealInMenu = useCallback(
        (tab: WorkspaceTab) => {
            const system = workspaceTabSystem(tab);
            if (system && activeSystemCtx && !activeSystemCtx.isSettingsMode && system !== activeSystem) {
                activeSystemCtx.selectSystem(system);
            }
            requestSidebarReveal(tab.routeId);
        },
        [activeSystem, activeSystemCtx],
    );

    /** Fecha todas as abas dos grupos informados (confirma se houver alteração não salva). */
    const closeGroups = useCallback(
        async (systems: readonly SystemEnum[]) => {
            if (systems.length === 0) return;
            const groupIds = moduleTabs
                .filter((item) => {
                    const system = tabGroups.info.get(item.id)?.system;
                    return system != null && systems.includes(system);
                })
                .map((item) => item.id);
            if (groupIds.length === 0) return;
            if (!(await confirmDiscardUnsavedChanges(groupIds))) return;
            const { closeTab } = useWorkspaceStore.getState();
            groupIds.forEach((id) => closeTab(id));
            setCollapsedGroups((current) => {
                if (!systems.some((system) => current.has(system))) return current;
                const next = new Set(current);
                systems.forEach((system) => next.delete(system));
                return next;
            });
            const nextActiveId = useWorkspaceStore.getState().activeTabId;
            if (nextActiveId) focusTabById(nextActiveId, "replace");
        },
        [focusTabById, moduleTabs, tabGroups],
    );

    const handleCloseGroup = useCallback(
        async (tab: WorkspaceTab) => {
            const system = tabGroups.info.get(tab.id)?.system;
            if (system) await closeGroups([system]);
        },
        [closeGroups, tabGroups],
    );

    /* Botão direito no chip do grupo. */
    const [groupMenu, setGroupMenu] = useState<{ system: SystemEnum; x: number; y: number } | null>(null);
    const openGroupMenu = useCallback((system: SystemEnum, event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu(null);
        setGroupMenu({ system, x: event.clientX, y: event.clientY });
    }, []);
    const groupSystems = useMemo(() => [...tabGroups.counts.keys()], [tabGroups]);

    const contextGroupSystem = contextMenu ? (tabGroups.info.get(contextMenu.tab.id)?.system ?? null) : null;

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
                                    <SortableContext items={sortableIds} strategy={sortingStrategy}>
                                        <div
                                            role="tablist"
                                            className="workspace-tabbar-scroll-inner relative"
                                        >
                                            {/* popLayout: abas que saem saem do fluxo na hora; as que ficam deslizam com layout. */}
                                            <AnimatePresence initial={false} mode="popLayout">
                                                {moduleTabs.flatMap((tab, index) => {
                                                    const active = tab.id === activeTabId;
                                                    const showPinDivider =
                                                        pinnedCount > 0 &&
                                                        pinnedCount < moduleTabs.length &&
                                                        index === pinnedCount;
                                                    const group = tabGroups.info.get(tab.id);
                                                    const system = group?.system ?? null;
                                                    const groupCollapsed = system != null && collapsedGroups.has(system);
                                                    // Grupo recolhido: some, menos a aba ativa.
                                                    const hiddenInGroup = groupCollapsed && !active;
                                                    const tone = system ? WORKSPACE_TAB_GROUP_TONE[system] : undefined;
                                                    // Grupo: "DP ┃ aba | aba ┃ RH ┃ aba ┃" — barras grossas e altas no tom do grupo
                                                    // depois do chip e no fim do grupo; entre abas, a divisória "|" de sempre.
                                                    const visibleGroupTabIds = system
                                                        ? moduleTabs
                                                              .filter(
                                                                  (item) =>
                                                                      tabGroups.info.get(item.id)?.system === system &&
                                                                      (!groupCollapsed || item.id === activeTabId),
                                                              )
                                                              .map((item) => item.id)
                                                        : [];
                                                    const closesGroup =
                                                        visibleGroupTabIds[visibleGroupTabIds.length - 1] === tab.id;
                                                    const opensGroupRun = visibleGroupTabIds[0] === tab.id;
                                                    const groupDivider = (
                                                        <span className="workspace-tab-group-divider" aria-hidden />
                                                    );
                                                    const items = [];
                                                    // Primeiro grupo logo após as fixadas: a divisória de fixadas vem antes do chip.
                                                    const pinDividerBeforeChip = showPinDivider && system != null && Boolean(group?.start);
                                                    if (pinDividerBeforeChip) {
                                                        items.push(
                                                            <motion.span
                                                                key="pin-divider"
                                                                layout={activeDragId ? false : "position"}
                                                                className="workspace-tabbar-pin-divider"
                                                                aria-hidden
                                                            />,
                                                        );
                                                    }
                                                    if (system && group?.start) {
                                                        items.push(
                                                            <motion.div
                                                                key={`group:${system}`}
                                                                layout={activeDragId ? false : "position"}
                                                                initial={{ opacity: 0, scale: 0.94 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                                                                transition={TAB_MOUNT_TRANSITION}
                                                                className={clsx(
                                                                    "workspace-tab-group-item inline-flex shrink-0 items-center gap-1",
                                                                    index > 0 && !pinDividerBeforeChip && "workspace-tab-group-item--gap",
                                                                )}
                                                                data-tone={tone}
                                                            >
                                                                <SortableWorkspaceTabGroupChip
                                                                    system={system}
                                                                    count={tabGroups.counts.get(system) ?? 1}
                                                                    collapsed={groupCollapsed}
                                                                    onToggle={() => toggleGroup(system)}
                                                                    onContextMenu={(event) => openGroupMenu(system, event)}
                                                                />
                                                                {groupDivider}
                                                            </motion.div>,
                                                        );
                                                    }
                                                    if (hiddenInGroup) return items;
                                                    // Divisória "|" de sempre antes da aba: entre abas do mesmo grupo, ou fora de grupo (fixadas / aba única).
                                                    const showLeadingSeparator = system
                                                        ? !opensGroupRun
                                                        : index > 0 && !showPinDivider;
                                                    items.push(
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
                                                            className={clsx(
                                                                "inline-flex shrink-0 items-center gap-1",
                                                                system && "workspace-tab-group-item",
                                                            )}
                                                            data-tone={tone}
                                                            style={{ transformOrigin: "left center" }}
                                                        >
                                                            {showLeadingSeparator ? (
                                                                <span className="workspace-tabbar-sep" aria-hidden />
                                                            ) : null}
                                                            {showPinDivider && !pinDividerBeforeChip ? (
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
                                                            {system && closesGroup ? groupDivider : null}
                                                        </motion.div>,
                                                    );
                                                    return items;
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
                                {draggingGroup ? (
                                    <div
                                        className="workspace-tab-drag-overlay-wrap workspace-tab-group-item"
                                        data-tone={WORKSPACE_TAB_GROUP_TONE[draggingGroup]}
                                    >
                                        <WorkspaceTabGroupChip
                                            system={draggingGroup}
                                            count={tabGroups.counts.get(draggingGroup) ?? 1}
                                            collapsed
                                        />
                                    </div>
                                ) : activeDragTab ? (
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
                onRevealInMenu={handleRevealInMenu}
                onCloseGroup={
                    contextGroupSystem
                        ? (tab) => {
                              void handleCloseGroup(tab);
                          }
                        : undefined
                }
                groupLabel={contextGroupSystem ? SystemEnumHelper.getById(contextGroupSystem).acronym : undefined}
            />
            <WorkspaceTabGroupContextMenu
                state={
                    groupMenu
                        ? {
                              acronym: SystemEnumHelper.getById(groupMenu.system).acronym,
                              name: SystemEnumHelper.getById(groupMenu.system).name,
                              x: groupMenu.x,
                              y: groupMenu.y,
                              collapsed: collapsedGroups.has(groupMenu.system),
                          }
                        : null
                }
                onClose={() => setGroupMenu(null)}
                onToggleCollapsed={() => {
                    if (groupMenu) toggleGroup(groupMenu.system);
                }}
                onOpenSystemMenu={() => {
                    if (groupMenu && activeSystemCtx) activeSystemCtx.selectSystem(groupMenu.system);
                }}
                onCloseOtherGroups={() => {
                    if (groupMenu) void closeGroups(groupSystems.filter((system) => system !== groupMenu.system));
                }}
                onCloseGroup={() => {
                    if (groupMenu) void closeGroups([groupMenu.system]);
                }}
                canCloseOtherGroups={groupSystems.length > 1}
            />
        </div>
    );
}
