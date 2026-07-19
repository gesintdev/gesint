import { Boxes, Building2, type LucideIcon, Users } from "lucide-react";

export type AdminMenuKey = "clients" | "systems" | "users";

export type AdminMenuDef = {
    key: AdminMenuKey;
    label: string;
    href: string;
    listHref: string;
    icon: LucideIcon;
    subTabs?: { key: string; label: string }[];
};

export const CLIENT_SUB_TABS = [
    { key: "basics", label: "Dados Básicos" },
    { key: "environment", label: "Config. do Ambiente" },
    { key: "systems", label: "Sistemas Contratados" },
    { key: "users", label: "Usuários" },
] as const;

export type ClientSubTabKey = (typeof CLIENT_SUB_TABS)[number]["key"];

export const ADMIN_MENUS: AdminMenuDef[] = [
    {
        key: "clients",
        label: "Clientes",
        href: "/clients",
        listHref: "/clients/list",
        icon: Building2,
        subTabs: [...CLIENT_SUB_TABS],
    },
    {
        key: "systems",
        label: "Sistemas",
        href: "/systems",
        listHref: "/systems/list",
        icon: Boxes,
    },
    {
        key: "users",
        label: "Usuários",
        href: "/users",
        listHref: "/users/list",
        icon: Users,
    },
];

export function getAdminMenu(key: AdminMenuKey): AdminMenuDef {
    return ADMIN_MENUS.find((menu) => menu.key === key)!;
}

export function clientsListPath() {
    return "/clients/list";
}

export function clientsFormPath(id: string | number, subTab: ClientSubTabKey = "basics") {
    return `/clients/form/${id}/${subTab}`;
}

export function systemsListPath() {
    return "/systems/list";
}

export function systemsFormPath(id: string | number) {
    return `/systems/form/${id}`;
}

export function usersListPath() {
    return "/users/list";
}

export function usersFormPath(id: string | number) {
    return `/users/form/${id}`;
}

export type AdminRouteState =
    | {
          menu: AdminMenuDef;
          view: "list";
          recordId?: undefined;
          subTab?: undefined;
      }
    | {
          menu: AdminMenuDef;
          view: "form";
          recordId: string;
          subTab?: string;
      };

export type AdminBreadcrumbItem = {
    label: string;
    href?: string;
    icon?: LucideIcon;
};

export function parseAdminPathname(pathname: string): AdminRouteState | null {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;

    const menu = ADMIN_MENUS.find((item) => item.key === parts[0] || item.href === `/${parts[0]}`);
    if (!menu) return null;

    if (parts.length === 1 || parts[1] === "list") {
        return { menu, view: "list" };
    }

    if (parts[1] === "form") {
        const recordId = parts[2];
        if (!recordId) {
            return { menu, view: "list" };
        }
        const subTab = parts[3];
        return { menu, view: "form", recordId, subTab };
    }

    return { menu, view: "list" };
}

export function buildAdminBreadcrumb(pathname: string): AdminBreadcrumbItem[] {
    const state = parseAdminPathname(pathname);
    if (!state) return [];

    const crumbs: AdminBreadcrumbItem[] = [
        {
            label: state.menu.label,
            href: state.menu.listHref,
            icon: state.menu.icon,
        },
    ];

    if (state.view === "list") {
        crumbs.push({ label: "Listagem" });
        return crumbs;
    }

    const formHref =
        state.menu.key === "clients"
            ? clientsFormPath(state.recordId, "basics")
            : state.menu.key === "systems"
              ? systemsFormPath(state.recordId)
              : usersFormPath(state.recordId);

    crumbs.push({
        label: "Cadastro",
        href: formHref,
    });

    if (state.menu.key === "clients") {
        const subKey = isClientSubTab(state.subTab) ? state.subTab : "basics";
        const sub = CLIENT_SUB_TABS.find((item) => item.key === subKey);
        crumbs.push({ label: sub?.label ?? "Dados Básicos" });
    }

    return crumbs;
}

export function isClientSubTab(value: string | undefined): value is ClientSubTabKey {
    return CLIENT_SUB_TABS.some((tab) => tab.key === value);
}
