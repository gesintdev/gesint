"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { animate, motion, MotionConfig, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    Briefcase,
    Building2,
    CircleAlert,
    CircleCheck,
    ClipboardList,
    Clock,
    FileText,
    Gift,
    Inbox,
    LayoutDashboard,
    Network,
    Palmtree,
    Receipt,
    RefreshCw,
    TrendingUp,
    TriangleAlert,
    UserMinus,
    UserPlus,
    Users,
    Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { dashboardKeys } from "@/modules/rh/dashboard/dashboard.query";
import type {
    DashboardDistributionItem,
    DashboardMetricTone,
    DashboardModuleStatus,
    DashboardMovementPoint,
    DashboardSummary,
} from "@/modules/rh/dashboard/dto/dashboard.dto";
import { DASHBOARD_CLIENT_MESSAGES } from "@/modules/rh/dashboard/exceptions/dashboard.messages";
import type { DashboardSystemId } from "@/modules/rh/dashboard/lib/dashboard-system.util";
import {
    dashboardTitleForSystem,
    filterDashboardSummaryForSystem,
} from "@/modules/rh/dashboard/lib/dashboard-system.util";
import { dashboardService } from "@/modules/rh/dashboard/services/dashboard.service";
import { CrudPageCard, CrudPageLayout } from "@/shared/components/layout/CrudPageLayout";
import { Button } from "@/shared/components/ui/Button";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";
import { ExceptionCapture } from "@/shared/exceptions";

const METRIC_ICONS: Record<string, LucideIcon> = {
    collaborators: Users,
    contracts: LayoutDashboard,
    payroll: Wallet,
    leave: Palmtree,
};
const MODULE_ICONS: Record<string, LucideIcon> = {
    collaborator: Users,
    admission: UserPlus,
    contract: FileText,
    leave: Palmtree,
    attendance: Clock,
    payment: Wallet,
    payroll: Wallet,
    payslip: Receipt,
    benefit: Gift,
    company: Building2,
    department: Network,
    jobposition: Briefcase,
    offboarding: UserMinus,
};
const TONE_ICONS: Record<DashboardMetricTone, LucideIcon> = {
    success: TrendingUp,
    warning: CircleAlert,
    neutral: Activity,
};
/** Paleta categorica das distribuicoes — somente tokens do design system. */
const DISTRIBUTION_COLORS = [
    "var(--color-primary)",
    "var(--color-warning)",
    "var(--color-success)",
    "var(--color-error)",
    "var(--gesint-primary-300)",
    "color-mix(in srgb, var(--color-base-content) 30%, transparent)",
];
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CHART_INTERVALS = 4;
const KPI_FALLBACK_LIMIT = 4;
const LEGEND_FULL_LIMIT = 6;
const numberFormatter = new Intl.NumberFormat("pt-BR");
const decimalFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const percentFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

type KpiTile = {
    key: string;
    label: string;
    value: number;
    hint: string;
    tone: DashboardMetricTone;
    icon: LucideIcon;
};

function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

function percentOf(value: number, total: number): string {
    return `${percentFormatter.format(total === 0 ? 0 : (value / total) * 100)}%`;
}

/** Teto do eixo Y multiplo do numero de intervalos, para ticks inteiros. */
function chartCeiling(peak: number): number {
    return Math.max(CHART_INTERVALS, Math.ceil(peak / CHART_INTERVALS) * CHART_INTERVALS);
}

function distributionColor(index: number): string {
    return DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length];
}

/** Sem metricas no sistema (DP/CTB): os KPIs mostram os registros dos modulos acompanhados. */
function kpiTiles(data: DashboardSummary): KpiTile[] {
    if (data.metrics.length > 0) {
        return data.metrics.map((metric) => ({
            ...metric,
            icon: METRIC_ICONS[metric.key] ?? ClipboardList,
        }));
    }
    return data.moduleHealth.modules.slice(0, KPI_FALLBACK_LIMIT).map((module) => ({
        key: module.key,
        label: module.label,
        value: module.records,
        hint: module.active ? "Registros cadastrados" : "Sem registros ainda",
        tone: module.active ? "success" : "neutral",
        icon: MODULE_ICONS[module.key] ?? ClipboardList,
    }));
}

