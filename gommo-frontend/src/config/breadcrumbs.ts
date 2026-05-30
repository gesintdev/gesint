import type { LucideIcon } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { APP_ROUTES, ALL_NAV_SECTIONS } from "@/config/routes";

export type BreadcrumbItem = {
    label: string;
    href?: string;
    icon?: LucideIcon;
    isActive: boolean;
};

function firstNavigableHref(routes: AppRoute[]): string | undefined {
    for (const route of routes) {
        if (route.href) return route.href;
        if (route.children) {
            const childHref = firstNavigableHref(route.children);
            if (childHref) return childHref;
        }
    }
    return undefined;
}

function findRouteChain(
    pathname: string,
    routes: AppRoute[],
    ancestors: AppRoute[] = [],
): AppRoute[] | null {
    for (const route of routes) {
        if (route.href === pathname) {
            return [...ancestors, route];
        }
        if (route.children?.length) {
            const nested = findRouteChain(pathname, route.children, [...ancestors, route]);
            if (nested) return nested;
        }
    }
    return null;
}

function resolveHref(route: AppRoute, isActive: boolean): string | undefined {
    if (isActive) return undefined;
    if (route.href) return route.href;
    if (route.children?.length) return firstNavigableHref(route.children);
    return undefined;
}

function chainToItems(chain: AppRoute[]): BreadcrumbItem[] {
    return chain.map((route, index) => {
        const isActive = index === chain.length - 1;
        return {
            label: route.label,
            href: resolveHref(route, isActive),
            icon: route.icon,
            isActive,
        };
    });
}

/**
 * Monta o trail de breadcrumb a partir do pathname e das rotas do sidebar.
 */
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const normalized = pathname.split("?")[0].replace(/\/$/, "") || "/";

    for (const section of ALL_NAV_SECTIONS) {
        const chain = findRouteChain(normalized, section.routes);
        if (!chain) continue;

        const sectionHref = firstNavigableHref(section.routes);
        const items: BreadcrumbItem[] = [
            {
                label: section.label,
                href: sectionHref,
                isActive: false,
            },
            ...chainToItems(chain),
        ];

        return items;
    }

    const fallback = APP_ROUTES.find((r) => r.href === normalized);
    if (fallback) {
        return [
            {
                label: fallback.label,
                href: undefined,
                icon: fallback.icon,
                isActive: true,
            },
        ];
    }

    return [{ label: "Página", isActive: true }];
}
