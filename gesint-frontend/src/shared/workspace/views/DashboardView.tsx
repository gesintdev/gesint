"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { motion, MotionConfig } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    ArrowUpRight,
    BarChart3,
    Briefcase,
    Building2,
    CircleCheck,
    ClipboardList,
    Clock,
    FileText,
    Gift,
    LayoutDashboard,
    Network,
    Palmtree,
    Receipt,
    TriangleAlert,
    UserMinus,
    UserPlus,
    Users,
    Wallet,
} from "lucide-react";

import { TimeDashboardView } from "@/modules/gp/dashboard/components/TimeDashboardView";
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
import { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { AnimatedNumber } from "@/shared/components/dashboard/AnimatedNumber";
import { DashboardEmptyState } from "@/shared/components/dashboard/DashboardEmptyState";
import { DashboardHeader } from "@/shared/components/dashboard/DashboardHeader";
import { DashboardKpiCard } from "@/shared/components/dashboard/DashboardKpiCard";
import { DashboardPanel } from "@/shared/components/dashboard/DashboardPanel";
import { DashboardStats } from "@/shared/components/dashboard/DashboardStats";
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

function MovementStats({ points }: { points: DashboardMovementPoint[] }) {
    const total = points.reduce((sum, point) => sum + point.total, 0);
    const peak = points.reduce<DashboardMovementPoint | null>(
        (best, point) => (best === null || point.total > best.total ? point : best),
        null,
    );
    const today = points.at(-1)?.total ?? 0;
    return (
        <DashboardStats
            stats={[
                { label: "Total no período", value: total, format: formatNumber },
                {
                    label: "Média por dia",
                    value: points.length ? total / points.length : 0,
                    format: decimalFormatter.format,
                },
                {
                    label: "Dia de pico",
                    value: peak?.total ?? 0,
                    format: formatNumber,
                    suffix: peak && peak.total > 0 ? peak.label : null,
                },
                { label: "Hoje", value: today, format: formatNumber },
            ]}
        />
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
                        <DashboardEmptyState icon={BarChart3} message="Nenhum registro novo nos últimos 7 dias" />
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
        <DashboardPanel
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
        </DashboardPanel>
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
        <DashboardPanel
            index={index}
            title="Registros por módulo"
            subtitle={`${formatNumber(total)} registros no total`}
            className={className}
        >
            {total === 0 ? (
                <DashboardEmptyState message="Nenhum registro cadastrado nos módulos." />
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
        </DashboardPanel>
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
        <DashboardPanel index={index} title={title} subtitle={`${subtitle} · ${formatNumber(total)} ${unit}`}>
            {total === 0 ? (
                <DashboardEmptyState message={emptyMessage} />
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
        </DashboardPanel>
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
        <DashboardPanel index={index} title={title} subtitle={subtitle}>
            {total === 0 ? (
                <DashboardEmptyState message={emptyMessage} />
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
        </DashboardPanel>
    );
}

function DashboardContent({ data, showPeopleCharts }: { data: DashboardSummary; showPeopleCharts: boolean }) {
    const tiles = kpiTiles(data);

    return (
        <>
            {tiles.length > 0 ? (
                <div className="gesint-dash-kpis">
                    {tiles.map((tile, index) => (
                        <DashboardKpiCard
                            key={tile.key}
                            label={tile.label}
                            value={tile.value}
                            hint={tile.hint}
                            tone={tile.tone}
                            icon={tile.icon}
                            index={index}
                        />
                    ))}
                </div>
            ) : null}
            <div className="grid gap-4 xl:grid-cols-12">
                <DashboardPanel
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
                </DashboardPanel>
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
        // Gestão de Ponto tem painel próprio (situação do dia e limites da CLT).
        enabled: activeSystem !== SystemEnum.PONTO,
    });
    if (activeSystem === SystemEnum.PONTO) {
        return <TimeDashboardView />;
    }
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
                                meta={
                                    dashboardData
                                        ? `${dashboardData.moduleHealth.totalModules} ${dashboardData.moduleHealth.totalModules === 1 ? "módulo acompanhado" : "módulos acompanhados"}`
                                        : null
                                }
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
