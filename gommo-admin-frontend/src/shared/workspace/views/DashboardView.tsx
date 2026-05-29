"use client";

import type {CSSProperties} from "react";
import {useQuery} from "@tanstack/react-query";
import clsx from "clsx";
import {
    ArrowUpRight,
    ClipboardList,
    LayoutDashboard,
    Palmtree,
    RefreshCw,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {dashboardKeys} from "@/modules/dashboard/dashboard.query";
import type {
    DashboardDistributionItem,
    DashboardMetric,
    DashboardMetricTone,
    DashboardMovementPoint,
    DashboardSummary,
} from "@/modules/dashboard/dto/dashboard.dto";
import {DASHBOARD_CLIENT_MESSAGES} from "@/modules/dashboard/exceptions/dashboard.messages";
import {dashboardService} from "@/modules/dashboard/services/dashboard.service";
import {CrudPageCard, CrudPageLayout} from "@/shared/components/layout/CrudPageLayout";
import {Button} from "@/shared/components/ui/Button";
import {Card} from "@/shared/components/ui/Card";
import {ExceptionCapture} from "@/shared/exceptions";

const METRIC_ICONS: Record<string, LucideIcon> = {
    collaborators: Users,
    contracts: LayoutDashboard,
    payroll: Wallet,
    leave: Palmtree,
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

function toneClass(tone: DashboardMetricTone): string {
    if (tone === "success") return "text-success";
    if (tone === "warning") return "text-warning";
    return "text-base-content/45";
}

function formatMetricValue(value: number): string {
    return numberFormatter.format(value);
}

function maxTotal(items: Array<{total?: number; value?: number}>): number {
    const values = items.map((item) => item.total ?? item.value ?? 0);
    return Math.max(1, ...values);
}

function MetricsSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({length: 4}).map((_, index) => (
                <Card key={index} animate={false} bodyClassName="!p-5">
                    <div className="skeleton-shimmer h-24 w-full rounded-[10px]"/>
                </Card>
            ))}
        </div>
    );
}

