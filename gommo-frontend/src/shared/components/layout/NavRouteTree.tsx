"use client";

import clsx from "clsx";
import {ChevronRight} from "lucide-react";
import {
    memo,
    useCallback,
    useEffect,
    useState,
    type MouseEvent,
    type ReactNode,
} from "react";

import {parentGroupIdsForRoute} from "@/modules/cfg/settings/lib/access-menu-catalog";
import type {AppRoute, NavSection} from "@/modules/root/enum/ModuleEnum";
import {type CheckboxState, InputCheckbox} from "@/shared/components/ui/input/index";

function routeIsActive(route: AppRoute, highlightRouteId: string | null): boolean {
    if (!highlightRouteId) return false;
    if (route.id === highlightRouteId) return true;
    return route.children?.some((child) => child.id === highlightRouteId) ?? false;
}

function stopCheckboxBubble(event: MouseEvent) {
    event.stopPropagation();
}

type AccessCheckboxProps = {
    routeId: string;
    label: string;
    accessState: CheckboxState;
    readOnly: boolean;
    onToggle: () => void;
};

function AccessCheckbox({routeId, label, accessState, readOnly, onToggle}: AccessCheckboxProps) {
    return (
        <span
            className="profile-access-checkbox"
            onClick={stopCheckboxBubble}
            onMouseDown={(event) => {
                // Nao preventDefault no input — senao o checked visual trava.
                if ((event.target as HTMLElement).closest("input")) {
                    event.stopPropagation();
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            }}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <InputCheckbox
                key={`${routeId}-${accessState}`}
                state={accessState}
                size="xs"
                disabled={readOnly}
                readOnly={readOnly}
                aria-label={
                    accessState === "checked"
                        ? `Remover permissões de ${label}`
                        : `Conceder todas as permissões de ${label}`
                }
                onChange={readOnly ? undefined : onToggle}
            />
        </span>
    );
}

type RouteMainProps = {
    route: AppRoute;
    active: boolean;
    marked: boolean;
    nested?: boolean;
    chevron?: ReactNode;
};

const RouteMainContent = memo(function RouteMainContent({
    route,
    active,
    marked,
    nested,
    chevron,
}: RouteMainProps) {
    const Icon = route.icon;
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
            <span className={clsx("sidebar-copy truncate", nested && "text-left")}>{route.label}</span>
            {chevron}
        </>
    );
});

function itemClassName(options: {
    active: boolean;
    marked: boolean;
    nested?: boolean;
    expanded?: boolean;
    groupActive?: boolean;
    accessEnabled?: boolean;
}) {
    return clsx(
        "nav-item group w-full",
        options.nested && "nav-item-child",
        options.active && "nav-item-active",
        options.marked && "nav-item-marked",
        options.groupActive && !options.expanded && "font-semibold text-base-content/80",
        options.expanded && "nav-item-expanded",
        options.accessEnabled && "nav-item--with-access",
    );
}

type NavRouteLeafProps = {
    route: AppRoute;
    nested?: boolean;
    active: boolean;
    marked: boolean;
    accessEnabled: boolean;
    accessState: CheckboxState;
    accessReadOnly: boolean;
    onSelect: (route: AppRoute) => void;
    onAccessToggle?: (route: AppRoute) => void;
};

const NavRouteLeaf = memo(function NavRouteLeaf({
    route,
    nested,
    active,
    marked,
    accessEnabled,
    accessState,
    accessReadOnly,
    onSelect,
    onAccessToggle,
}: NavRouteLeafProps) {
    const handleSelect = useCallback(() => onSelect(route), [onSelect, route]);
    const handleToggle = useCallback(() => onAccessToggle?.(route), [onAccessToggle, route]);

    if (!accessEnabled) {
        return (
            <button
                type="button"
                title={route.label}
                onClick={handleSelect}
                className={itemClassName({active, marked, nested})}
            >
                <RouteMainContent route={route} active={active} marked={marked} nested={nested} />
            </button>
        );
    }

    return (
        <div className={itemClassName({active, marked, nested, accessEnabled})} title={route.label}>
            <AccessCheckbox
                routeId={route.id}
                label={route.label}
                accessState={accessState}
                readOnly={accessReadOnly}
                onToggle={handleToggle}
            />
            <button type="button" className="nav-item__main" onClick={handleSelect}>
                <RouteMainContent route={route} active={active} marked={marked} nested={nested} />
            </button>
        </div>
    );
});

type NavRouteGroupProps = {
    route: AppRoute;
    selectedRouteId: string | null;
    markedRouteIds?: ReadonlySet<string>;
    expanded: boolean;
    accessEnabled: boolean;
    accessState: CheckboxState;
    accessReadOnly: boolean;
    onToggleExpanded: (routeId: string) => void;
    onSelect: (route: AppRoute) => void;
    onAccessToggle?: (route: AppRoute) => void;
    routeAccessStateById?: ReadonlyMap<string, CheckboxState>;
};

