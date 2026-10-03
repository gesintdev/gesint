import { APP_ROUTES, type AppRoute, flattenRoutes } from "@/config/routes";

const FLAT_ROUTES = flattenRoutes(APP_ROUTES);

export function findRouteByHref(href: string): AppRoute | undefined {
    return FLAT_ROUTES.find((r) => r.href === href);
}

export function findRouteById(routeId: string): AppRoute | undefined {
    return FLAT_ROUTES.find((r) => r.id === routeId);
}

export function defaultShortLabel(routeLabel: string): string {
    const first = routeLabel.trim().split(/\s+/)[0] ?? routeLabel;
    return first.length > 12 ? `${first.slice(0, 10)}…` : first;
}

function collectGroupShortLabels(routes: AppRoute[], groupLabel: string | undefined, acc: Map<string, string>) {
    for (const route of routes) {
        if (route.children?.length) {
            collectGroupShortLabels(
                route.children,
                route.tabShortLabel ?? defaultShortLabel(route.label),
                acc,
            );
        } else if (groupLabel) {
            acc.set(route.id, groupLabel);
        }
    }
    return acc;
}

const GROUP_SHORT_LABEL_BY_ROUTE_ID = collectGroupShortLabels(APP_ROUTES, undefined, new Map());

/** Abreviação do grupo de menu (lista) ao qual a rota pertence, se houver. */
export function findRouteGroupShortLabel(routeId: string): string | undefined {
    return GROUP_SHORT_LABEL_BY_ROUTE_ID.get(routeId);
}
