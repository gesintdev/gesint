"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, MotionConfig } from "framer-motion";
import {
    AlarmClock,
    BarChart3,
    CalendarOff,
    CircleCheck,
    Clock,
    Coffee,
    ListChecks,
    Timer,
    TriangleAlert,
    UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AttendancePeriodDateFilters } from "@/modules/gp/attendance/components/AttendancePeriodDateFilters";
import { currentMonthBounds, normalizePeriod } from "@/modules/gp/attendance/lib/attendance-period.util";
import { useOpenAttendanceHistory } from "@/modules/gp/attendance/lib/useOpenAttendanceHistory";
import { AbsenceCalendarBoard } from "@/modules/gp/calendar/components/AbsenceCalendarBoard";
import type { TimeDashboard, TimeStatusMetric } from "@/modules/gp/shared/dto/time-management.dto";
import { REQUEST_TYPE_LABELS, STATUS_METRICS } from "@/modules/gp/shared/lib/time-labels";
import { writeTimeStatusFocus } from "@/modules/gp/shared/lib/time-status-focus";
import { timeManagementService } from "@/modules/gp/shared/services/time-management.service";
import { timeManagementKeys } from "@/modules/gp/shared/time-management.query";
import { DASHBOARD_EASE_OUT } from "@/shared/components/dashboard/dashboard-motion";
import { DashboardEmptyState } from "@/shared/components/dashboard/DashboardEmptyState";
import { DashboardHeader } from "@/shared/components/dashboard/DashboardHeader";
import { DashboardKpiCard } from "@/shared/components/dashboard/DashboardKpiCard";
import { DashboardPanel } from "@/shared/components/dashboard/DashboardPanel";
import { DashboardStats } from "@/shared/components/dashboard/DashboardStats";
import { CrudPageCard, CrudPageLayout } from "@/shared/components/layout/CrudPageLayout";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";
import { formatBalance, formatDuration } from "@/shared/lib/time/duration-format";
import { useWorkspaceLink } from "@/shared/workspace/WorkspaceLink";

const percentFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function parseIsoDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function DashboardSkeleton() {
    return (
        <div className="space-y-5">
            <div className="gesint-dash-kpis">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="gesint-dash-kpi">
                        <div className="skeleton-stack !gap-3.5">
                            <div className="skeleton-shimmer h-3 w-28" />
                            <div className="skeleton-shimmer h-8 w-20" />
                            <div className="skeleton-shimmer h-3 w-36" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="gesint-dash-panel p-5">
                        <div className="skeleton-stack !gap-4">
                            <div className="skeleton-shimmer h-4 w-32" />
                            <div className="skeleton-shimmer h-20 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Jornada do período: barra = horas trabalhadas no dia; marca = jornada prevista. */
function WorkedHoursChart({ points }: { points: TimeDashboard["daily"] }) {
    const peakMinutes = Math.max(0, ...points.map((point) => Math.max(point.workedMinutes, point.expectedMinutes)));
    const ceilingHours = Math.max(4, Math.ceil(peakMinutes / 60 / 4) * 4);
    const ticks = Array.from({ length: 5 }, (_, index) => (ceilingHours / 4) * (4 - index));
    const labelEvery = points.length > 16 ? Math.ceil(points.length / 10) : 1;

    if (peakMinutes === 0) {
        return <DashboardEmptyState icon={BarChart3} message="Nenhuma jornada registrada no período." />;
    }

    return (
        <div className="gesint-dash-chart gesint-time-chart">
            <div className="gesint-dash-chart__axis" aria-hidden>
                {ticks.map((tick) => (
                    <span key={tick}>{tick}h</span>
                ))}
            </div>
            <div className="gesint-dash-chart__plot">
                <div className="gesint-dash-chart__grid" aria-hidden>
                    {ticks.map((tick) => (
                        <span key={tick} />
                    ))}
                </div>
                <div className="gesint-dash-chart__columns">
                    {points.map((point, index) => {
                        const workedPct = (point.workedMinutes / 60 / ceilingHours) * 100;
                        const expectedPct = (point.expectedMinutes / 60 / ceilingHours) * 100;
                        const label = dayFormatter.format(parseIsoDate(point.date));
                        return (
                            <div
                                key={point.date}
                                className="gesint-dash-chart__column"
                                title={`${label}: ${formatDuration(point.workedMinutes)} trabalhadas · previsto ${formatDuration(point.expectedMinutes)}${point.absences ? ` · ${point.absences} sem registro/falta` : ""}`}
                            >
                                <div className="gesint-dash-chart__track">
                                    {point.expectedMinutes > 0 ? (
                                        <span className="gesint-time-chart__expected" style={{ bottom: `${expectedPct}%` }} />
                                    ) : null}
                                    {point.workedMinutes > 0 ? (
                                        <motion.div
                                            className="gesint-dash-chart__bar"
                                            data-over={point.workedMinutes > point.expectedMinutes || undefined}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${workedPct}%` }}
                                            transition={{ duration: 0.6, delay: 0.2 + index * 0.015, ease: DASHBOARD_EASE_OUT }}
                                        />
                                    ) : null}
                                </div>
                                <span className="gesint-dash-chart__label">
                                    {index % labelEvery === 0 ? label.slice(0, 2) : ""}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function TimeDashboardView() {
    const { navigate } = useWorkspaceLink();
    const [dateFrom, setDateFrom] = useState(() => currentMonthBounds().from);
    const [dateTo, setDateTo] = useState(() => currentMonthBounds().to);
    const period = useMemo(() => normalizePeriod(dateFrom, dateTo), [dateFrom, dateTo]);
    const queryKey = useBranchScopedQueryKey(timeManagementKeys.dashboard(period.from, period.to));
    const query = useQuery({
        queryKey,
        queryFn: () => timeManagementService.dashboard(period.from, period.to),
        refetchInterval: 120_000,
    });
    const data = query.data;

    const openStatus = (metric: TimeStatusMetric) => {
        writeTimeStatusFocus({ metric, from: period.from, to: period.to });
        navigate("/attendance/status");
    };

    const openAttendanceHistory = useOpenAttendanceHistory();
    const openCollaborator = (collaboratorId: string, collaboratorName: string) =>
        openAttendanceHistory({ collaboratorId, collaboratorName });

    return (
        <CrudPageLayout>
            <CrudPageCard>
                <MotionConfig reducedMotion="user">
                    <div className="gesint-dash min-h-0 flex-1 overflow-y-auto">
                        <div className="gesint-dash__inner">
                            <DashboardHeader
                                title="Painel Gestão de Ponto"
                                updatedAt={query.dataUpdatedAt}
                                isFetching={query.isFetching}
                                onRefresh={() => query.refetch()}
                                meta={
                                    data
                                        ? `${data.rosterSize} ${data.rosterSize === 1 ? "colaborador no quadro" : "colaboradores no quadro"}`
                                        : null
                                }
                                actions={
                                    <AttendancePeriodDateFilters
                                        dateFrom={dateFrom}
                                        dateTo={dateTo}
                                        onDateFromChange={setDateFrom}
                                        onDateToChange={setDateTo}
                                    />
                                }
                            />
                            {query.isLoading ? <DashboardSkeleton /> : null}
                            {query.isError ? (
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
                                                {ExceptionCapture.displayMessage(query.error, "Tente novamente em instantes.")}
                                            </p>
                                            <Button variant="outline" size="sm" className="mt-4" onClick={() => query.refetch()}>
                                                Tentar novamente
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            {data ? (
                                <DashboardBody
                                    data={data}
                                    onOpenStatus={openStatus}
                                    onOpenCollaborator={openCollaborator}
                                    onOpenRequests={() => navigate("/attendance/requests")}
                                    onOpenHourBank={() => navigate("/attendance/hour-bank")}
                                />
                            ) : null}
                        </div>
                    </div>
                </MotionConfig>
            </CrudPageCard>
        </CrudPageLayout>
    );
}

function DashboardBody({
    data,
    onOpenStatus,
    onOpenCollaborator,
    onOpenRequests,
    onOpenHourBank,
}: {
    data: TimeDashboard;
    onOpenStatus: (_metric: TimeStatusMetric) => void;
    onOpenCollaborator: (_collaboratorId: string, _collaboratorName: string) => void;
    onOpenRequests: () => void;
    onOpenHourBank: () => void;
}) {
    const { now, limits, hourBank } = data;
    const hint = (metric: TimeStatusMetric) => STATUS_METRICS[metric].help;
    const stat = (metric: TimeStatusMetric, label: string, value: number, format?: (_v: number) => string) => ({
        label,
        value,
        format,
        help: hint(metric),
        onClick: () => onOpenStatus(metric),
    });

    return (
        <>
            <div className="gesint-dash-kpis">
                <DashboardKpiCard
                    index={0}
                    label="Trabalhando agora"
                    value={now.working}
                    icon={UserRound}
                    tone="success"
                    hint={
                        now.onBreak > 0
                            ? `${now.onBreak} em intervalo · ${now.expectedToday} com jornada hoje`
                            : `${now.expectedToday} com jornada hoje`
                    }
                    onClick={() => onOpenStatus("WORKING")}
                />
                <DashboardKpiCard
                    index={1}
                    label="Atrasados"
                    value={now.late}
                    icon={AlarmClock}
                    tone={now.late > 0 ? "warning" : "success"}
                    hint={now.late > 0 ? hint("LATE") : "Ninguém atrasado até agora"}
                    onClick={() => onOpenStatus("LATE")}
                />
                <DashboardKpiCard
                    index={2}
                    label="Em hora extra"
                    value={now.inOvertime}
                    icon={Timer}
                    tone={now.inOvertime > 0 ? "warning" : "neutral"}
                    hint={hint("IN_OVERTIME")}
                    onClick={() => onOpenStatus("IN_OVERTIME")}
                />
                <DashboardKpiCard
                    index={3}
                    label="Ausentes hoje"
                    value={now.away}
                    icon={CalendarOff}
                    tone="neutral"
                    hint={now.earlyLeave > 0 ? `${now.earlyLeave} com saída antecipada` : hint("AWAY")}
                    onClick={() => onOpenStatus("AWAY")}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                <DashboardPanel
                    index={0}
                    title="Horas extras"
                    subtitle="Horas além da jornada e o limite diário da CLT (art. 59)"
                >
                    <DashboardStats
                        stats={[
                            stat("OVERTIME", "Além da jornada", limits.overtimeMinutes, formatDuration),
                            stat("OVER_10_HOURS", "Dias acima de 10h", limits.over10HoursDays),
                            stat("OVERTIME_OVER_2_HOURS", "Dias com +2h extras", limits.overtimeOver2HoursDays),
                        ]}
                    />
                </DashboardPanel>
                <DashboardPanel index={1} title="Intervalo" subtitle="Pausa mínima de 1 hora em jornadas acima de 6h (art. 71)">
                    <DashboardStats
                        stats={[
                            stat("SHORT_BREAK", "Menos de 1h", limits.shortBreakDays),
                            stat("NO_BREAK", "Sem intervalo", limits.noBreakDays),
                            stat("OVER_6_HOURS_WITHOUT_BREAK", "6h seguidas", limits.over6HoursWithoutBreakDays),
                        ]}
                    />
                </DashboardPanel>
                <DashboardPanel
                    index={2}
                    title="Escala"
                    subtitle="Descanso entre jornadas (art. 66), faltas e marcações"
                    className="lg:col-span-2 2xl:col-span-1"
                >
                    <DashboardStats
                        stats={[
                            stat("SHORT_INTERJOURNEY", "Interjornada < 11h", limits.shortInterjourneyDays),
                            stat("ABSENTEEISM", "Absenteísmo", limits.absenteeismPercent, (v) => `${percentFormatter.format(v)}%`),
                            stat("MISSING_DAYS", "Dias sem registro", limits.missingDays),
                            stat("INCOMPLETE_DAYS", "Incompletos", limits.incompleteDays),
                        ]}
                    />
                </DashboardPanel>
            </div>

            <div className="grid gap-4 xl:grid-cols-12">
                <DashboardPanel
                    index={3}
                    className="xl:col-span-8"
                    title="Ajustes pendentes"
                    subtitle="Solicitações dos últimos 90 dias aguardando decisão"
                    action={
                        data.pendingRequestsTotal > 0 ? (
                            <Button variant="outline" size="sm" leftIcon={<ListChecks className="size-3.5" />} onClick={onOpenRequests}>
                                Abrir fila ({data.pendingRequestsTotal})
                            </Button>
                        ) : null
                    }
                >
                    {data.pendingRequests.length === 0 ? (
                        <DashboardEmptyState icon={CircleCheck} tone="success" message="Tudo em dia: nenhum ajuste aguardando decisão." />
                    ) : (
                        <ul className="gesint-time-list">
                            {data.pendingRequests.map((request) => (
                                <li key={request.id} className="gesint-time-list__item">
                                    <div className="min-w-0">
                                        <p className="gesint-time-list__title">{request.collaboratorName ?? "Colaborador"}</p>
                                        <p className="gesint-time-list__meta">
                                            {REQUEST_TYPE_LABELS[request.requestType ?? ""] ?? "Ajuste"}
                                            {request.workDate ? ` · ${dayFormatter.format(parseIsoDate(request.workDate))}` : ""}
                                            {request.notes ? ` · ${request.notes}` : ""}
                                        </p>
                                    </div>
                                    <span className="gesint-badge gesint-badge--warning">Pendente</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </DashboardPanel>
                <DashboardPanel
                    index={4}
                    className="xl:col-span-4"
                    title="Banco de horas"
                    subtitle={data.hourBankEnabled ? "Saldo acumulado até o fim do período" : "A empresa não usa banco de horas"}
                    action={
                        data.hourBankEnabled ? (
                            <Button variant="ghost" size="sm" onClick={onOpenHourBank}>
                                Ver saldos
                            </Button>
                        ) : null
                    }
                >
                    {data.hourBankEnabled ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="gesint-time-balance-tile" data-tone="positive">
                                <p className="gesint-time-balance-tile__label">Saldo positivo</p>
                                <p className="gesint-balance gesint-balance--positive gesint-time-balance-tile__value">
                                    {formatBalance(hourBank.positiveMinutes)}
                                </p>
                                <p className="gesint-time-balance-tile__hint">
                                    {hourBank.collaboratorsPositive} {hourBank.collaboratorsPositive === 1 ? "pessoa" : "pessoas"}
                                </p>
                            </div>
                            <div className="gesint-time-balance-tile" data-tone="negative">
                                <p className="gesint-time-balance-tile__label">Saldo negativo</p>
                                <p className="gesint-balance gesint-balance--negative gesint-time-balance-tile__value">
                                    {formatBalance(hourBank.negativeMinutes)}
                                </p>
                                <p className="gesint-time-balance-tile__hint">
                                    {hourBank.collaboratorsNegative} {hourBank.collaboratorsNegative === 1 ? "pessoa" : "pessoas"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <DashboardEmptyState
                            icon={Clock}
                            message="Ative o banco de horas em Gestão de Ponto › Preferências para acompanhar saldos."
                        />
                    )}
                </DashboardPanel>
            </div>

            <div className="grid gap-4 xl:grid-cols-12">
                <DashboardPanel
                    index={5}
                    className="xl:col-span-8"
                    title="Jornada no período"
                    subtitle="Horas trabalhadas por dia; a marca mostra a jornada prevista pela escala"
                >
                    <WorkedHoursChart points={data.daily} />
                </DashboardPanel>
                <DashboardPanel
                    index={6}
                    className="xl:col-span-4"
                    title="Quem pede atenção"
                    subtitle="Mais pendências e limites estourados no período"
                >
                    {data.attention.length === 0 ? (
                        <DashboardEmptyState icon={CircleCheck} tone="success" message="Ninguém com pendência no período." />
                    ) : (
                        <ul className="gesint-time-list">
                            {data.attention.map((row) => (
                                <li key={row.collaboratorId}>
                                    <button
                                        type="button"
                                        className="gesint-time-list__item gesint-time-list__item--button"
                                        onClick={() => onOpenCollaborator(row.collaboratorId, row.collaboratorName)}
                                    >
                                        <div className="min-w-0 text-left">
                                            <p className="gesint-time-list__title">{row.collaboratorName}</p>
                                            <p className="gesint-time-list__meta">
                                                {row.pendingDays > 0
                                                    ? `${row.pendingDays} ${row.pendingDays === 1 ? "pendência" : "pendências"}`
                                                    : "Sem pendências"}
                                                {row.alerts > 0 ? ` · ${row.alerts} ${row.alerts === 1 ? "alerta" : "alertas"}` : ""}
                                            </p>
                                        </div>
                                        {data.hourBankEnabled ? (
                                            <span
                                                className={`gesint-balance gesint-balance--${row.hourBankMinutes > 0 ? "positive" : row.hourBankMinutes < 0 ? "negative" : "zero"}`}
                                            >
                                                {formatBalance(row.hourBankMinutes)}
                                            </span>
                                        ) : (
                                            <Coffee className="size-4 text-base-content/30" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </DashboardPanel>
            </div>

            <DashboardPanel
                index={7}
                title="Agenda de ausências"
                subtitle="Férias, afastamentos e faltas aprovados no RH e no DP"
            >
                <AbsenceCalendarBoard maxPerDay={3} />
            </DashboardPanel>
        </>
    );
}

export default TimeDashboardView;
