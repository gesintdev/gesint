"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { DASHBOARD_EASE_OUT } from "@/shared/components/dashboard/dashboard-motion";

/** Painel (card de seção) do dashboard: título, subtítulo, ação à direita e corpo. */
export function DashboardPanel({
    index,
    title,
    subtitle,
    action,
    className,
    children,
}: {
    index: number;
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
    children: ReactNode;
}) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 + index * 0.07, ease: DASHBOARD_EASE_OUT }}
            className={clsx("gesint-dash-panel", className)}
        >
            <header className="gesint-dash-panel__head">
                <div className="min-w-0">
                    <h2 className="gesint-dash-panel__title">{title}</h2>
                    {subtitle ? <p className="gesint-dash-panel__subtitle">{subtitle}</p> : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </header>
            <div className="gesint-dash-panel__body">{children}</div>
        </motion.section>
    );
}
