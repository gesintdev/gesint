"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, Info } from "lucide-react";
import { useMemo, useState } from "react";

import { AttendancePeriodDateFilters } from "@/modules/gp/attendance/components/AttendancePeriodDateFilters";
import { currentMonthBounds, normalizePeriod } from "@/modules/gp/attendance/lib/attendance-period.util";
import {
    balanceColumn,
    dayStatusColumn,
    durationColumn,
    GP_COLLABORATOR_COLUMN,
} from "@/modules/gp/shared/config/time-table-columns";
import type { HourBankRow } from "@/modules/gp/shared/dto/time-management.dto";
import { timeManagementService } from "@/modules/gp/shared/services/time-management.service";
import { timeManagementKeys } from "@/modules/gp/shared/time-management.query";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";
import { DataTable } from "@/shared/components/ui/DataTable";
import { Modal } from "@/shared/components/ui/Modal";
import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { balanceTone, formatBalance } from "@/shared/lib/time/duration-format";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";
import { useWorkspaceLink } from "@/shared/workspace/WorkspaceLink";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function formatIsoDate(value: string): string {
    const [year, month, day] = value.split("-").map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
}

const COLUMNS: TableColumnConfig[] = [
    GP_COLLABORATOR_COLUMN,
    { id: "workScheduleName", columnName: "Escala", fieldValue: "workScheduleName", dataType: TableDataType.TEXT },
    balanceColumn("previousBalanceMinutes", "Saldo anterior"),
    durationColumn("periodCreditMinutes", "Créditos"),
    durationColumn("periodDebitMinutes", "Débitos"),
    balanceColumn("periodBalanceMinutes", "Saldo do período"),
    balanceColumn("totalBalanceMinutes", "Banco de horas"),
];

const STATEMENT_COLUMNS: TableColumnConfig[] = [
    { id: "date", columnName: "Dia", fieldValue: "date", dataType: TableDataType.DATE, notFilterable: true },
    dayStatusColumn(),
    durationColumn("expectedMinutes", "Previsto"),
    durationColumn("workedMinutes", "Trabalhado"),
    balanceColumn("hourBankMinutes", "Saldo do dia"),
    balanceColumn("runningBalanceMinutes", "Acumulado"),
];

function StatementModal({
    row,
    from,
    to,
    onClose,
}: {
    row: HourBankRow | null;
    from: string;
    to: string;
    onClose: () => void;
}) {
    const queryKey = useBranchScopedQueryKey([...timeManagementKeys.hourBank, "statement", row?.collaboratorId ?? "", from, to]);
    const query = useQuery({
        queryKey,
        queryFn: () => timeManagementService.hourBankStatement(row!.collaboratorId, from, to),
        enabled: row != null,
    });
    const statement = query.data;
    return (
        <Modal
            open={row != null}
            onClose={onClose}
            size="3xl"
            title={row ? `Extrato do banco de horas · ${row.collaboratorName}` : "Extrato"}
            subtitle={`${formatIsoDate(from)} a ${formatIsoDate(to)}`}
        >
            {query.isLoading ? (
                <div className="skeleton-stack">
                    <div className="skeleton-shimmer h-10 w-full" />
                    <div className="skeleton-shimmer h-48 w-full" />
                </div>
            ) : statement ? (
                <div className="flex flex-col gap-3">
                    <div className="gesint-dash-stats !grid-cols-2">
                        <div className="gesint-dash-stats__item">
                            <p className="gesint-dash-stats__label">Saldo antes do período</p>
                            <p className={`gesint-dash-stats__value gesint-balance gesint-balance--${balanceTone(statement.previousBalanceMinutes)}`}>
                                {formatBalance(statement.previousBalanceMinutes)}
                            </p>
                        </div>
                        <div className="gesint-dash-stats__item">
                            <p className="gesint-dash-stats__label">Saldo no fim do período</p>
                            <p className={`gesint-dash-stats__value gesint-balance gesint-balance--${balanceTone(statement.totalBalanceMinutes)}`}>
                                {formatBalance(statement.totalBalanceMinutes)}
                            </p>
                        </div>
                    </div>
                    <div className="max-h-[55vh] overflow-auto rounded-xl border border-(--gesint-border-subtle)">
                        <DataTable data={statement.lines} columns={STATEMENT_COLUMNS} rowKey="date" />
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}

/** Saldos do banco de horas: derivados da apuração diária desde o início configurado. */
export function HourBankPage() {
    const { navigate } = useWorkspaceLink();
    const [dateFrom, setDateFrom] = useState(() => currentMonthBounds().from);
    const [dateTo, setDateTo] = useState(() => currentMonthBounds().to);
    const period = useMemo(() => normalizePeriod(dateFrom, dateTo), [dateFrom, dateTo]);
    const [selected, setSelected] = useState<HourBankRow | null>(null);
    const [accrualStart, setAccrualStart] = useState<string | null>(null);
    const [enabled, setEnabled] = useState(true);

    return (
        <WorkspacePage>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="crud-list-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-2">
                    <p className="flex min-w-0 items-center gap-2 text-[13px] text-base-content/60">
                        <Info className="size-4 shrink-0 text-primary" />
                        <span>
                            Saldo = horas trabalhadas menos a jornada da escala, dia a dia
                            {accrualStart ? `, desde ${formatIsoDate(accrualStart)}` : ""}. Positivo em verde, negativo em vermelho.
                        </span>
                    </p>
                    <AttendancePeriodDateFilters
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                    />
                </div>
                {!enabled ? (
                    <div className="gesint-dash-empty m-6">
                        <span className="gesint-dash-empty__icon">
                            <Info className="size-4" />
                        </span>
                        <p>
                            O banco de horas está desligado.{" "}
                            <button type="button" className="text-primary underline-offset-2 hover:underline" onClick={() => navigate("/attendance/settings")}>
                                Ligue em Preferências de ponto
                            </button>{" "}
                            para acompanhar os saldos.
                        </p>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <QueryPagedTablePanel<HourBankRow>
                            key={`${period.from}-${period.to}`}
                            queryKey={[...timeManagementKeys.hourBank, period.from, period.to]}
                            request={async (page, size, filters) => {
                                const result = await timeManagementService.hourBank(period.from, period.to);
                                setAccrualStart(result.accrualStart);
                                setEnabled(result.enabled);
                                return paginateCatalogRows(result.rows, page, size, filters);
                            }}
                            columns={COLUMNS}
                            rowKey="id"
                            emptyMessage="Nenhum colaborador no quadro."
                            onRowActivate={setSelected}
                            renderActions={(row) => (
                                <TableActionButton
                                    actionVariant="open"
                                    aria-label="Ver extrato"
                                    title="Ver extrato do banco de horas"
                                    leftIcon={<Eye className="size-3.5" />}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelected(row);
                                    }}
                                />
                            )}
                        />
                    </div>
                )}
            </div>
            <StatementModal row={selected} from={period.from} to={period.to} onClose={() => setSelected(null)} />
        </WorkspacePage>
    );
}

export default HourBankPage;
