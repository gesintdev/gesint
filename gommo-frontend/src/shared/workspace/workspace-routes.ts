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
