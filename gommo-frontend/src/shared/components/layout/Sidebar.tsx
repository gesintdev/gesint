"use client";

import clsx from "clsx";
import {AnimatePresence, motion} from "framer-motion";
import {ChevronRight, Search} from "lucide-react";
import {usePathname} from "next/navigation";
import {type MouseEvent, useEffect, useMemo, useRef, useState} from "react";
import {APP_ROUTES, type AppRoute, flattenRoutes, NAV_SECTIONS} from "@/config/routes";
import {findRouteByHref} from "@/shared/workspace/workspace-routes";
import {SidebarFlyout} from "@/shared/components/layout/SidebarFlyout";
import {SidebarCollapseTrigger} from "@/shared/components/layout/SidebarCollapseTrigger";
import {GommoLogo} from "@/shared/components/layout/GommoLogo";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";
import {useWorkspaceStore} from "@/shared/workspace/workspace.store";

type SidebarProps = {
    collapsed: boolean;
    onCollapsedToggle?: () => void;
    mobileOpen?: boolean;
    onMobileCloseAction?: () => void;
};

function routeIsActive(route: AppRoute, highlightRouteId: string | null): boolean {
    if (!highlightRouteId) return false;
    if (route.id === highlightRouteId) return true;
    return route.children?.some((c) => c.id === highlightRouteId) ?? false;
}

