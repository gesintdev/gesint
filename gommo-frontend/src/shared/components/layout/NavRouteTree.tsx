"use client";

import clsx from "clsx";
import {ChevronRight} from "lucide-react";
import {useEffect, useState, type MouseEvent, type ReactNode} from "react";

import {parentGroupIdsForRoute} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {AppRoute, NavSection} from "@/modules/root/enum/ModuleEnum";
import {type CheckboxState, InputCheckbox} from "@/shared/components/ui/input/index";

function routeIsActive(route: AppRoute, highlightRouteId: string | null): boolean {
    if (!highlightRouteId) return false;
    if (route.id === highlightRouteId) return true;
    return route.children?.some((child) => child.id === highlightRouteId) ?? false;
}

export type NavRouteTreeProps = {
    sections: NavSection[];
    selectedRouteId?: string | null;
    markedRouteIds?: ReadonlySet<string>;
    onRouteSelect: (_route: AppRoute) => void;
    className?: string;
    embedded?: boolean;
    /** Quando true com handlers, renderiza checkbox dentro do item (cadastro de perfil). */
    showAccessCheckbox?: boolean;
    /** Estado do checkbox por rota (folha ou grupo). */
    routeAccessStateById?: ReadonlyMap<string, CheckboxState>;
    /** Alterna acesso completo das permissões do menu. */
    onRouteAccessToggle?: (route: AppRoute) => void;
};

export function NavRouteTree({
    sections,
    selectedRouteId = null,
    markedRouteIds,
    onRouteSelect,
    className,
    embedded = false,
    showAccessCheckbox = false,
    routeAccessStateById,
    onRouteAccessToggle,
}: NavRouteTreeProps) {
    const accessEnabled =
        showAccessCheckbox && Boolean(onRouteAccessToggle) && Boolean(routeAccessStateById);
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

    const renderAccessCheckbox = (route: AppRoute) => {
        if (!accessEnabled || !routeAccessStateById || !onRouteAccessToggle) return null;
        const accessState = routeAccessStateById.get(route.id) ?? "unchecked";
        const stop = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <span
                className="profile-access-checkbox"
                onClick={stop}
                onMouseDown={stop}
                onKeyDown={(event) => event.stopPropagation()}
            >
                <InputCheckbox
                    state={accessState}
                    size="xs"
                    aria-label={
                        accessState === "checked"
                            ? `Remover permissões de ${route.label}`
                            : `Conceder todas as permissões de ${route.label}`
                    }
                    onChange={() => onRouteAccessToggle(route)}
                />
            </span>
        );
    };

    const renderMainContent = (route: AppRoute, options?: {chevron?: ReactNode; nested?: boolean}) => {
        const Icon = route.icon;
        const active = route.id === selectedRouteId;
        const marked = !active && (markedRouteIds?.has(route.id) ?? false);
        return (
            <>
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
                <span className={clsx("sidebar-copy truncate", options?.nested && "text-left")}>
                    {route.label}
                </span>
                {options?.chevron}
            </>
        );
    };

    const itemClassName = (
        route: AppRoute,
        options?: {nested?: boolean; expanded?: boolean; groupActive?: boolean},
    ) => {
        const active = route.id === selectedRouteId;
        const marked = !active && (markedRouteIds?.has(route.id) ?? false);
        return clsx(
            "nav-item group w-full",
            options?.nested && "nav-item-child",
            active && "nav-item-active",
            marked && "nav-item-marked",
            options?.groupActive && !options.expanded && "font-semibold text-base-content/80",
            options?.expanded && "nav-item-expanded",
            accessEnabled && "nav-item--with-access",
        );
    };

    const NavLink = ({route, nested}: {route: AppRoute; nested?: boolean}) => {
        if (!accessEnabled) {
            return (
                <button
                    type="button"
                    title={route.label}
                    onClick={() => onRouteSelect(route)}
                    className={itemClassName(route, {nested})}
                >
                    {renderMainContent(route, {nested})}
                </button>
            );
        }

        return (
            <div className={itemClassName(route, {nested})} title={route.label}>
                {renderAccessCheckbox(route)}
                <button
                    type="button"
                    className="nav-item__main"
                    onClick={() => onRouteSelect(route)}
                >
                    {renderMainContent(route, {nested})}
                </button>
            </div>
        );
    };

    const renderRoute = (route: AppRoute) => {
        const hasChildren = Boolean(route.children?.length);
        const active = routeIsActive(route, selectedRouteId);
        const expanded = isOpen(route.id);
        if (!hasChildren) {
            return (
                <li key={route.id}>
                    <NavLink route={route} />
                </li>
            );
        }

        const chevron = (
            <ChevronRight
                className={clsx(
                    "sidebar-copy size-3.5 shrink-0 text-base-content/30 transition-transform duration-200",
                    expanded && "rotate-90",
                )}
            />
        );

        if (!accessEnabled) {
            return (
                <li key={route.id} className="grid gap-0">
                    <button
                        type="button"
                        onClick={() => toggleGroup(route.id)}
                        aria-expanded={expanded}
                        title={route.label}
                        className={itemClassName(route, {expanded, groupActive: active})}
                    >
                        {renderMainContent(route, {chevron})}
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
        }

        return (
            <li key={route.id} className="grid gap-0">
                <div
                    className={itemClassName(route, {expanded, groupActive: active})}
                    title={route.label}
                >
                    {renderAccessCheckbox(route)}
                    <button
                        type="button"
                        className="nav-item__main"
                        onClick={() => toggleGroup(route.id)}
                        aria-expanded={expanded}
                    >
                        {renderMainContent(route, {chevron})}
                    </button>
                </div>
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
                accessEnabled && "nav-route-tree--with-access",
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
