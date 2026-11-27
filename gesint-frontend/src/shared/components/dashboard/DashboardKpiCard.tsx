"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Activity, CircleAlert, TrendingUp } from "lucide-react";

import { AnimatedNumber } from "@/shared/components/dashboard/AnimatedNumber";
import { DASHBOARD_EASE_OUT } from "@/shared/components/dashboard/dashboard-motion";

export type DashboardKpiTone = "success" | "warning" | "neutral";

const TONE_ICONS: Record<DashboardKpiTone, LucideIcon> = {
    success: TrendingUp,
    warning: CircleAlert,
    neutral: Activity,
};

/**
 * KPI do dashboard. Com `onClick` vira botão (o número abre a lista de quem está por trás dele).
 */
export function DashboardKpiCard({
    label,
    value,
    hint,
    tone,
    icon: Icon,
    index,
    format,
    onClick,
}: {
    label: string;
    value: number;
    hint: string;
    tone: DashboardKpiTone;
    icon: LucideIcon;
    index: number;
    format?: (_value: number) => string;
    onClick?: () => void;
}) {
    const ToneIcon = TONE_ICONS[tone];
    const content = (
        <>
            <div className="flex items-start justify-between gap-3">
                <p className="gesint-dash-kpi__label">{label}</p>
                <span className="gesint-dash-kpi__icon">
                    <Icon className="size-4" strokeWidth={2} />
                </span>
            </div>
            <p className="gesint-dash-kpi__value">
                <AnimatedNumber value={value} format={format} />
            </p>
            <p className="gesint-dash-kpi__hint">
                <span className="gesint-dash-kpi__tone">
                    <ToneIcon className="size-3" strokeWidth={2.5} />
                </span>
                <span className="truncate" title={hint}>
                    {hint}
                </span>
            </p>
        </>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: DASHBOARD_EASE_OUT }}
            className="gesint-dash-kpi"
            data-tone={tone}
            data-interactive={onClick ? true : undefined}
        >
            {onClick ? (
                <button type="button" className="gesint-dash-kpi__button" onClick={onClick} aria-label={`${label}: ver lista`}>
                    {content}
                </button>
            ) : (
                content
            )}
        </motion.div>
    );
}