export function Sidebar({collapsed, onCollapsedToggle, mobileOpen = false, onMobileCloseAction}: SidebarProps) {
    const pathname = usePathname();
    const {openRouteModule} = useWorkspaceNavigation();
    const activeRouteId = useWorkspaceStore((s) => {
        if (!s.activeTabId) return null;
        return s.tabs.find((t) => t.id === s.activeTabId)?.routeId ?? null;
    });
    const [highlightRouteId, setHighlightRouteId] = useState<string | null>(null);
    const pathnameRouteId = useMemo(() => findRouteByHref(pathname)?.id ?? null, [pathname]);
    const navHighlightRouteId = highlightRouteId ?? activeRouteId ?? pathnameRouteId;
    const [query, setQuery] = useState("");
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());
    const [flyout, setFlyout] = useState<{ route: AppRoute; top: number } | null>(null);

    const flat = useMemo(() => flattenRoutes(APP_ROUTES), []);
    const isSearching = query.trim().length > 0;
    const panelCollapsed = collapsed && !mobileOpen;
    const openRouteFromMenu = (route: AppRoute, event?: MouseEvent) => {
        event?.preventDefault();
        if (!route.href) return;
        setHighlightRouteId(route.id);
        openRouteModule(route);
        onMobileCloseAction?.();
    };

    useEffect(() => {
        if (highlightRouteId && highlightRouteId === activeRouteId) {
            setHighlightRouteId(null);
        }
    }, [activeRouteId, highlightRouteId]);

    const filteredSections = useMemo(() => {
        if (!isSearching) return NAV_SECTIONS;
        const q = query.toLowerCase();
        const matches = flat.filter((r) => r.searchLabel.toLowerCase().includes(q));
        const ids = new Set(matches.map((m) => m.id));
        return NAV_SECTIONS.map((section) => ({
            ...section,
            routes: section.routes.filter(
                (r) =>
                    ids.has(r.id) ||
                    r.children?.some((c) => ids.has(c.id)) ||
                    r.label.toLowerCase().includes(q),
            ),
        })).filter((s) => s.routes.length > 0);
    }, [query, flat, isSearching]);

    const onMobileCloseRef = useRef(onMobileCloseAction);
    onMobileCloseRef.current = onMobileCloseAction;

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
                    panelCollapsed && !nested && "nav-item-collapsed",
                    active && "nav-item-active",
                )}
            >
                <Icon
                    className={clsx(
                        "size-4.25 shrink-0 transition-colors duration-150",
                        active
                            ? "text-primary"
                            : "text-base-content/38 group-hover:text-base-content/65",
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
        const expanded = isOpen(route.id);

        if (panelCollapsed && hasChildren) {
            return (
                <li key={route.id}>
                    <button
                        type="button"
                        aria-label={route.label}
                        onClick={(e) => setFlyout({route, top: e.currentTarget.getBoundingClientRect().top})}
                        className={clsx("nav-item nav-item-collapsed", active && "nav-item-active")}
                    >
                        <Icon className="size-4.25" strokeWidth={2}/>
                        <span className="sidebar-copy truncate text-left">{route.label}</span>
                    </button>
                </li>
            );
        }

        if (panelCollapsed) {
            return (
                <li key={route.id}>
                    <NavLink route={route}/>
                </li>
            );
        }

        if (!hasChildren) {
            return (
                <li key={route.id}>
                    <NavLink route={route}/>
                </li>
            );
        }

        return (
            <li key={route.id} className="grid gap-1 ">
                <button
                    type="button"
                    onClick={() => toggleGroup(route.id)}
                    aria-expanded={expanded}
                    className={clsx(
                        "nav-item ",
                        active && !expanded && "font-semibold text-base-content/80",
                        expanded && "nav-item-expanded",
                    )}
                >
                    <Icon className="size-4.25 shrink-0 text-base-content/38" strokeWidth={2}/>
                    <span className="sidebar-copy truncate text-left">{route.label}</span>
                    <ChevronRight
                        className={clsx(
                            "sidebar-copy size-3.5 shrink-0 text-base-content/30 transition-transform duration-200",
                            expanded && "rotate-90",
                        )}
                    />
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
            {/* Logo area */}
            <div
                className="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4"
                style={{borderColor: "var(--sidebar-border)", background: "var(--sidebar-bg)"}}
            >
                {panelCollapsed ? (
                    <GommoLogo variant="icon"/>
                ) : (
                    <GommoLogo/>
                )}
            </div>

            {/* Search (expandido) ou expandir (colapsado) */}
            <div
                className={clsx(
                    "sidebar-toolbar flex items-center px-3 py-3",
                    panelCollapsed ? "justify-center" : "gap-2.5",
                )}
            >
                {panelCollapsed ? (
                    opts.desktop && onCollapsedToggle && (
                        <SidebarCollapseTrigger
                            collapsed={collapsed}
                            onToggle={onCollapsedToggle}
                        />
                    )
                ) : (
                    <>
                        <div className="min-w-0 flex-1">
                            <label className="gommo-field sidebar-shell-control w-full text-sm!">
                                <Search className="size-3.5 shrink-0 text-primary/60" strokeWidth={2}/>
                                <input
                                    type="search"
                                    placeholder="Buscar no menu..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="text-sm!"
                                />
                            </label>
                        </div>
                        {opts.desktop && onCollapsedToggle && (
                            <SidebarCollapseTrigger collapsed={collapsed} onToggle={onCollapsedToggle}/>
                        )}
                    </>
                )}
            </div>

            {/* Nav */}
            <div className="sidebar-nav-wrap min-h-0 flex-1">
                <nav className="sidebar-nav space-y-4 px-3 py-2" aria-label="Navegacao principal">
                    {filteredSections.map((section) => (
                        <div key={section.id}>
                            <div className="flex flex-col">
                                <div className="flex min-h-6 items-center px-3">
                                    {panelCollapsed ? (
                                        <div className="nav-section-rule" aria-hidden="true"/>
                                    ) : (
                                        <p className="nav-section-label">{section.label}</p>
                                    )}
                                </div>
                                <ul className="space-y-1 px-2">
                                    {section.routes.map(renderRoute)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );

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
                            onClick={onMobileCloseAction}
                        />
                        <motion.aside
                            initial={{x: "-100%"}}
                            animate={{x: 0}}
                            exit={{x: "-100%"}}
                            transition={{duration: 0.28, ease: [0.22, 1, 0.36, 1]}}
                            className="fixed top-0 z-50 flex h-screen w-(--sidebar-width) flex-col border-r lg:hidden"
                            style={{background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)"}}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {sidebarPanel({desktop: false})}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside
                data-collapsed={collapsed ? "true" : undefined}
                className={clsx(
                    "fixed top-0 z-40 hidden h-screen flex-col overflow-hidden border-r transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex",
                    collapsed ? "w-(--sidebar-collapsed)" : "w-(--sidebar-width)",
                )}
                style={{background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)"}}
            >
                {sidebarPanel({desktop: true})}
            </aside>

            {collapsed && flyout && (
                <SidebarFlyout route={flyout.route} anchorTop={flyout.top} onClose={() => setFlyout(null)}/>
            )}
        </>
    );
}
