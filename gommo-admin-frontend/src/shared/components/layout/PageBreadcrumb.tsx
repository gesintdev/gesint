"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { getBreadcrumbs } from "@/config/breadcrumbs";

type PageBreadcrumbProps = {
    actions?: ReactNode;
    /** Sobrescreve o rótulo do item ativo (ex.: "Editar colaborador") */
    activeLabel?: string;
};

export function PageBreadcrumb({ actions, activeLabel }: PageBreadcrumbProps) {
    const pathname = usePathname();
    const items = getBreadcrumbs(pathname).map((item, index, all) =>
        index === all.length - 1 && activeLabel ? { ...item, label: activeLabel } : item,
    );

    return (
        <motion.header
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="page-breadcrumb flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <nav aria-label="Breadcrumb" className="gommo-breadcrumbs min-w-0 text-sm">
                <ul>
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const content = (
                            <span className="inline-flex min-w-0 max-w-[14rem] items-center gap-1.5 sm:max-w-none">
                                {Icon && (
                                    <Icon
                                        className={clsx(
                                            "size-3.5 shrink-0",
                                            item.isActive ? "text-primary" : "text-base-content/45",
                                        )}
                                        strokeWidth={item.isActive ? 2.25 : 2}
                                        aria-hidden
                                    />
                                )}
                                <span className="truncate">{item.label}</span>
                            </span>
                        );
                        return (
                            <li
                                key={`${index}-${item.label}`}
                                className={clsx(
                                    "inline-flex items-center gap-1.5",
                                    item.isActive && "font-semibold text-primary",
                                )}
                                aria-current={item.isActive ? "page" : undefined}
                            >
                                {index > 0 ? (
                                    <span className="gommo-breadcrumb-sep" aria-hidden>
                                        /
                                    </span>
                                ) : null}
                                {item.isActive || !item.href ? (
                                    <span className="inline-flex min-w-0">{content}</span>
                                ) : (
                                    <Link href={item.href} className="gommo-breadcrumb-link inline-flex min-w-0">
                                        {content}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </motion.header>
    );
}
