import { BookOpen, Rocket, type LucideIcon } from "lucide-react";

export type DocsNavItem = {
    slug: string;
    href: string;
    label: string;
};

export type DocsNavGroup = {
    key: string;
    label: string;
    icon: LucideIcon;
    items: DocsNavItem[];
};

export const DOCS_NAV: DocsNavGroup[] = [
    {
        key: "start",
        label: "Começando",
        icon: BookOpen,
        items: [{ slug: "index", href: "/docs", label: "Visão geral" }],
    },
    {
        key: "clients",
        label: "Ambiente",
        icon: Rocket,
        items: [
            {
                slug: "provision-environment",
                href: "/docs/provision-environment",
                label: "Provisionar ambiente",
            },
        ],
    },
];

export function slugifyHeading(title: string): string {
    return title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
