"use client";

import { useQuery } from "@tanstack/react-query";
import { History, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { JobPositionSalaryTableFormModal } from "@/modules/dp/organization/jobposition/salarytable/components/JobPositionSalaryTableFormModal";
import { JobPositionSalaryTableHistoryModal } from "@/modules/dp/organization/jobposition/salarytable/components/JobPositionSalaryTableHistoryModal";
import { jobPositionSalaryTableKeys } from "@/modules/dp/organization/jobposition/salarytable/job-position-salary-table.query";
import { JOB_POSITION_SALARY_LEVEL_LABELS } from "@/modules/dp/organization/jobposition/salarytable/lib/job-position-salary-level.options";
import { jobPositionSalaryTableService } from "@/modules/dp/organization/jobposition/salarytable/services/job-position-salary-table.service";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import { useHasPermission } from "@/shared/auth/permissions";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const COLUMNS: TableColumnConfig[] = [
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

type JobPositionSalaryTableSectionProps = {
    jobPositionId?: string | null;
};

export function JobPositionSalaryTableSection({ jobPositionId }: JobPositionSalaryTableSectionProps) {
    const canWrite = useHasPermission("jobposition:write");
    const [formOpen, setFormOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const currentQuery = useQuery({
        queryKey: jobPositionSalaryTableKeys.current(jobPositionId ?? ""),
        queryFn: () => jobPositionSalaryTableService.findCurrentByJobPositionId(jobPositionId!),
        enabled: Boolean(jobPositionId),
    });

    const current = currentQuery.data ?? null;
    const rows = useMemo(() => current?.items ?? [], [current]);

    const openCreateOrNewVersion = () => {
        setFormOpen(true);
    };

    const headerActions = jobPositionId ? (
        <>
            <Button
                type="button"
                size="sm"
                variant="ghost"
                leftIcon={<History className="size-4" strokeWidth={2} />}
                aria-label="Histórico de tabelas"
                onClick={() => setHistoryOpen(true)}
            />
            {canWrite ? (
                <Button
                    type="button"
                    size="sm"
                    leftIcon={<Plus className="size-4" strokeWidth={2} />}
                    aria-label={current ? "Nova versão da tabela" : "Nova tabela salarial"}
                    onClick={openCreateOrNewVersion}
                />
            ) : null}
        </>
    ) : null;

    return (
        <FormSection
            id="niveis-faixas"
            title="Níveis e faixas"
            disabled={!jobPositionId}
            headerActions={headerActions}
        >
            {!jobPositionId ? (
                <p className="text-sm text-base-content/55 sm:col-span-12">
                    Salve o cargo para cadastrar a tabela salarial.
                </p>
            ) : currentQuery.isLoading ? (
                <div className="grid gap-2 sm:col-span-12">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-shimmer h-10 w-full" />
                    ))}
                </div>
            ) : currentQuery.isError ? (
                <p className="text-sm font-medium text-error sm:col-span-12">
                    {ExceptionCapture.displayMessage(
                        currentQuery.error,
                        JOBPOSITION_CLIENT_MESSAGES.SALARY_TABLE_LOAD_FAILED,
                    )}
                </p>
            ) : (
                <>
                    {current ? (
                        <p className="text-xs text-base-content/55 sm:col-span-12">
                            {current.name?.trim() || `Tabela v${current.versionNumber}`} · vigente desde{" "}
                            {current.validFrom}
                        </p>
                    ) : null}
                    <div className="min-w-0 sm:col-span-12">
                        <DataTable
                            data={rows}
                            columns={COLUMNS}
                            rowKey="level"
                            emptyMessage="Nenhuma tabela salarial vigente. Use + para cadastrar."
                            rowActivateOn="doubleclick"
                            onRowActivate={
                                canWrite && current
                                    ? () => {
                                          setFormOpen(true);
                                      }
                                    : undefined
                            }
                        />
                    </div>
                    <JobPositionSalaryTableFormModal
                        open={formOpen}
                        onClose={() => setFormOpen(false)}
                        jobPositionId={jobPositionId}
                        tableId={current?.id ?? null}
                        onSaved={() => {
                            void currentQuery.refetch();
                        }}
                    />
                    <JobPositionSalaryTableHistoryModal
                        open={historyOpen}
                        onClose={() => setHistoryOpen(false)}
                        jobPositionId={jobPositionId}
                    />
                </>
            )}
        </FormSection>
    );
}
