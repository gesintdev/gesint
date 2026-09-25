"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { JobPositionSalaryTable } from "@/modules/dp/organization/jobposition/salarytable/dto/job-position-salary-table.dto";
import { jobPositionSalaryTableKeys } from "@/modules/dp/organization/jobposition/salarytable/job-position-salary-table.query";
import { JOB_POSITION_SALARY_LEVEL_LABELS } from "@/modules/dp/organization/jobposition/salarytable/lib/job-position-salary-level.options";
import { jobPositionSalaryTableService } from "@/modules/dp/organization/jobposition/salarytable/services/job-position-salary-table.service";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
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
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !mounted) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
        if (!open) setSelected(null);
    }, [open, mounted]);

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[90vh] w-[min(48rem,92vw)] max-w-[min(48rem,92vw)] flex-col gap-0 overflow-hidden p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/8 px-5 py-4">
                    <div>
                        <h3 className="text-base font-semibold text-base-content">
                            {selected ? "Detalhe da tabela" : "Histórico de tabelas salariais"}
                        </h3>
                        <p className="mt-0.5 text-xs text-base-content/50">
                            {selected
                                ? `${selected.name?.trim() || `Tabela v${selected.versionNumber}`} · ${selected.validFrom} a ${selected.validUntil}`
                                : "Tabelas com vigência encerrada."}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
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
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-base-content/8 px-5 py-3">
                    {selected ? (
                        <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                            Voltar
                        </Button>
                    ) : null}
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Fechar modal" onClick={onClose} />
        </dialog>,
        document.body,
    );
}