function AnimatedNumber({ value, format = formatNumber }: { value: number; format?: (_value: number) => string }) {
    const reduceMotion = useReducedMotion();
    const [display, setDisplay] = useState(0);
    const current = useRef(0);

    useEffect(() => {
        if (reduceMotion) return;
        const controls = animate(current.current, value, {
            duration: 1,
            ease: EASE_OUT,
            onUpdate: (latest) => {
                current.current = latest;
                setDisplay(latest);
            },
        });
        return () => controls.stop();
    }, [value, reduceMotion]);

    const shown = reduceMotion ? value : display;
    return <>{format(Number.isInteger(value) ? Math.round(shown) : shown)}</>;
}

function Panel({
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
            transition={{ duration: 0.5, delay: 0.08 + index * 0.07, ease: EASE_OUT }}
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

function EmptyState({ icon: Icon = Inbox, message }: { icon?: LucideIcon; message: string }) {
    return (
        <div className="gesint-dash-empty">
            <span className="gesint-dash-empty__icon">
                <Icon className="size-4" strokeWidth={2} />
            </span>
            <p>{message}</p>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-5">
            <div className="gesint-dash-kpis">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="gesint-dash-kpi">
                        <div className="skeleton-stack !gap-3.5">
                            <div className="flex items-center justify-between">
                                <div className="skeleton-shimmer h-3 w-28" />
                                <div className="skeleton-shimmer size-9" />
                            </div>
                            <div className="skeleton-shimmer h-8 w-20" />
                            <div className="skeleton-shimmer h-3 w-36" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-12">
                <div className="gesint-dash-panel p-5 xl:col-span-8">
                    <div className="skeleton-stack !gap-4">
                        <div className="skeleton-shimmer h-4 w-36" />
                        <div className="skeleton-shimmer h-16 w-full" />
                        <div className="skeleton-shimmer h-56 w-full" />
                    </div>
                </div>
                <div className="gesint-dash-panel p-5 xl:col-span-4">
                    <div className="skeleton-stack !gap-4">
                        <div className="skeleton-shimmer h-4 w-32" />
                        <div className="skeleton-shimmer size-28 rounded-full" />
                        <div className="skeleton-shimmer h-24 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardHeader({
    title,
    updatedAt,
    moduleCount,
    isFetching,
    onRefresh,
}: {
    title: string;
    updatedAt: number;
    moduleCount: number | null;
    isFetching: boolean;
    onRefresh: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="flex flex-wrap items-center justify-between gap-4"
        >
            <div className="min-w-0">
                <h1 className="gesint-dash-title">{title}</h1>
                <p className="gesint-dash-subtitle">
                    {updatedAt > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                            <span className={clsx("gesint-dash-live", isFetching && "gesint-dash-live--busy")} />
                            Atualizado às {timeFormatter.format(updatedAt)}
                        </span>
                    ) : (
                        "Carregando indicadores"
                    )}
                    {moduleCount !== null ? (
                        <>
                            <span className="text-base-content/25">·</span>
                            {moduleCount} {moduleCount === 1 ? "módulo acompanhado" : "módulos acompanhados"}
                        </>
                    ) : null}
                </p>
            </div>
            <Button
                variant="primary"
                size="sm"
                aria-label="Atualizar dashboard"
                leftIcon={<RefreshCw className={clsx("size-3.5", isFetching && "animate-spin")} strokeWidth={2.25} />}
                disabled={isFetching}
                onClick={onRefresh}
            >
                Atualizar
            </Button>
        </motion.div>
    );
}

function KpiCard({ tile, index }: { tile: KpiTile; index: number }) {
    const Icon = tile.icon;
    const ToneIcon = TONE_ICONS[tile.tone];

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: EASE_OUT }}
            className="gesint-dash-kpi"
            data-tone={tile.tone}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="gesint-dash-kpi__label">{tile.label}</p>
                <span className="gesint-dash-kpi__icon">
                    <Icon className="size-4" strokeWidth={2} />
                </span>
            </div>
            <p className="gesint-dash-kpi__value">
                <AnimatedNumber value={tile.value} />
            </p>
            <p className="gesint-dash-kpi__hint">
                <span className="gesint-dash-kpi__tone">
                    <ToneIcon className="size-3" strokeWidth={2.5} />
                </span>
                <span className="truncate">{tile.hint}</span>
            </p>
        </motion.div>
    );
}

