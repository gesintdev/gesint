"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DOCS_NAV } from "@/docs/nav";
import { GommoLogo } from "@/shared/components/layout/GommoLogo";

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside className="docs-sidebar">
            <div className="docs-sidebar__brand">
                <GommoLogo markSize={26} />
                <div>
                    <div className="docs-sidebar__brand-title">Gommo</div>
                    <div className="docs-sidebar__brand-sub">Docs</div>
                </div>
            </div>

            <nav className="docs-sidebar__nav">
                {DOCS_NAV.map((group) => {
                    const Icon = group.icon;
                    return (
                        <div key={group.key} className="docs-nav-group">
                            <div className="docs-nav-group__label">
                                <Icon size={13} />
                                {group.label}
                            </div>
                            <ul className="docs-nav-group__list">
                                {group.items.map((item) => {
                                    const active =
                                        item.href === "/docs"
                                            ? pathname === "/docs"
                                            : pathname === item.href || pathname.startsWith(`${item.href}/`);
                                    return (
                                        <li key={item.slug}>
                                            <Link
                                                href={item.href}
                                                className={active ? "docs-nav-link is-active" : "docs-nav-link"}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