const NavRouteGroup = memo(
    function NavRouteGroup({
        route,
        selectedRouteId,
        markedRouteIds,
        expanded,
        accessEnabled,
        accessState,
        accessReadOnly,
        onToggleExpanded,
        onSelect,
        onAccessToggle,
        routeAccessStateById,
    }: NavRouteGroupProps) {
        const groupActive = routeIsActive(route, selectedRouteId);
        const marked =
            !accessEnabled && !groupActive && (markedRouteIds?.has(route.id) ?? false);
        const handleExpand = useCallback(() => onToggleExpanded(route.id), [onToggleExpanded, route.id]);
        const handleToggle = useCallback(() => onAccessToggle?.(route), [onAccessToggle, route]);

        const chevron = (
            <ChevronRight
                className={clsx(
                    "sidebar-copy size-3.5 shrink-0 text-base-content/30 transition-transform duration-200",
                    expanded && "rotate-90",
                )}
            />
        );

        return (
            <li className="grid gap-0">
                {accessEnabled ? (
                    <div
                        className={itemClassName({
                            active: false,
                            marked,
                            expanded,
                            groupActive,
                            accessEnabled,
                        })}
                        title={route.label}
                    >
                        <AccessCheckbox
                            routeId={route.id}
                            label={route.label}
                            accessState={accessState}
                            readOnly={accessReadOnly}
                            onToggle={handleToggle}
                        />
                        <button
                            type="button"
                            className="nav-item__main"
                            onClick={handleExpand}
                            aria-expanded={expanded}
                        >
                            <RouteMainContent
                                route={route}
                                active={false}
                                marked={marked}
                                chevron={chevron}
                            />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleExpand}
                        aria-expanded={expanded}
                        title={route.label}
                        className={itemClassName({
                            active: false,
                            marked,
                            expanded,
                            groupActive,
                        })}
                    >
                        <RouteMainContent route={route} active={false} marked={marked} chevron={chevron} />
                    </button>
                )}
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
                                        <NavRouteLeaf
                                            route={child}
                                            nested
                                            active={child.id === selectedRouteId}
                                            marked={
                                                !accessEnabled &&
                                                child.id !== selectedRouteId &&
                                                (markedRouteIds?.has(child.id) ?? false)
                                            }
                                            accessEnabled={accessEnabled}
                                            accessState={
                                                routeAccessStateById?.get(child.id) ?? "unchecked"
                                            }
                                            accessReadOnly={accessReadOnly}
                                            onSelect={onSelect}
                                            onAccessToggle={onAccessToggle}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </li>
        );
    },
    (prev, next) => {
        if (prev.route !== next.route) return false;
        if (prev.expanded !== next.expanded) return false;
        if (prev.accessEnabled !== next.accessEnabled) return false;
        if (prev.accessState !== next.accessState) return false;
        if (prev.accessReadOnly !== next.accessReadOnly) return false;
        if (prev.onToggleExpanded !== next.onToggleExpanded) return false;
        if (prev.onSelect !== next.onSelect) return false;
        if (prev.onAccessToggle !== next.onAccessToggle) return false;
        if (prev.routeAccessStateById !== next.routeAccessStateById) return false;
        if (prev.markedRouteIds !== next.markedRouteIds) return false;

        const prevGroupActive = routeIsActive(prev.route, prev.selectedRouteId);
        const nextGroupActive = routeIsActive(next.route, next.selectedRouteId);
        if (prevGroupActive !== nextGroupActive) return false;

        const prevSelectedChild =
            prev.route.children?.some((child) => child.id === prev.selectedRouteId) === true
                ? prev.selectedRouteId
                : null;
        const nextSelectedChild =
            next.route.children?.some((child) => child.id === next.selectedRouteId) === true
                ? next.selectedRouteId
                : null;
        return prevSelectedChild === nextSelectedChild;
    },
);

export type NavRouteTreeProps = {
    sections: NavSection[];
    selectedRouteId?: string | null;
    markedRouteIds?: ReadonlySet<string>;
    onRouteSelect: (_route: AppRoute) => void;
    className?: string;
    embedded?: boolean;
    /** Quando true com handlers, renderiza checkbox dentro do item (cadastro de perfil). */
    showAccessCheckbox?: boolean;
    /** Checkboxes de acesso somente leitura (perfil ADMIN). */
    accessCheckboxesReadOnly?: boolean;
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
    accessCheckboxesReadOnly = false,
    routeAccessStateById,
    onRouteAccessToggle,
}: NavRouteTreeProps) {
    const accessEnabled =
        showAccessCheckbox &&
        Boolean(routeAccessStateById) &&
        (accessCheckboxesReadOnly || Boolean(onRouteAccessToggle));

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
            let changed = false;
            const next = new Set(prev);
            for (const id of parentGroupIdsForRoute(sections, selectedRouteId)) {
                if (!next.has(id)) {
                    next.add(id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [sections, selectedRouteId]);

    const toggleGroup = useCallback((id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

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
                        <ul className="mt-0.5 space-y-0.5 px-1">
                            {section.routes.map((route) => {
                                if (route.children?.length) {
                                    return (
                                        <NavRouteGroup
                                            key={route.id}
                                            route={route}
                                            selectedRouteId={selectedRouteId}
                                            markedRouteIds={markedRouteIds}
                                            expanded={openIds.has(route.id)}
                                            accessEnabled={accessEnabled}
                                            accessState={
                                                routeAccessStateById?.get(route.id) ?? "unchecked"
                                            }
                                            accessReadOnly={accessCheckboxesReadOnly}
                                            onToggleExpanded={toggleGroup}
                                            onSelect={onRouteSelect}
                                            onAccessToggle={onRouteAccessToggle}
                                            routeAccessStateById={routeAccessStateById}
                                        />
                                    );
                                }
                                return (
                                    <li key={route.id}>
                                        <NavRouteLeaf
                                            route={route}
                                            active={route.id === selectedRouteId}
                                            marked={
                                                !accessEnabled &&
                                                route.id !== selectedRouteId &&
                                                (markedRouteIds?.has(route.id) ?? false)
                                            }
                                            accessEnabled={accessEnabled}
                                            accessState={
                                                routeAccessStateById?.get(route.id) ?? "unchecked"
                                            }
                                            accessReadOnly={accessCheckboxesReadOnly}
                                            onSelect={onRouteSelect}
                                            onAccessToggle={onRouteAccessToggle}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </nav>
    );
}
