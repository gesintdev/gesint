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
    { key: "dados", label: "Dados Básicos" },
    { key: "config", label: "Config. do Ambiente" },
    { key: "sistemas", label: "Sistemas Contratados" },
    { key: "usuarios", label: "Usuários" },
] as const;

export type ClientSubTabKey = (typeof CLIENT_SUB_TABS)[number]["key"];

export const ADMIN_MENUS: AdminMenuDef[] = [
    {
        key: "clients",
        label: "Clientes",
        href: "/clients",
        listHref: "/clients/listagem",
        icon: Building2,
        subTabs: [...CLIENT_SUB_TABS],
    },
    {
        key: "systems",
        label: "Sistemas",
        href: "/systems",
        listHref: "/systems/listagem",
        icon: Boxes,
    },
    {
        key: "users",
        label: "Usuários",
        href: "/users",
        listHref: "/users/listagem",
        icon: Users,
    },
];

export function getAdminMenu(key: AdminMenuKey): AdminMenuDef {
    return ADMIN_MENUS.find((menu) => menu.key === key)!;
}

export function clientsListPath() {
    return "/clients/listagem";
}

export function clientsCadastroPath(id: string | number, subTab: ClientSubTabKey = "dados") {
    return `/clients/cadastro/${id}/${subTab}`;
}

export function systemsListPath() {
    return "/systems/listagem";
}

export function systemsCadastroPath(id: string | number) {
    return `/systems/cadastro/${id}`;
}

export function usersListPath() {
    return "/users/listagem";
}

export function usersCadastroPath(id: string | number) {
    return `/users/cadastro/${id}`;
}

export type AdminRouteState =
    | {
          menu: AdminMenuDef;
          view: "listagem";
          recordId?: undefined;
          subTab?: undefined;
      }
    | {
          menu: AdminMenuDef;
          view: "cadastro";
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

    if (parts.length === 1 || parts[1] === "listagem") {
        return { menu, view: "listagem" };
    }

    if (parts[1] === "cadastro") {
        const recordId = parts[2];
        if (!recordId) {
            return { menu, view: "listagem" };
        }
        const subTab = parts[3];
        return { menu, view: "cadastro", recordId, subTab };
    }

    return { menu, view: "listagem" };
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

    if (state.view === "listagem") {
        crumbs.push({ label: "Listagem" });
        return crumbs;
    }

    const cadastroHref =
        state.menu.key === "clients"
            ? clientsCadastroPath(state.recordId, "dados")
            : state.menu.key === "systems"
              ? systemsCadastroPath(state.recordId)
              : usersCadastroPath(state.recordId);

    crumbs.push({
        label: "Cadastro",
        href: cadastroHref,
    });

    if (state.menu.key === "clients") {
        const subKey = isClientSubTab(state.subTab) ? state.subTab : "dados";
        const sub = CLIENT_SUB_TABS.find((item) => item.key === subKey);
        crumbs.push({ label: sub?.label ?? "Dados Básicos" });
    }

    return crumbs;
}

export function isClientSubTab(value: string | undefined): value is ClientSubTabKey {
    return CLIENT_SUB_TABS.some((tab) => tab.key === value);
}
