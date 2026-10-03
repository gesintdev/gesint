"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { COMPETENCY_TYPE_LABELS } from "@/modules/dp/organization/jobposition/competency/lib/job-position-competency.options";
import { jobVacancyCompetencyKeys } from "@/modules/rh/person/jobvacancy/competency/job-vacancy-competency.query";
import { jobVacancyCompetencyService } from "@/modules/rh/person/jobvacancy/competency/services/job-vacancy-competency.service";
import { developmentPlanDomainOptionsService } from "@/modules/rh/person/developmentplan/services/development-plan-domain-options.service";
import { useHasPermission } from "@/shared/auth/permissions";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { FormSection } from "@/shared/components/ui/FormSection";
import { InputAutocomplete } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const COMPETENCY_OPTIONS = {
    endpoint: "/api/v1/development/competencies",
    labelField: "name" as const,
    descriptionField: "type" as const,
};

const COLUMNS: TableColumnConfig[] = [
    {
        id: "competencyName",
        columnName: "Competência",
        fieldValue: "competencyName",
        dataType: TableDataType.TEXT,
    },
    {
        id: "competencyType",
        columnName: "Tipo",
        fieldValue: "competencyType",
        dataType: TableDataType.BADGE,
        badgeLabels: COMPETENCY_TYPE_LABELS,
    },
];

type JobVacancyCompetencySectionProps = {
    jobVacancyId?: string | null;
    hasJobPosition?: boolean;
};

export function JobVacancyCompetencySection({
    jobVacancyId,
    hasJobPosition = false,
}: JobVacancyCompetencySectionProps) {
    const canWrite = useHasPermission("jobvacancy:write");
    const queryClient = useQueryClient();
    const [competencyId, setCompetencyId] = useState("");

    const listQuery = useQuery({
        queryKey: jobVacancyCompetencyKeys.byVacancy(jobVacancyId ?? ""),
        queryFn: () => jobVacancyCompetencyService.findByJobVacancyId(jobVacancyId!),
        enabled: Boolean(jobVacancyId),
    });

    const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);

    const searchCompetencies = useCallback(
        (query: string, page: number) =>
            developmentPlanDomainOptionsService.search(COMPETENCY_OPTIONS, query, page),
        [],
    );

    const addMutation = useMutation({
        mutationFn: async () => {
            if (!jobVacancyId || !competencyId) {
                throw new Error("Selecione uma competência");
            }
            return jobVacancyCompetencyService.create({
                jobVacancyId,
                competencyId,
                displayOrder: rows.length,
            });
        },
        onSuccess: async () => {
            setCompetencyId("");
            await queryClient.invalidateQueries({
                queryKey: jobVacancyCompetencyKeys.byVacancy(jobVacancyId ?? ""),
            });
            toast.success("Competência vinculada à vaga");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível vincular a competência.",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => jobVacancyCompetencyService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: jobVacancyCompetencyKeys.byVacancy(jobVacancyId ?? ""),
            });
            toast.success("Competência removida da vaga");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível remover a competência.",
            });
        },
    });

    const description = hasJobPosition
        ? "Com cargo vinculado, o scorecard usa as competências do cargo (uso Entrevista). As da vaga servem de fallback."
        : "Sem cargo vinculado, o scorecard de entrevista usa as competências selecionadas aqui.";

    return (
        <FormSection
            id="competencias-entrevista"
            title="Competências da entrevista"
            description={description}
            disabled={!jobVacancyId}
        >
            {!jobVacancyId ? (
                <p className="text-sm text-base-content/55 sm:col-span-12">
                    Salve a vaga para vincular competências usadas no scorecard.
                </p>
            ) : (
                <>
                    {canWrite ? (
                        <div className="sm:col-span-12 flex flex-wrap items-end gap-2">
                            <InputAutocomplete
                                label="Competência (catálogo PDI)"
                                value={competencyId}
                                onValueChange={(value) => setCompetencyId(value)}
                                onSearch={searchCompetencies}
                                placeholder="Buscar competência"
                                wrapperClassName="min-w-[16rem] flex-1"
                            />
                            <Button
                                type="button"
                                size="sm"
                                leftIcon={<Plus className="size-4" strokeWidth={2} />}
                                loading={addMutation.isPending}
                                disabled={!competencyId}
                                onClick={() => addMutation.mutate()}
                            >
                                Adicionar
                            </Button>
                        </div>
                    ) : null}
                    <div className="min-w-0 sm:col-span-12">
                        <DataTable
                            columns={COLUMNS}
                            data={rows}
                            rowKey="id"
                            emptyMessage="Nenhuma competência vinculada a esta vaga."
                            renderActions={
                                canWrite
                                    ? (row) => (
                                          <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              aria-label="Remover competência"
                                              leftIcon={<Trash2 className="size-3.5" strokeWidth={2} />}
                                              loading={
                                                  deleteMutation.isPending &&
                                                  deleteMutation.variables === row.id
                                              }
                                              onClick={() => deleteMutation.mutate(row.id)}
                                          />
                                      )
                                    : undefined
                            }
                        />
                    </div>
                </>
            )}
        </FormSection>
    );
}