function MovementStats({ points }: { points: DashboardMovementPoint[] }) {
    const total = points.reduce((sum, point) => sum + point.total, 0);
    const peak = points.reduce<DashboardMovementPoint | null>(
        (best, point) => (best === null || point.total > best.total ? point : best),
        null,
    );
    const today = points.at(-1)?.total ?? 0;
    const stats = [
        { label: "Total no período", value: total, format: formatNumber },
        { label: "Média por dia", value: points.length ? total / points.length : 0, format: decimalFormatter.format },
        {
            label: "Dia de pico",
            value: peak?.total ?? 0,
            format: formatNumber,
            suffix: peak && peak.total > 0 ? peak.label : null,
        },
        { label: "Hoje", value: today, format: formatNumber },
    ];

    return (
        <div className="gesint-dash-stats">
            {stats.map((stat) => (
                <div key={stat.label} className="gesint-dash-stats__item">
                    <p className="gesint-dash-stats__label">{stat.label}</p>
                    <p className="gesint-dash-stats__value">
                        <AnimatedNumber value={stat.value} format={stat.format} />
                        {stat.suffix ? <span className="gesint-dash-stats__suffix">{stat.suffix}</span> : null}
                    </p>
                </div>
            ))}
        </div>
    );
}

function MovementChart({ points }: { points: DashboardMovementPoint[] }) {
    const peak = Math.max(0, ...points.map((point) => point.total));
    const ceiling = chartCeiling(peak);
    const ticks = Array.from(
        { length: CHART_INTERVALS + 1 },
        (_, i) => (ceiling / CHART_INTERVALS) * (CHART_INTERVALS - i),
    );
    const lastIndex = points.length - 1;

    return (
        <div className="gesint-dash-chart">
            <div className="gesint-dash-chart__axis" aria-hidden>
                {ticks.map((tick) => (
                    <span key={tick}>{formatNumber(tick)}</span>
                ))}
            </div>
            <div className="gesint-dash-chart__plot">
                <div className="gesint-dash-chart__grid" aria-hidden>
                    {ticks.map((tick) => (
                        <span key={tick} />
                    ))}
                </div>
                {peak === 0 ? (
                    <div className="gesint-dash-chart__empty">
                        <EmptyState icon={BarChart3} message="Nenhum registro novo nos últimos 7 dias" />
                    </div>
                ) : null}
                <div className="gesint-dash-chart__columns">
                    {points.map((point, index) => (
                        <div
                            key={point.date}
                            className="gesint-dash-chart__column"
                            data-current={index === lastIndex || undefined}
                            title={`${point.label}: ${formatNumber(point.total)}`}
                        >
                            <div className="gesint-dash-chart__track">
                                {point.total > 0 ? (
                                    <motion.div
                                        className="gesint-dash-chart__bar"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(point.total / ceiling) * 100}%` }}
                                        transition={{ duration: 0.7, delay: 0.25 + index * 0.06, ease: EASE_OUT }}
                                    >
                                        <span className="gesint-dash-chart__tooltip">{formatNumber(point.total)}</span>
                                    </motion.div>
                                ) : null}
                            </div>
                            <span className="gesint-dash-chart__label">
                                {index === lastIndex ? "Hoje" : point.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProgressRing({ percent }: { percent: number }) {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;

    return (
        <div
            className="gesint-dash-ring"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <svg viewBox="0 0 104 104" className="size-full -rotate-90" aria-hidden>
                <circle cx="52" cy="52" r={radius} className="gesint-dash-ring__track" />
                <motion.circle
                    cx="52"
                    cy="52"
                    r={radius}
                    className="gesint-dash-ring__bar"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference * (1 - percent / 100) }}
                    transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT }}
                />
            </svg>
            <span className="gesint-dash-ring__value">
                <AnimatedNumber value={percent} />
                <small>%</small>
            </span>
        </div>
    );
}

function ModuleHealthPanel({ moduleHealth, index }: { moduleHealth: DashboardSummary["moduleHealth"]; index: number }) {
    const coverage =
        moduleHealth.progressPercent >= 70 ? "Alta" : moduleHealth.progressPercent >= 35 ? "Parcial" : "Inicial";
    const inactive = moduleHealth.totalModules - moduleHealth.activeModules;

    return (
        <Panel
            index={index}
            title="Saúde do sistema"
            subtitle="Módulos com dados"
            className="xl:col-span-4"
            action={
                <span className="gesint-dash-pill" data-tone="primary">
                    {coverage}
                    <ArrowUpRight className="size-3" strokeWidth={2.5} />
                </span>
            }
        >
            <div className="flex h-full flex-col gap-6">
                <div className="flex items-center gap-6">
                    <ProgressRing percent={moduleHealth.progressPercent} />
                    <div className="min-w-0 space-y-4">
                        <div>
                            <p className="gesint-dash-stats__label">Módulos com registros</p>
                            <p className="gesint-dash-kpi__value !mt-1.5 !text-[1.625rem]">
                                {moduleHealth.activeModules}
                                <span className="text-base font-medium text-base-content/35">
                                    /{moduleHealth.totalModules}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="gesint-dash-stats__label">Cobertura operacional</p>
                            <p className="mt-1 text-[13px] font-semibold text-base-content">{coverage}</p>
                        </div>
                    </div>
                </div>
                <ul className="gesint-dash-chips">
                    {moduleHealth.modules.map((healthModule, moduleIndex) => {
                        const Icon = MODULE_ICONS[healthModule.key] ?? ClipboardList;
                        return (
                            <motion.li
                                key={healthModule.key}
                                className="gesint-dash-chip"
                                data-active={healthModule.active || undefined}
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.35, delay: 0.35 + moduleIndex * 0.04, ease: EASE_OUT }}
                            >
                                <Icon className="size-3.5 shrink-0" strokeWidth={2} />
                                <span className="truncate">{healthModule.label}</span>
                            </motion.li>
                        );
                    })}
                </ul>
                <div className="mt-auto space-y-3">
                    <div className="gesint-dash-segments" aria-hidden>
                        {moduleHealth.modules.map((healthModule, moduleIndex) => (
                            <motion.span
                                key={healthModule.key}
                                data-active={healthModule.active || undefined}
                                initial={{ opacity: 0, scaleY: 0.3 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                transition={{ duration: 0.4, delay: 0.4 + moduleIndex * 0.05, ease: EASE_OUT }}
                                title={healthModule.label}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-base-content/55">
                        <span className="inline-flex items-center gap-1.5">
                            <CircleCheck className="size-3.5 text-success" strokeWidth={2.25} />
                            {moduleHealth.activeModules} com dados
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-base-content/20" />
                            {inactive} sem dados
                        </span>
                    </div>
                </div>
            </div>
        </Panel>
    );
}

function ModuleRecordsPanel({
    modules,
    index,
    className,
    wide = false,
}: {
    modules: DashboardModuleStatus[];
    index: number;
    className?: string;
    wide?: boolean;
}) {
    const sorted = [...modules].sort((a, b) => b.records - a.records);
    const peak = Math.max(1, ...sorted.map((module) => module.records));
    const total = sorted.reduce((sum, module) => sum + module.records, 0);

    return (
        <Panel
            index={index}
            title="Registros por módulo"
            subtitle={`${formatNumber(total)} registros no total`}
            className={className}
        >
            {total === 0 ? (
                <EmptyState message="Nenhum registro cadastrado nos módulos." />
            ) : (
                <ul className={clsx("gesint-dash-hbars", wide && "gesint-dash-hbars--wide")}>
                    {sorted.map((module, moduleIndex) => {
                        const Icon = MODULE_ICONS[module.key] ?? ClipboardList;
                        return (
                            <li key={module.key} className="gesint-dash-hbars__row">
                                <span className="gesint-dash-hbars__label">
                                    <Icon className="size-3.5 shrink-0 text-base-content/40" strokeWidth={2} />
                                    <span className="truncate">{module.label}</span>
                                </span>
                                <span className="gesint-dash-hbars__track">
                                    <motion.span
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(module.records / peak) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 + moduleIndex * 0.05, ease: EASE_OUT }}
                                    />
                                </span>
                                <span className="gesint-dash-hbars__value">{formatNumber(module.records)}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Panel>
    );
}

/** Catalogos longos (ex.: tipos de afastamento): legenda so com o que tem valor, maior primeiro. */
function legendItems(items: DashboardDistributionItem[]): {
    visible: DashboardDistributionItem[];
    hiddenCount: number;
} {
    if (items.length <= LEGEND_FULL_LIMIT) return { visible: items, hiddenCount: 0 };
    const visible = items.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
    return { visible, hiddenCount: items.length - visible.length };
}

function DistributionLegend({
    items,
    total,
    hiddenCount,
    hiddenLabel,
}: {
    items: DashboardDistributionItem[];
    total: number;
    hiddenCount: number;
    hiddenLabel: string;
}) {
    return (
        <ul className="gesint-dash-legend">
            {items.map((item, index) => (
                <li key={item.key} className="gesint-dash-legend__row" data-empty={item.value === 0 || undefined}>
                    <span className="flex min-w-0 items-center gap-2.5">
                        <span className="gesint-dash-legend__dot" style={{ background: distributionColor(index) }} />
                        <span className="truncate">{item.label}</span>
                    </span>
                    <span className="flex items-center gap-4">
                        <span className="gesint-dash-legend__value">{formatNumber(item.value)}</span>
                        <span className="gesint-dash-legend__percent">{percentOf(item.value, total)}</span>
                    </span>
                </li>
            ))}
            {hiddenCount > 0 ? (
                <li className="gesint-dash-legend__more">
                    +{hiddenCount} {hiddenLabel}
                </li>
            ) : null}
        </ul>
    );
}

function StackedDistributionPanel({
    index,
    title,
    subtitle,
    unit,
    items,
    emptyMessage,
}: {
    index: number;
    title: string;
    subtitle: string;
    unit: string;
    items: DashboardDistributionItem[];
    emptyMessage: string;
}) {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const { visible, hiddenCount } = legendItems(items);

    return (
        <Panel index={index} title={title} subtitle={`${subtitle} · ${formatNumber(total)} ${unit}`}>
            {total === 0 ? (
                <EmptyState message={emptyMessage} />
            ) : (
                <div className="space-y-5">
                    <div className="gesint-dash-stack" aria-hidden>
                        {visible.map((item, itemIndex) =>
                            item.value > 0 ? (
                                <motion.span
                                    key={item.key}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.value / total) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 + itemIndex * 0.06, ease: EASE_OUT }}
                                    style={{ background: distributionColor(itemIndex) }}
                                />
                            ) : null,
                        )}
                    </div>
                    <DistributionLegend
                        items={visible}
                        total={total}
                        hiddenCount={hiddenCount}
                        hiddenLabel="sem registros"
                    />
                </div>
            )}
        </Panel>
    );
}

function DonutDistributionPanel({
    index,
    title,
    subtitle,
    unit,
    items,
    emptyMessage,
}: {
    index: number;
    title: string;
    subtitle: string;
    unit: string;
    items: DashboardDistributionItem[];
    emptyMessage: string;
}) {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const { visible, hiddenCount } = legendItems(items);
    const filled = visible.filter((item) => item.value > 0).length;
    const gap = filled > 1 ? 3 : 0;
    const slices = visible.map((item, itemIndex) => {
        const start = visible.slice(0, itemIndex).reduce((sum, previous) => sum + previous.value, 0);
        const length = total === 0 ? 0 : (item.value / total) * circumference;
        return {
            item,
            itemIndex,
            dash: Math.max(0, length - gap),
            offset: total === 0 ? 0 : -(start / total) * circumference,
        };
    });

    return (
        <Panel index={index} title={title} subtitle={subtitle}>
            {total === 0 ? (
                <EmptyState message={emptyMessage} />
            ) : (
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                    <div className="gesint-dash-donut">
                        <svg viewBox="0 0 104 104" className="size-full -rotate-90" aria-hidden>
                            <circle cx="52" cy="52" r={radius} className="gesint-dash-donut__track" />
                            {slices.map(({ item, itemIndex, dash, offset }) =>
                                item.value > 0 ? (
                                    <motion.circle
                                        key={item.key}
                                        cx="52"
                                        cy="52"
                                        r={radius}
                                        className="gesint-dash-donut__slice"
                                        stroke={distributionColor(itemIndex)}
                                        strokeDashoffset={offset}
                                        initial={{ strokeDasharray: `0 ${circumference}` }}
                                        animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
                                        transition={{ duration: 0.9, delay: 0.3 + itemIndex * 0.08, ease: EASE_OUT }}
                                    />
                                ) : null,
                            )}
                        </svg>
                        <span className="gesint-dash-donut__center">
                            <strong>
                                <AnimatedNumber value={total} />
                            </strong>
                            <small>{unit}</small>
                        </span>
                    </div>
                    <div className="w-full min-w-0 flex-1">
                        <DistributionLegend
                            items={visible}
                            total={total}
                            hiddenCount={hiddenCount}
                            hiddenLabel={hiddenCount === 1 ? "tipo sem solicitações" : "tipos sem solicitações"}
                        />
                    </div>
                </div>
            )}
        </Panel>
    );
}

function DashboardContent({ data, showPeopleCharts }: { data: DashboardSummary; showPeopleCharts: boolean }) {
    const tiles = kpiTiles(data);

    return (
        <>
            {tiles.length > 0 ? (
                <div className="gesint-dash-kpis">
                    {tiles.map((tile, index) => (
                        <KpiCard key={tile.key} tile={tile} index={index} />
                    ))}
                </div>
            ) : null}
            <div className="grid gap-4 xl:grid-cols-12">
                <Panel
                    index={1}
                    title="Movimentação"
                    subtitle="Novos registros nos últimos 7 dias"
                    className="xl:col-span-8"
                    action={
                        <span className="inline-flex items-center gap-1.5 text-xs text-base-content/55">
                            <span className="size-2 rounded-[2px] bg-primary" />
                            Registros
                        </span>
                    }
                >
                    <div className="space-y-5">
                        <MovementStats points={data.movementLast7Days} />
                        <MovementChart points={data.movementLast7Days} />
                    </div>
                </Panel>
                <ModuleHealthPanel moduleHealth={data.moduleHealth} index={2} />
            </div>
            {showPeopleCharts ? (
                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                    <StackedDistributionPanel
                        index={3}
                        title="Admissões por status"
                        subtitle="Distribuição atual"
                        unit="processos"
                        items={data.admissionsByStatus}
                        emptyMessage="Nenhuma admissão cadastrada ainda."
                    />
                    <DonutDistributionPanel
                        index={4}
                        title="Férias e afastamentos"
                        subtitle="Solicitações por tipo"
                        unit="solicitações"
                        items={data.leaveByType}
                        emptyMessage="Nenhuma solicitação de férias ou afastamento cadastrada."
                    />
                    <ModuleRecordsPanel
                        modules={data.moduleHealth.modules}
                        index={5}
                        className="lg:col-span-2 2xl:col-span-1"
                    />
                </div>
            ) : (
                <ModuleRecordsPanel modules={data.moduleHealth.modules} index={3} wide />
            )}
        </>
    );
}

export function DashboardView() {
    const { activeSystem } = useActiveSystem();
    const summaryQuery = useQuery({
        queryKey: dashboardKeys.summary(activeSystem),
        queryFn: () => dashboardService.getSummary(),
    });
    const dashboardData = summaryQuery.data
        ? filterDashboardSummaryForSystem(summaryQuery.data, activeSystem as DashboardSystemId)
        : null;

    return (
        <CrudPageLayout>
            <CrudPageCard>
                <MotionConfig reducedMotion="user">
                    <div className="gesint-dash min-h-0 flex-1 overflow-y-auto">
                        <div className="gesint-dash__inner">
                            <DashboardHeader
                                title={dashboardTitleForSystem(activeSystem)}
                                updatedAt={summaryQuery.dataUpdatedAt}
                                moduleCount={dashboardData ? dashboardData.moduleHealth.totalModules : null}
                                isFetching={summaryQuery.isFetching}
                                onRefresh={() => summaryQuery.refetch()}
                            />
                            {summaryQuery.isLoading && <DashboardSkeleton />}
                            {summaryQuery.isError && (
                                <div className="gesint-dash-panel p-6">
                                    <div className="flex items-start gap-4">
                                        <span className="gesint-dash-empty__icon" data-tone="error">
                                            <TriangleAlert className="size-4" strokeWidth={2} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-base-content">
                                                Não foi possível carregar o painel
                                            </p>
                                            <p className="mt-1 text-[13px] text-base-content/60">
                                                {ExceptionCapture.displayMessage(
                                                    summaryQuery.error,
                                                    DASHBOARD_CLIENT_MESSAGES.DASHBOARD_LOAD_FAILED,
                                                )}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => summaryQuery.refetch()}
                                            >
                                                Tentar novamente
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {dashboardData ? (
                                <DashboardContent data={dashboardData} showPeopleCharts={activeSystem === "rh"} />
                            ) : null}
                        </div>
                    </div>
                </MotionConfig>
            </CrudPageCard>
        </CrudPageLayout>
    );
}
