"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type CardProps = {
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
    delay?: number;
    title?: string;
    subtitle?: string;
    headerAction?: ReactNode;
    /** Enables a subtle lift on hover — good for interactive/clickable cards */
    hoverable?: boolean;
    /** Animação de entrada (desligar em CRUD/workspace para evitar jump). */
    animate?: boolean;
};

export function Card({
    children,
    className,
    bodyClassName,
    delay = 0,
    title,
    subtitle,
    headerAction,
    hoverable = false,
    animate = true,
}: CardProps) {
    const surfaceClass = clsx(
        "surface-card overflow-hidden",
        hoverable && "surface-card--hover cursor-pointer",
        className,
    );
    const inner = (
        <>
            {(title || subtitle || headerAction) && (
                <div className="flex items-center justify-between gap-3 border-b border-[var(--gommo-border-subtle)] px-4 py-3 md:px-5">
                    <div className="min-w-0 flex-1">
                        {title && (
                            <h3 className="truncate text-[13px] font-semibold tracking-tight text-base-content">
                                {title}
                            </h3>
                        )}
                        {subtitle && <p className="mt-0.5 text-[11px] text-base-content/45">{subtitle}</p>}
                    </div>
                    {headerAction && <div className="shrink-0">{headerAction}</div>}
                </div>
            )}
            <div className={clsx("p-4 md:p-5", bodyClassName)}>{children}</div>
        </>
    );

    if (!animate) {
        return <div className={surfaceClass}>{inner}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, delay, ease: [0.22, 1, 0.36, 1] }}
            className={surfaceClass}
        >
            {inner}
        </motion.div>
    );
}
