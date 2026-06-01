"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppRoute, NavSection } from "@/modules/root/enum/ModuleEnum";
import { parentGroupIdsForRoute } from "@/modules/settings/lib/access-menu-catalog";

function routeIsActive(route: AppRoute, highlightRouteId: string | null): boolean {
    if (!highlightRouteId) return false;
    if (route.id === highlightRouteId) return true;
    return route.children?.some((child) => child.id === highlightRouteId) ?? false;
}

export type NavRouteTreeProps = {
    sections: NavSection[];
    selectedRouteId?: string | null;
    markedRouteIds?: ReadonlySet<string>;
    onRouteSelect: (route: AppRoute) => void;
    className?: string;
    embedded?: boolean;
};

export function NavRouteTree({
    sections,
    selectedRouteId = null,
    markedRouteIds,
    onRouteSelect,
    className,
    embedded = false,
}: NavRouteTreeProps) {
    const [openIds, setOpenIds] = useState<Set<string>>(() => {
        const initial = new Set<string>();
        if (selectedRouteId) {
            for (const id of parentGroupIdsForRoute(sections, selectedRouteId)) {
                initial.add(id);
            }
        }
        return initial;
    });

    useEffect(() => {
        if (!selectedRouteId) return;
        setOpenIds((prev) => {
            const next = new Set(prev);
            for (const id of parentGroupIdsForRoute(sections, selectedRouteId)) {
                next.add(id);
            }
            return next;
        });
    }, [sections, selectedRouteId]);

    const toggleGroup = (id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const isOpen = (id: string) => openIds.has(id);

    const NavLink = ({ route, nested }: { route: AppRoute; nested?: boolean }) => {
        const Icon = route.icon;
        const active = route.id === selectedRouteId;
        const marked = !active && (markedRouteIds?.has(route.id) ?? false);

        return (
            <button
                type="button"
                title={route.label}
                onClick={() => onRouteSelect(route)}
                className={clsx(
                    "nav-item group w-full",
                    nested && "nav-item-child",
                    active && "nav-item-active",
                    marked && "nav-item-marked",
                )}
            >
                <Icon
                    className={clsx(
                        "size-4 shrink-0 transition-colors duration-150",
                        active
                            ? "text-primary"
                            : marked
                              ? "text-success"
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
        const active = routeIsActive(route, selectedRouteId);
        const marked = !active && (markedRouteIds?.has(route.id) ?? false);
        const expanded = isOpen(route.id);

        if (!hasChildren) {
            return (
                <li key={route.id}>
                    <NavLink route={route} />
                </li>
            );
        }

        return (
            <li key={route.id} className="grid gap-1">
                <button
                    type="button"
                    onClick={() => toggleGroup(route.id)}
                    aria-expanded={expanded}
                    className={clsx(
                        "nav-item",
                        active && !expanded && "font-semibold text-base-content/80",
                        marked && "nav-item-marked",
                        expanded && "nav-item-expanded",
                    )}
                >
                    <Icon
                        className={clsx(
                            "size-4 shrink-0 transition-colors duration-150",
                            marked ? "text-success" : "text-base-content/38",
                        )}
                        strokeWidth={2}
                    />
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
                                        <NavLink route={child} nested />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <nav
            className={clsx(
                "nav-route-tree min-h-0 flex-1 overflow-y-auto",
                embedded && "nav-route-tree--embedded",
                className,
            )}
            aria-label="Menus do sistema"
        >
            <div className={clsx("space-y-3", embedded ? "px-2 py-2" : "px-3 py-2")}>
                {sections.map((section) => (
                    <div key={section.id}>
                        <div className="flex min-h-5 items-center px-1">
                            <p className="nav-section-label">{section.label}</p>
                        </div>
                        <ul className="mt-0.5 space-y-0.5 px-1">{section.routes.map(renderRoute)}</ul>
                    </div>
                ))}
            </div>
        </nav>
    );
}
