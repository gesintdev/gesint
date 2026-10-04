import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {ChevronRight, Search} from "lucide-react";
import {usePathname} from "next/navigation";
import {type MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {type AppRoute, flattenRoutes} from "@/config/routes";
import {SidebarCollapseTrigger} from "@/shared/components/layout/SidebarCollapseTrigger";
import {SidebarFlyout} from "@/shared/components/layout/SidebarFlyout";
import {SystemRail} from "@/shared/components/layout/SystemRail";
import {useActiveSystem, useActiveSystemRoutes} from "@/shared/context/ActiveSystemContext";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";
import {findRouteByHref} from "@/shared/workspace/workspace-routes";

/** Alinhado a `.sidebar-submenu` / `--sidebar-transition-duration`. */
const SUBMENU_CLOSE_MS = 140;
const SIDEBAR_WIDTH_MS = 280;
const FLYOUT_HOVER_OPEN_MS = 1000;
const FLYOUT_HOVER_CLOSE_MS = 160;

type SidebarProps = {
    collapsed: boolean;
    onCollapsedToggle?: () => void;
    mobileOpen?: boolean;
    onMobileCloseAction?: () => void;
};

function wait(ms: number) {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function routeIsActive(route: AppRoute, highlightRouteId: string | null): boolean {
    if (!highlightRouteId) return false;
    if (route.id === highlightRouteId) return true;
    return route.children?.some((c) => c.id === highlightRouteId) ?? false;
}

function SidebarCollapseControl({
                                    desktop,
                                    collapsed,
                                    onToggle,
                                }: {
    desktop: boolean;
    collapsed: boolean;
    onToggle?: () => void;
}) {
    if (!desktop || !onToggle) return null;

    return <SidebarCollapseTrigger collapsed={collapsed} onToggle={onToggle}/>;
}

function SidebarToolbar({
                            panelCollapsed,
                            desktop,
                            collapsed,
                            onCollapsedToggle,
                            query,
                            onQueryChange,
                        }: {
    panelCollapsed: boolean;
    desktop: boolean;
    collapsed: boolean;
    onCollapsedToggle?: () => void;
    query: string;
    onQueryChange: (_value: string) => void;
}) {
    return (
        <div
            className={clsx("sidebar-toolbar", panelCollapsed && "sidebar-toolbar--collapsed")}
        >
            {/* Busca permanece no DOM (só some visualmente) — evita salto de altura no collapse. */}
            <div className="sidebar-toolbar-search" aria-hidden={panelCollapsed}>
                <label className="gommo-field sidebar-shell-control relative w-full cursor-text">
                    <Search className="size-4 shrink-0 text-primary/55" strokeWidth={2}/>
                    <input
                        type="search"
                        placeholder="Buscar no menu..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        tabIndex={panelCollapsed ? -1 : undefined}
                        className="pe-2 placeholder:text-base-content/32"
                    />
                </label>
            </div>
            <SidebarCollapseControl desktop={desktop} collapsed={collapsed} onToggle={onCollapsedToggle}/>
        </div>
    );
}

export function Sidebar({collapsed, onCollapsedToggle, mobileOpen = false, onMobileCloseAction}: SidebarProps) {
    const pathname = usePathname();
    const {navSections} = useActiveSystem();
    const activeSystemRoutes = useActiveSystemRoutes();
    const {openRouteModule} = useWorkspaceNavigation();
    const [highlightRouteId, setHighlightRouteId] = useState<string | null>(null);
    const pathnameRouteId = useMemo(() => findRouteByHref(pathname)?.id ?? null, [pathname]);
    const navHighlightRouteId = highlightRouteId ?? pathnameRouteId;
    const [query, setQuery] = useState("");
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());
    const [flyout, setFlyout] = useState<{ route: AppRoute; top: number } | null>(null);
    const savedOpenIdsRef = useRef<Set<string>>(new Set());
    const toggleLockedRef = useRef(false);
    const flyoutOpenTimerRef = useRef<number | null>(null);
    const flyoutCloseTimerRef = useRef<number | null>(null);
    const flat = useMemo(() => flattenRoutes(activeSystemRoutes), [activeSystemRoutes]);
    const isSearching = query.trim().length > 0;
    const panelCollapsed = collapsed && !mobileOpen;

    const clearFlyoutOpenTimer = useCallback(() => {
        if (flyoutOpenTimerRef.current != null) {
            window.clearTimeout(flyoutOpenTimerRef.current);
            flyoutOpenTimerRef.current = null;
        }
    }, []);

    const clearFlyoutCloseTimer = useCallback(() => {
        if (flyoutCloseTimerRef.current != null) {
            window.clearTimeout(flyoutCloseTimerRef.current);
            flyoutCloseTimerRef.current = null;
        }
    }, []);

    const openFlyoutAt = useCallback(
        (route: AppRoute, anchor: HTMLElement) => {
            clearFlyoutOpenTimer();
            clearFlyoutCloseTimer();
            setFlyout({route, top: anchor.getBoundingClientRect().top});
        },
        [clearFlyoutCloseTimer, clearFlyoutOpenTimer],
    );

    const scheduleFlyoutOpen = useCallback(
        (route: AppRoute, anchor: HTMLElement) => {
            clearFlyoutOpenTimer();
            clearFlyoutCloseTimer();
            flyoutOpenTimerRef.current = window.setTimeout(() => {
                setFlyout({route, top: anchor.getBoundingClientRect().top});
                flyoutOpenTimerRef.current = null;
            }, FLYOUT_HOVER_OPEN_MS);
        },
        [clearFlyoutCloseTimer, clearFlyoutOpenTimer],
    );

    const scheduleFlyoutClose = useCallback(() => {
        clearFlyoutCloseTimer();
        flyoutCloseTimerRef.current = window.setTimeout(() => {
            setFlyout(null);
            flyoutCloseTimerRef.current = null;
        }, FLYOUT_HOVER_CLOSE_MS);
    }, [clearFlyoutCloseTimer]);

    const closeFlyout = useCallback(() => {
        clearFlyoutOpenTimer();
        clearFlyoutCloseTimer();
        setFlyout(null);
    }, [clearFlyoutCloseTimer, clearFlyoutOpenTimer]);

    useEffect(() => {
        return () => {
            clearFlyoutOpenTimer();
            clearFlyoutCloseTimer();
        };
    }, [clearFlyoutCloseTimer, clearFlyoutOpenTimer]);

    const openRouteFromMenu = (route: AppRoute, event?: MouseEvent) => {
        event?.preventDefault();
        if (!route.href) return;
        setHighlightRouteId(route.id);
        openRouteModule(route);
        onMobileCloseAction?.();
    };

    /**
     * Collapse: 1) fecha grupos → 2) estreita sidebar.
     * Se não há grupo/busca aberta, pula o step 1 e o delay do step 2 — colapsa na hora.
     * Expand: 1) alarga sidebar → 2) reabre grupos que estavam abertos.
     */
    const handleCollapsedToggle = useCallback(async () => {
        if (!onCollapsedToggle || toggleLockedRef.current) return;
        toggleLockedRef.current = true;
        try {
            if (!collapsed) {
                savedOpenIdsRef.current = new Set(openIds);
                const hadOpenGroups = openIds.size > 0 || query.trim().length > 0;
                setQuery("");
                setOpenIds(new Set());
                closeFlyout();
                if (hadOpenGroups) {
                    await wait(SUBMENU_CLOSE_MS);
                    onCollapsedToggle();
                    await wait(SIDEBAR_WIDTH_MS);
                } else {
                    onCollapsedToggle();
                }
                return;
            }

            onCollapsedToggle();
            await wait(SIDEBAR_WIDTH_MS);
            const restoreIds = savedOpenIdsRef.current;
            if (restoreIds.size > 0) {
                setOpenIds(new Set(restoreIds));
            }
        } finally {
            toggleLockedRef.current = false;
        }
    }, [closeFlyout, collapsed, onCollapsedToggle, openIds, query]);
    const filteredSections = useMemo(() => {
        if (!isSearching) return navSections;
        const q = query.toLowerCase();
        const matches = flat.filter((r) => r.searchLabel.toLowerCase().includes(q));
        const ids = new Set(matches.map((m) => m.id));
        return navSections
            .map((section) => ({
                ...section,
                routes: section.routes.filter(
                    (r) => ids.has(r.id) || r.children?.some((c) => ids.has(c.id)) || r.label.toLowerCase().includes(q),
                ),
            }))
            .filter((s) => s.routes.length > 0);
    }, [query, flat, isSearching, navSections]);
    const onMobileCloseRef = useRef(onMobileCloseAction);

    useEffect(() => {
        onMobileCloseRef.current = onMobileCloseAction;
    }, [onMobileCloseAction]);

    useEffect(() => {
        onMobileCloseRef.current?.();
    }, [pathname]);

    useEffect(() => {
        if (panelCollapsed) {
            setQuery("");
        }
    }, [panelCollapsed]);

    const toggleGroup = (id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    /** Expansão só por clique do usuário (ou busca); troca de aba não abre/fecha grupos. */
    const isOpen = (id: string) => isSearching || openIds.has(id);
    const NavLink = ({route, nested}: { route: AppRoute; nested?: boolean }) => {
        const Icon = route.icon;
        const active = route.id === navHighlightRouteId;

        return (
            <button
                type="button"
                title={route.label}
                onClick={(e) => openRouteFromMenu(route, e)}
                className={clsx(
                    "nav-item group w-full",
                    nested && "nav-item-child",
                    active && "nav-item-active",
                )}
            >
                <Icon
                    className={clsx(
                        "size-4.25 shrink-0 transition-colors duration-150",
                        active ? "text-primary" : "text-base-content/38 group-hover:text-base-content/65",
                    )}
                    strokeWidth={active ? 2.25 : 2}
                />
                <span className="sidebar-copy truncate">{route.label}</span>
            </button>
        );
    };
    const renderRoute = (route: AppRoute) => {
        const Icon = route.icon;
        const hasChildren = Boolean(route.children?.length);
        const active = routeIsActive(route, navHighlightRouteId);
        const expanded = isOpen(route.id) && !panelCollapsed;

        if (!hasChildren) {
            return (
                <li key={route.id}>
                    <NavLink route={route}/>
                </li>
            );
        }

        /* Mesma árvore expandido/colapsado — evita salto ao trocar DOM no collapse. */
        return (
            <li key={route.id} className="grid gap-0">
                <button
                    type="button"
                    aria-label={route.label}
                    aria-expanded={expanded}
                    onClick={(e) => {
                        if (panelCollapsed) {
                            openFlyoutAt(route, e.currentTarget);
                            return;
                        }
                        toggleGroup(route.id);
                    }}
                    onMouseEnter={(e) => {
                        if (!panelCollapsed) return;
                        scheduleFlyoutOpen(route, e.currentTarget);
                    }}
                    onMouseLeave={() => {
                        if (!panelCollapsed) return;
                        clearFlyoutOpenTimer();
                        scheduleFlyoutClose();
                    }}
                    className={clsx(
                        "nav-item",
                        active && !expanded && "font-semibold text-base-content/80",
                        expanded && "nav-item-expanded",
                        active && panelCollapsed && "nav-item-active",
                    )}
                >
                    <Icon
                        className={clsx(
                            "size-4.25 shrink-0",
                            active && panelCollapsed ? "text-primary" : "text-base-content/38",
                        )}
                        strokeWidth={2}
                    />
                    {panelCollapsed ? (
                        <ChevronRight
                            className="size-3 shrink-0 text-base-content/40"
                            strokeWidth={2.5}
                        />
                    ) : (
                        <span className="sidebar-copy truncate text-left">{route.label}</span>
                    )}
                    {!panelCollapsed ? (
                        <ChevronRight
                            className={clsx(
                                "sidebar-copy size-3.5 shrink-0 text-base-content/30 transition-transform duration-200",
                                expanded && "rotate-90",
                            )}
                        />
                    ) : null}
                </button>
                <div
                    aria-hidden={!expanded}
                    data-open={expanded ? "true" : "false"}
                    className="sidebar-submenu"
                >
                    <div className="sidebar-submenu__viewport">
                        <div className="sidebar-submenu__reveal">
                            <ul className="nav-group-children flex flex-col gap-0.5">
                                {route.children?.map((child) => (
                                    <li key={child.id}>
                                        <NavLink route={child} nested/>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </li>
        );
    };
    const sidebarPanel = (opts: { desktop: boolean }) => (
        <>
            <SidebarToolbar
                panelCollapsed={panelCollapsed}
                desktop={opts.desktop}
                collapsed={collapsed}
                onCollapsedToggle={() => {
                    void handleCollapsedToggle();
                }}
                query={query}
                onQueryChange={setQuery}
            />
            {/* Nav */}
            <div className="sidebar-nav-wrap min-h-0 flex-1">
                <nav className="sidebar-nav space-y-3 py-1.5" aria-label="Navegacao principal">
                    {filteredSections.map((section) => (
                        <div key={section.id}>
                            <div className="flex flex-col">
                                <div className="nav-section-head">
                                    <p className="nav-section-label sidebar-copy pl-2">{section.label}</p>
                                    <p className="nav-section-abbr" aria-hidden="true">
                                        {section.shortLabel || section.label.slice(0, 2)}
                                    </p>
                                </div>
                                <ul className="space-y-0.5 px-(--sidebar-nav-list-pad-x)">
                                    {section.routes.map(renderRoute)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
    const sidebarShell = (opts: { desktop: boolean }) => (
        <div className="flex h-full min-w-0">
            <SystemRail/>
            <div
                className={clsx(
                    "sidebar-routes-panel flex min-w-0 shrink-0 flex-col overflow-hidden border-r transition-[width] duration-(--sidebar-transition-duration) ease-[cubic-bezier(0.22,1,0.36,1)]",
                    opts.desktop && collapsed ? "w-(--sidebar-collapsed)" : "w-(--sidebar-width)",
                    opts.desktop && collapsed && "sidebar-routes-panel--collapsed",
                )}
                data-collapsed={opts.desktop && collapsed ? "true" : undefined}
                style={{
                    background: "var(--sidebar-bg)",
                    borderColor: "var(--sidebar-border)",
                }}
            >
                <div className="sidebar-routes-content">{sidebarPanel(opts)}</div>
            </div>
        </div>
    );
    const sidebarTotalWidth = "calc(var(--system-rail-width) + var(--sidebar-width))";
    const sidebarBodyStyle = {
        top: "var(--header-height)",
        height: "calc(100dvh - var(--header-height))",
    } as const;

    return (
        <>
            {/* Mobile overlay + drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Fechar menu"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.2}}
                            className="fixed inset-0 z-40 bg-base-content/20 backdrop-blur-[3px] lg:hidden"
                            style={{top: "var(--header-height)"}}
                            onClick={onMobileCloseAction}
                        />
                        <motion.aside
                            initial={{x: "-100%"}}
                            animate={{x: 0}}
                            exit={{x: "-100%"}}
                            transition={{duration: 0.28, ease: [0.22, 1, 0.36, 1]}}
                            className="sidebar-mobile-drawer fixed left-0 z-50 flex overflow-hidden border-r lg:hidden"
                            style={{
                                ...sidebarBodyStyle,
                                width: sidebarTotalWidth,
                                background: "var(--sidebar-bg)",
                                borderColor: "var(--sidebar-border)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {sidebarShell({desktop: false})}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
            {/* Desktop — abaixo do header: coluna sistemas | coluna rotas */}
            <aside
                data-collapsed={collapsed ? "true" : undefined}
                className="fixed left-0 z-40 hidden overflow-hidden transition-[width] duration-(--sidebar-transition-duration) ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex"
                style={{
                    ...sidebarBodyStyle,
                    width: collapsed ? "calc(var(--system-rail-width) + var(--sidebar-collapsed))" : sidebarTotalWidth,
                }}
            >
                {sidebarShell({desktop: true})}
            </aside>
            {collapsed && flyout && (
                <SidebarFlyout
                    route={flyout.route}
                    anchorTop={flyout.top}
                    highlightRouteId={navHighlightRouteId}
                    onSelectRoute={(route) => setHighlightRouteId(route.id)}
                    onMouseEnterFlyout={clearFlyoutCloseTimer}
                    onClose={closeFlyout}
                />
            )}
        </>
    );
}
