"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import type { JobPositionSalaryTable } from "@/modules/dp/organization/jobposition/salarytable/dto/job-position-salary-table.dto";
import { jobPositionSalaryTableKeys } from "@/modules/dp/organization/jobposition/salarytable/job-position-salary-table.query";
import { JOB_POSITION_SALARY_LEVEL_LABELS } from "@/modules/dp/organization/jobposition/salarytable/lib/job-position-salary-level.options";
import { jobPositionSalaryTableService } from "@/modules/dp/organization/jobposition/salarytable/services/job-position-salary-table.service";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { Modal } from "@/shared/components/ui/Modal";
import { ExceptionCapture } from "@/shared/exceptions";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const HISTORY_COLUMNS: TableColumnConfig[] = [
    {
        id: "name",
        columnName: "Tabela",
        fieldValue: "name",
        dataType: TableDataType.TEXT,
    },
    {
        id: "versionNumber",
        columnName: "Versão",
        fieldValue: "versionNumber",
        dataType: TableDataType.TEXT,
    },
    {
        id: "validFrom",
        columnName: "Vigente de",
        fieldValue: "validFrom",
        dataType: TableDataType.DATE,
    },
    {
        id: "validUntil",
        columnName: "Vigente até",
        fieldValue: "validUntil",
        dataType: TableDataType.DATE,
    },
];

const DETAIL_COLUMNS: TableColumnConfig[] = [
    {
        id: "level",
        columnName: "Nível",
        fieldValue: "level",
        dataType: TableDataType.BADGE,
        badgeLabels: JOB_POSITION_SALARY_LEVEL_LABELS,
    },
    {
        id: "minSalary",
        columnName: "Mínimo",
        fieldValue: "minSalary",
        dataType: TableDataType.MONEY,
    },
    {
        id: "referenceSalary",
        columnName: "Referência",
        fieldValue: "referenceSalary",
        dataType: TableDataType.MONEY,
    },
    {
        id: "maxSalary",
        columnName: "Máximo",
        fieldValue: "maxSalary",
        dataType: TableDataType.MONEY,
    },
];

type HistoryRow = JobPositionSalaryTable & { name: string };

type JobPositionSalaryTableHistoryModalProps = {
    open: boolean;
    onClose: () => void;
    jobPositionId: string;
};

export function JobPositionSalaryTableHistoryModal({
    open,
    onClose,
    jobPositionId,
}: JobPositionSalaryTableHistoryModalProps) {
    const [selected, setSelected] = useState<JobPositionSalaryTable | null>(null);

    const historyQuery = useQuery({
        queryKey: jobPositionSalaryTableKeys.byJobPosition(jobPositionId),
        queryFn: () => jobPositionSalaryTableService.findByJobPositionId(jobPositionId),
        enabled: open && Boolean(jobPositionId),
    });

    const rows = useMemo<HistoryRow[]>(() => {
        const all = historyQuery.data ?? [];
        return all
            .filter((table) => Boolean(table.validUntil))
            .map((table) => ({
                ...table,
                name: table.name?.trim() || `Tabela v${table.versionNumber}`,
            }));
    }, [historyQuery.data]);

    useEffect(() => {
        if (!open) setSelected(null);
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={selected ? "Detalhe da tabela" : "Histórico de tabelas salariais"}
            subtitle={
                selected
                    ? `${selected.name?.trim() || `Tabela v${selected.versionNumber}`} · ${selected.validFrom} a ${selected.validUntil}`
                    : "Tabelas com vigência encerrada."
            }
            layoutClassName="max-h-[90vh] w-[min(48rem,92vw)] max-w-[min(48rem,92vw)]"
            footer={
                <div className="flex items-center justify-end gap-2">
                    {selected ? (
                        <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                            Voltar
                        </Button>
                    ) : null}
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            }
        >
            {historyQuery.isLoading ? (
                <div className="grid gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-shimmer h-10 w-full" />
                    ))}
                </div>
            ) : historyQuery.isError ? (
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        historyQuery.error,
                        JOBPOSITION_CLIENT_MESSAGES.SALARY_TABLE_LOAD_FAILED,
                    )}
                </p>
            ) : selected ? (
                <DataTable
                    data={selected.items ?? []}
                    columns={DETAIL_COLUMNS}
                    rowKey="level"
                    emptyMessage="Tabela sem itens."
                />
            ) : (
                <DataTable
                    data={rows}
                    columns={HISTORY_COLUMNS}
                    rowKey="id"
                    emptyMessage="Nenhuma tabela encerrada no histórico."
                    rowActivateOn="doubleclick"
                    onRowActivate={(row) => setSelected(row)}
                />
            )}
        </Modal>
    );
}

