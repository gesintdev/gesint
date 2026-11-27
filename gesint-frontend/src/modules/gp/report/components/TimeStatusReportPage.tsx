"use client";

import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AttendancePeriodDateFilters } from "@/modules/gp/attendance/components/AttendancePeriodDateFilters";
import { currentMonthBounds, normalizePeriod } from "@/modules/gp/attendance/lib/attendance-period.util";
import { durationColumn, GP_COLLABORATOR_COLUMN } from "@/modules/gp/shared/config/time-table-columns";
import type { TimeStatusMetric, TimeStatusRow } from "@/modules/gp/shared/dto/time-management.dto";
import { PERIOD_METRICS, STATUS_METRICS, TODAY_METRICS } from "@/modules/gp/shared/lib/time-labels";
import {
    takeTimeStatusFocus,
    TIME_STATUS_FOCUS_EVENT,
    type TimeStatusFocus,
} from "@/modules/gp/shared/lib/time-status-focus";
import { timeManagementService } from "@/modules/gp/shared/services/time-management.service";
import { timeManagementKeys } from "@/modules/gp/shared/time-management.query";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";
import { CrudTabList } from "@/shared/components/ui/CrudTabList";
import { InputSelect } from "@/shared/components/ui/input";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

type View = "TODAY" | "PERIOD";

type Row = TimeStatusRow & { clockInText: string; clockOutText: string; percentValue?: number | null };

function hm(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}

function columnsFor(metric: TimeStatusMetric): TableColumnConfig[] {
    const info = STATUS_METRICS[metric];
    const value = info.valueLabel ? [durationColumn("minutes", info.valueLabel)] : [];
    if (info.grain === "COLLABORATOR") {
        return [
            GP_COLLABORATOR_COLUMN,
            { id: "departmentName", columnName: "Departamento", fieldValue: "departmentName", dataType: TableDataType.TEXT },
            ...value,
            durationColumn("expectedMinutes", "Jornada prevista"),
            {
                id: "days",
                columnName: metric === "ABSENTEEISM" ? "Dias de falta" : "Dias",
                fieldValue: "days",
                dataType: TableDataType.INTEGER,
                notFilterable: true,
            },
            ...(metric === "ABSENTEEISM"
                ? [
                      {
                          id: "percentValue",
                          columnName: "Absenteísmo",
                          fieldValue: "percentValue",
                          dataType: TableDataType.PERCENT,
                          notFilterable: true,
                      } satisfies TableColumnConfig,
                  ]
                : []),
        ];
    }
    return [
        GP_COLLABORATOR_COLUMN,
        ...(info.view === "PERIOD"
            ? [{ id: "date", columnName: "Dia", fieldValue: "date", dataType: TableDataType.DATE, notFilterable: true } satisfies TableColumnConfig]
            : []),
        { id: "clockInText", columnName: "Entrada", fieldValue: "clockInText", dataType: TableDataType.TEXT, notFilterable: true },
        { id: "clockOutText", columnName: "Saída", fieldValue: "clockOutText", dataType: TableDataType.TEXT, notFilterable: true },
        ...value,
    ];
}

const metricItems = (metrics: TimeStatusMetric[]) =>
    metrics.map((metric) => ({ value: metric, label: STATUS_METRICS[metric].label }));

/** Relatório "Status dos colaboradores": cada número do painel vira a lista de quem está por trás. */
export function TimeStatusReportPage() {
    const [view, setView] = useState<View>("TODAY");
    const [todayMetric, setTodayMetric] = useState<TimeStatusMetric>("WORKING");
    const [periodMetric, setPeriodMetric] = useState<TimeStatusMetric>("ABSENTEEISM");
    const [dateFrom, setDateFrom] = useState(() => currentMonthBounds().from);
    const [dateTo, setDateTo] = useState(() => currentMonthBounds().to);
    const period = useMemo(() => normalizePeriod(dateFrom, dateTo), [dateFrom, dateTo]);

    useEffect(() => {
        const apply = (focus: TimeStatusFocus | null) => {
            if (!focus) return;
            if (STATUS_METRICS[focus.metric].view === "TODAY") {
                setView("TODAY");
                setTodayMetric(focus.metric);
            } else {
                setView("PERIOD");
                setPeriodMetric(focus.metric);
                if (focus.from) setDateFrom(focus.from);
                if (focus.to) setDateTo(focus.to);
            }
        };
        apply(takeTimeStatusFocus());
        const handler = (event: Event) => {
            apply((event as CustomEvent<TimeStatusFocus>).detail);
            takeTimeStatusFocus();
        };
        window.addEventListener(TIME_STATUS_FOCUS_EVENT, handler);
        return () => window.removeEventListener(TIME_STATUS_FOCUS_EVENT, handler);
    }, []);

    const metric = view === "TODAY" ? todayMetric : periodMetric;
    const info = STATUS_METRICS[metric];
    const columns = useMemo(() => columnsFor(metric), [metric]);

    return (
        <WorkspacePage>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="px-1.5">
                    <CrudTabList<View>
                        className="!px-1"
                        ariaLabel="Visão do relatório"
                        value={view}
                        onChange={setView}
                        items={[
                            { value: "TODAY", label: "Hoje", help: "Situação de agora." },
                            { value: "PERIOD", label: "Período", help: "Limites da CLT e faltas no período escolhido." },
                        ]}
                    />
                </div>
                <div className="grid shrink-0 grid-cols-1 items-end gap-3 border-b border-(--gesint-border-subtle) px-4 py-3 md:grid-cols-[minmax(14rem,20rem)_1fr_auto]">
                    <InputSelect
                        label="Status"
                        items={metricItems(view === "TODAY" ? TODAY_METRICS : PERIOD_METRICS)}
                        value={metric}
                        onValueChange={(value) =>
                            view === "TODAY"
                                ? setTodayMetric((value || "WORKING") as TimeStatusMetric)
                                : setPeriodMetric((value || "ABSENTEEISM") as TimeStatusMetric)
                        }
                    />
                    <p className="gesint-time-help">
                        <Info className="size-4 shrink-0 text-primary" />
                        <span>{info.help}</span>
                    </p>
                    {view === "PERIOD" ? (
                        <AttendancePeriodDateFilters
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onDateFromChange={setDateFrom}
                            onDateToChange={setDateTo}
                        />
                    ) : null}
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <QueryPagedTablePanel<Row>
                        key={`${metric}-${period.from}-${period.to}`}
                        queryKey={timeManagementKeys.status(metric, period.from, period.to)}
                        request={async (page, size, filters) => {
                            const report = await timeManagementService.status(
                                metric,
                                view === "PERIOD" ? period.from : undefined,
                                view === "PERIOD" ? period.to : undefined,
                            );
                            const rows = report.rows.map((row) => ({
                                ...row,
                                clockInText: hm(row.clockIn),
                                clockOutText: hm(row.clockOut),
                                percentValue: row.percent,
                            }));
                            return paginateCatalogRows(rows, page, size, filters);
                        }}
                        columns={columns}
                        rowKey="id"
                        exportFileName={`status-${info.label.toLowerCase().replace(/\s+/g, "-")}`}
                        exportPermission="attendance:export"
                        emptyMessage={
                            view === "TODAY" ? "Ninguém nesta situação agora." : "Nenhuma ocorrência no período."
                        }
                    />
                </div>
            </div>
        </WorkspacePage>
    );
}

export default TimeStatusReportPage;
