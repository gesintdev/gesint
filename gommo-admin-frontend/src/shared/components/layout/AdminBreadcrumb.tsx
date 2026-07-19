"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { useAdminPathname } from "@/shared/hooks/useAdminPathname";
import { buildAdminBreadcrumb } from "@/shared/routing/admin-nav";

export function AdminBreadcrumb() {
    const pathname = useAdminPathname();
    const crumbs = buildAdminBreadcrumb(pathname);

    if (crumbs.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                const Icon = crumb.icon;

                return (
                    <div key={`${crumb.label}-${index}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {index > 0 ? (
                            <ChevronRight size={13} style={{ color: "var(--ga-text-subtle)", flexShrink: 0 }} />
                        ) : null}

                        {crumb.href && !isLast ? (
                            <Link
                                href={crumb.href}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    textDecoration: "none",
                                    color: "var(--ga-text-muted)",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {Icon ? <Icon size={14} /> : null}
                                {crumb.label}
                            </Link>
                        ) : (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    color: isLast ? "var(--ga-text)" : "var(--ga-text-muted)",
                                    fontSize: 12,
                                    fontWeight: isLast ? 600 : 500,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {Icon ? <Icon size={14} color="var(--ga-primary)" /> : null}
                                {crumb.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