function MetricCard({metric, index}: {metric: DashboardMetric; index: number}) {
    const Icon = METRIC_ICONS[metric.key] ?? ClipboardList;

    return (
        <Card delay={index * 0.05} animate={false} bodyClassName="!p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-base-content/45">{metric.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                        {formatMetricValue(metric.value)}
                    </p>
                    <p className={clsx("mt-2 inline-flex items-center gap-1 text-xs font-semibold", toneClass(metric.tone))}>
                        {metric.tone === "success" && <TrendingUp className="size-3.5"/>}
                        {metric.hint}
                    </p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                    <Icon className="size-5" strokeWidth={1.75}/>
                </span>
            </div>
        </Card>
    );
}

function MovementChart({points}: {points: DashboardMovementPoint[]}) {
    const peak = maxTotal(points);

    return (
        <div className="flex h-48 items-end justify-between gap-2 px-1">
            {points.map((point) => {
                const height = point.total === 0 ? 4 : Math.max(8, Math.round((point.total / peak) * 100));
                return (
                    <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <span className="text-[11px] font-semibold tabular-nums text-base-content/45">
                            {point.total > 0 ? formatMetricValue(point.total) : "—"}
                        </span>
                        <div
                            className="w-full max-w-10 rounded-t-[10px] bg-primary transition-all duration-500"
                            style={{height: `${height}%`}}
                            title={`${point.label}: ${formatMetricValue(point.total)}`}
                        />
                        <span className="text-[11px] font-medium capitalize text-base-content/45">{point.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function DistributionChart({
    title,
    subtitle,
    items,
    emptyMessage,
}: {
    title: string;
    subtitle: string;
    items: DashboardDistributionItem[];
    emptyMessage: string;
}) {
    const peak = maxTotal(items);
    const hasData = items.some((item) => item.value > 0);

    return (
        <Card animate={false} title={title} subtitle={subtitle} bodyClassName="!pt-4">
            {!hasData ? (
                <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-base-content/45">
                    {emptyMessage}
                </div>
            ) : (
                <div className="space-y-3 px-1">
                    {items.map((item) => {
                        const width = item.value === 0 ? 0 : Math.max(6, Math.round((item.value / peak) * 100));
                        return (
                            <div key={item.key} className="space-y-1.5">
                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className="font-medium text-base-content/65">{item.label}</span>
                                    <span className="font-bold tabular-nums">{formatMetricValue(item.value)}</span>
                                </div>
                                <div className="h-2 rounded-full bg-base-content/8">
                                    <div
                                        className="h-2 rounded-full bg-primary transition-all duration-500"
                                        style={{width: `${width}%`}}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

function ModuleHealthPanel({moduleHealth}: {moduleHealth: DashboardSummary["moduleHealth"]}) {
    return (
        <Card animate={false} className="xl:col-span-4" title="Saúde do sistema" subtitle="Módulos com dados">
            <div className="flex flex-col items-center gap-5">
                <div
                    className="gommo-progress-ring"
                    style={{"--progress": moduleHealth.progressPercent} as CSSProperties}
                    role="progressbar"
                    aria-valuenow={moduleHealth.progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <span className="gommo-progress-ring__value">{moduleHealth.progressPercent}</span>
                </div>
                <div className="w-full space-y-3">
                    <div className="flex items-center justify-between rounded-[10px] bg-primary/8 px-3 py-2.5 text-xs">
                        <span className="font-medium text-base-content/60">Módulos com registros</span>
                        <span className="font-bold tabular-nums">
                            {moduleHealth.activeModules}/{moduleHealth.totalModules}
                        </span>
                    </div>
                    <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                        {moduleHealth.modules.map((module) => (
                            <div
                                key={module.key}
                                className="flex items-center justify-between rounded-[10px] border border-[var(--gommo-border-subtle)] px-3 py-2 text-xs"
                            >
                                <span className="font-medium text-base-content/65">{module.label}</span>
                                <span
                                    className={clsx(
                                        "font-bold tabular-nums",
                                        module.active ? "text-primary" : "text-base-content/35",
                                    )}
                                >
                                    {module.active ? formatMetricValue(module.records) : "—"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between rounded-[10px] border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs">
                        <span className="font-medium text-base-content/70">Cobertura operacional</span>
                        <span className="inline-flex items-center gap-0.5 font-bold text-primary">
                            {moduleHealth.progressPercent >= 70 ? "Alta" : moduleHealth.progressPercent >= 35 ? "Parcial" : "Inicial"}
                            <ArrowUpRight className="size-3.5"/>
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function DashboardContent({data}: {data: DashboardSummary}) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {data.metrics.map((metric, index) => (
                    <MetricCard key={metric.key} metric={metric} index={index}/>
                ))}
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-12">
                <Card
                    animate={false}
                    className="xl:col-span-8"
                    title="Movimentação"
                    subtitle="Novos registros nos últimos 7 dias"
                    bodyClassName="!pt-4"
                >
                    <MovementChart points={data.movementLast7Days}/>
                </Card>

                <ModuleHealthPanel moduleHealth={data.moduleHealth}/>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <DistributionChart
                    title="Admissões por status"
                    subtitle="Distribuição atual"
                    items={data.admissionsByStatus}
                    emptyMessage="Nenhuma admissão cadastrada ainda."
                />
                <DistributionChart
                    title="Férias e afastamentos"
                    subtitle="Solicitações por tipo"
                    items={data.leaveByType}
                    emptyMessage="Nenhuma solicitação de férias ou afastamento cadastrada."
                />
            </div>
        </>
    );
}

export function DashboardView() {
    const summaryQuery = useQuery({
        queryKey: dashboardKeys.summary,
        queryFn: () => dashboardService.getSummary(),
    });

    return (
        <CrudPageLayout>
            <CrudPageCard>
                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex shrink-0 items-center justify-end gap-2 border-b border-[var(--gommo-border-subtle)] px-4 py-2.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Atualizar dashboard"
                        leftIcon={
                            <RefreshCw
                                className={clsx("size-3.5", summaryQuery.isFetching && "animate-spin")}
                                strokeWidth={2.25}
                            />
                        }
                        disabled={summaryQuery.isFetching}
                        onClick={() => summaryQuery.refetch()}
                    >
                        Atualizar
                    </Button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                    {summaryQuery.isLoading && <MetricsSkeleton/>}

                    {summaryQuery.isError && (
                        <Card animate={false} bodyClassName="!p-6">
                            <p className="text-sm font-medium text-error">
                                {ExceptionCapture.displayMessage(
                                    summaryQuery.error,
                                    DASHBOARD_CLIENT_MESSAGES.DASHBOARD_LOAD_FAILED,
                                )}
                            </p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => summaryQuery.refetch()}>
                                Tentar novamente
                            </Button>
                        </Card>
                    )}

                    {summaryQuery.data && <DashboardContent data={summaryQuery.data}/>}
                </div>
                </div>
            </CrudPageCard>
        </CrudPageLayout>
    );
}
