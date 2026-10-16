"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { type SubmitEvent, useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";

import { DISMISSAL_TYPE_LABELS } from "@/modules/dp/offboarding/config/offboarding.table-columns";
import { offboardingKeys } from "@/modules/dp/offboarding/offboarding.query";
import { offboardingService } from "@/modules/dp/offboarding/services/offboarding.service";
import { JobPositionPickerField } from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import type { JobPositionSalaryLevel } from "@/modules/dp/organization/jobposition/salarytable/dto/job-position-salary-table.dto";
import { jobPositionSalaryTableKeys } from "@/modules/dp/organization/jobposition/salarytable/job-position-salary-table.query";
import { JOB_POSITION_SALARY_LEVEL_ITEMS } from "@/modules/dp/organization/jobposition/salarytable/lib/job-position-salary-level.options";
import { jobPositionSalaryTableService } from "@/modules/dp/organization/jobposition/salarytable/services/job-position-salary-table.service";
import { JobRequisitionApprovalTrack } from "@/modules/rh/person/jobrequisition/components/JobRequisitionApprovalTrack";
import { JobRequisitionSalaryBand } from "@/modules/rh/person/jobrequisition/components/JobRequisitionSalaryBand";
import type {
    JobRequisition,
    JobRequisitionExperiencePeriod,
    JobRequisitionFormDto,
    JobRequisitionReason,
} from "@/modules/rh/person/jobrequisition/dto/job-requisition.dto";
import { JOB_REQUISITION_CLIENT_MESSAGES } from "@/modules/rh/person/jobrequisition/exceptions/job-requisition.messages";
import { jobRequisitionKeys } from "@/modules/rh/person/jobrequisition/job-requisition.query";
import {
    emptyJobRequisitionForm,
    jobRequisitionFormToPayload,
    jobRequisitionToFormDto,
} from "@/modules/rh/person/jobrequisition/lib/job-requisition.mapper";
import {
    isPendingRequisition,
    JOB_REQUISITION_EXPERIENCE_PERIOD_ITEMS,
    JOB_REQUISITION_REASON_LABELS,
    JOB_REQUISITION_REASON_VALUES,
    JOB_REQUISITION_STAGE_PERMISSION,
    JOB_REQUISITION_STATUS_LABELS,
} from "@/modules/rh/person/jobrequisition/lib/job-requisition.options";
import { jobRequisitionService } from "@/modules/rh/person/jobrequisition/services/job-requisition.service";
import type { JobVacancyContractType } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { JOB_VACANCY_CONTRACT_TYPE_ITEMS } from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";
import { VacationReviewReasonDialog } from "@/modules/rh/person/leave/components/VacationReviewReasonDialog";
import { useHasPermission } from "@/shared/auth/permissions";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { Button } from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import {
    InputCurrency,
    InputDate,
    InputInfo,
    InputNumber,
    InputSelect,
    InputSelectAutocomplete,
} from "@/shared/components/ui/input/index";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { useActiveBranch } from "@/shared/context/ActiveBranchContext";
import { ExceptionCapture } from "@/shared/exceptions";
import { useBranchScopedDetailQuery } from "@/shared/hooks/useBranchScopedDetailQuery";
import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";
import { isoToDateBr } from "@/shared/lib/input/date";
import { SystemAlert } from "@/shared/system-alert";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "posicao", label: "Posição" },
    { id: "motivo", label: "Motivo" },
    { id: "remuneracao", label: "Remuneração" },
    { id: "aprovacao", label: "Aprovação" },
];

type TextAreaProps = {
    label: string;
    value?: string;
    onValueChange: (value: string) => void;
    wrapperClassName?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
};

function TextAreaField({ label, value, onValueChange, wrapperClassName, required, disabled, rows = 3 }: TextAreaProps) {
    const autoId = useId();
    const id = `job-requisition-${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}`;

    return (
        <InputFieldChrome label={label} id={id} wrapperClassName={wrapperClassName} required={required} disabled={disabled}>
            <textarea
                id={id}
                rows={rows}
                value={value ?? ""}
                disabled={disabled}
                onChange={(event) => onValueChange(event.target.value)}
                className={clsx("gommo-control w-full resize-y px-3 py-2 text-sm", fieldClass(disabled))}
            />
        </InputFieldChrome>
    );
}

function offboardingLabel(name?: string | null, dismissalDate?: string | null, dismissalType?: string | null): string {
    const date = dismissalDate ? isoToDateBr(dismissalDate.slice(0, 10)).slice(0, 5) : "";
    const type = dismissalType ? DISMISSAL_TYPE_LABELS[dismissalType]?.toLowerCase() : "";
    const detail = [date ? `desligado em ${date}` : "", type ? `(${type})` : ""].filter(Boolean).join(" ");
    return detail ? `${name ?? "Colaborador"} · ${detail}` : (name ?? "Colaborador");
}

export function JobRequisitionFormClient() {
    const { editingId, isEditing, goToList, showSavedRecord } = useCrudScreen();
    const { activeBranch, branches } = useActiveBranch();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<JobRequisitionFormDto>(emptyJobRequisitionForm);
    const [error, setError] = useState<string | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);

    const detailQuery = useBranchScopedDetailQuery(
        jobRequisitionKeys.detail(editingId ?? ""),
        () => jobRequisitionService.getById(editingId!),
        { enabled: isEditing && Boolean(editingId) },
    );
    const requisition: JobRequisition | null = isEditing ? (detailQuery.data ?? null) : null;
    const requisitionStatus = requisition?.requisitionStatus ?? "DRAFT";
    const isDraft = requisitionStatus === "DRAFT";
    const readOnly = !isDraft;

    const canWrite = useHasPermission("jobrequisition:write");
    const stagePermission = JOB_REQUISITION_STAGE_PERMISSION[requisitionStatus];
    const hasStagePermission = useHasPermission(stagePermission);
    const canDecide = Boolean(stagePermission) && hasStagePermission;

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyJobRequisitionForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(jobRequisitionToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: jobRequisitionToFormDto,
        getEmptyForm: () => emptyJobRequisitionForm(),
    });

    const offboardingQueryKey = useBranchScopedQueryKey(offboardingKeys.all);
    const offboardingsQuery = useQuery({
        queryKey: offboardingQueryKey,
        queryFn: () => offboardingService.getAll(),
        enabled: form.reason === "REPLACEMENT" && !readOnly,
    });
    const offboardingItems = useMemo<SelectItem[]>(
        () =>
            (offboardingsQuery.data ?? []).map((item) => ({
                value: item.id,
                label: offboardingLabel(item.collaboratorName, item.dismissalDate, item.dismissalType),
            })),
        [offboardingsQuery.data],
    );
    const selectedOffboardingLabel =
        requisition?.offboardingId && requisition.offboardingId === form.offboardingId
            ? offboardingLabel(
                  requisition.replacedCollaboratorName,
                  requisition.replacedDismissalDate,
                  requisition.replacedDismissalType,
              )
            : "";

    const salaryTableQuery = useQuery({
        queryKey: jobPositionSalaryTableKeys.current(form.jobPositionId),
        queryFn: () => jobPositionSalaryTableService.findCurrentByJobPositionId(form.jobPositionId),
        enabled: Boolean(form.jobPositionId) && !readOnly,
    });
    const liveBand = salaryTableQuery.data?.items.find((item) => item.level === form.salaryLevel) ?? null;
    const bandMin = readOnly ? requisition?.bandMinSalary : liveBand?.minSalary;
    const bandMax = readOnly ? requisition?.bandMaxSalary : liveBand?.maxSalary;
    const proposedSalary = form.proposedSalary ? Number(form.proposedSalary) : null;
    const outOfBand = readOnly
        ? Boolean(requisition?.outOfBand)
        : bandMin != null && bandMax != null && proposedSalary != null && (proposedSalary < bandMin || proposedSalary > bandMax);

    const branchName = useMemo(() => {
        if (requisition) {
            return branches.find((branch) => branch.id === requisition.companyId)?.name ?? "";
        }
        return activeBranch?.name ?? "";
    }, [requisition, branches, activeBranch]);

    const refreshAfterChange = async (result: JobRequisition) => {
        setForm(jobRequisitionToFormDto(result));
        await queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.all });
        if (!isEditing) {
            await showSavedRecord(result.id, result);
        }
    };

    const persist = async (dto: JobRequisitionFormDto): Promise<JobRequisition> => {
        const payload = jobRequisitionFormToPayload(dto);
        if (isEditing && editingId) return jobRequisitionService.update(editingId, payload);
        return jobRequisitionService.create(payload);
    };

    const saveMutation = useMutation({
        mutationFn: persist,
        onSuccess: async (result) => {
            toast.success(isEditing ? "Rascunho atualizado" : "Rascunho salvo");
            await refreshAfterChange(result);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_REQUISITION_CLIENT_MESSAGES.JOB_REQUISITION_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const submitMutation = useMutation({
        mutationFn: async (dto: JobRequisitionFormDto) => {
            const saved = await persist(dto);
            return jobRequisitionService.submitForApproval(saved.id);
        },
        onSuccess: async (result) => {
            toast.success("Requisição enviada para aprovação");
            await refreshAfterChange(result);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_REQUISITION_CLIENT_MESSAGES.JOB_REQUISITION_SUBMIT_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => jobRequisitionService.approve(editingId!),
        onSuccess: async (result) => {
            toast.success(
                result.requisitionStatus === "APPROVED"
                    ? "Requisição aprovada. A vaga foi aberta."
                    : `Aprovado. ${JOB_REQUISITION_STATUS_LABELS[result.requisitionStatus]}.`,
            );
            await refreshAfterChange(result);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_REQUISITION_CLIENT_MESSAGES.JOB_REQUISITION_DECISION_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (reason: string) => jobRequisitionService.reject(editingId!, { reason }),
        onSuccess: async (result) => {
            setRejectOpen(false);
            toast.success("Requisição reprovada");
            await refreshAfterChange(result);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_REQUISITION_CLIENT_MESSAGES.JOB_REQUISITION_DECISION_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const cancelMutation = useMutation({
        mutationFn: () => jobRequisitionService.cancel(editingId!),
        onSuccess: async (result) => {
            toast.success("Requisição cancelada");
            await refreshAfterChange(result);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_REQUISITION_CLIENT_MESSAGES.JOB_REQUISITION_CANCEL_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof JobRequisitionFormDto>(field: K, value: JobRequisitionFormDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    const handleSendForApproval = async () => {
        setError(null);
        if (outOfBand && !form.justification?.trim()) {
            setError("Salário fora da faixa do cargo exige justificativa.");
            return;
        }
        const flow = outOfBand ? "Gestor, RH e Diretoria" : "Gestor e RH";
        const confirmed = await SystemAlert.confirm({
            title: "Enviar para aprovação",
            message: `A requisição seguirá para aprovação de ${flow} e não poderá mais ser editada.`,
            confirmLabel: "Enviar",
            cancelLabel: "Voltar",
            variant: "info",
        });
        if (confirmed) submitMutation.mutate(form);
    };

    const handleApprove = async () => {
        setError(null);
        const isFinalStage =
            requisitionStatus === "PENDING_DIRECTOR" || (requisitionStatus === "PENDING_HR" && !outOfBand);
        const confirmed = await SystemAlert.confirm({
            title: "Aprovar requisição",
            message: isFinalStage
                ? "Esta é a última alçada: ao aprovar, a vaga será aberta automaticamente."
                : "A requisição seguirá para a próxima alçada.",
            confirmLabel: "Aprovar",
            cancelLabel: "Voltar",
            variant: "success",
        });
        if (confirmed) approveMutation.mutate();
    };

    const handleCancelRequisition = async () => {
        setError(null);
        const confirmed = await SystemAlert.confirm({
            title: "Cancelar requisição",
            message: "A requisição será encerrada sem abrir a vaga.",
            confirmLabel: "Cancelar requisição",
            cancelLabel: "Voltar",
            variant: "error",
        });
        if (confirmed) cancelMutation.mutate();
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <SkeletonStack count={4} padded />
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        JOB_REQUISITION_CLIENT_MESSAGES.JOB_REQUISITION_LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    const isPending = isPendingRequisition(requisitionStatus);

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        {readOnly ? "Voltar" : "Cancelar"}
                    </Button>
                    {isEditing && isPending && canWrite ? (
                        <Button
                            type="button"
                            variant="danger"
                            loading={cancelMutation.isPending}
                            onClick={() => void handleCancelRequisition()}
                        >
                            Cancelar requisição
                        </Button>
                    ) : null}
                    {isEditing && canDecide ? (
                        <>
                            <Button type="button" variant="warning" onClick={() => setRejectOpen(true)}>
                                Reprovar
                            </Button>
                            <Button
                                type="button"
                                variant="success"
                                loading={approveMutation.isPending}
                                onClick={() => void handleApprove()}
                            >
                                Aprovar
                            </Button>
                        </>
                    ) : null}
                    {isDraft ? (
                        <>
                            <Button type="submit" variant="outline" loading={saveMutation.isPending}>
                                Salvar rascunho
                            </Button>
                            <Button
                                type="button"
                                loading={submitMutation.isPending}
                                onClick={() => void handleSendForApproval()}
                            >
                                Enviar para aprovação
                            </Button>
                        </>
                    ) : null}
                </>
            }
        >
            <FormSection id="posicao" title="Posição">
                <JobPositionPickerField
                    label="Cargo"
                    value={form.jobPositionId}
                    onValueChange={(v) => update("jobPositionId", v)}
                    required
                    disabled={readOnly}
                    wrapperClassName="sm:col-span-4"
                />
                <InputSelect
                    label="Nível"
                    items={JOB_POSITION_SALARY_LEVEL_ITEMS}
                    value={form.salaryLevel ?? ""}
                    onValueChange={(v) => update("salaryLevel", (v || undefined) as JobPositionSalaryLevel | undefined)}
                    required
                    disabled={readOnly}
                    wrapperClassName="sm:col-span-4"
                />
                <InputInfo label="Filial" value={branchName} wrapperClassName="sm:col-span-4" />
                <InputSelect
                    label="Tipo de vínculo"
                    items={JOB_VACANCY_CONTRACT_TYPE_ITEMS}
                    value={form.contractType ?? ""}
                    onValueChange={(v) =>
                        update("contractType", (v || undefined) as JobVacancyContractType | undefined)
                    }
                    required
                    disabled={readOnly}
                    wrapperClassName={form.contractType === "CLT" ? "sm:col-span-2" : "sm:col-span-4"}
                />
                {form.contractType === "CLT" ? (
                    <InputSelect
                        label="Experiência"
                        items={JOB_REQUISITION_EXPERIENCE_PERIOD_ITEMS}
                        value={form.experiencePeriod ?? ""}
                        onValueChange={(v) =>
                            update("experiencePeriod", (v || undefined) as JobRequisitionExperiencePeriod | undefined)
                        }
                        disabled={readOnly}
                        wrapperClassName="sm:col-span-2"
                    />
                ) : null}
                <InputNumber
                    label="Posições"
                    value={form.positionsCount}
                    onValueChange={(v) => update("positionsCount", v ?? 1)}
                    integer
                    required
                    disabled={readOnly}
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Início desejado"
                    value={form.desiredStartDate ?? ""}
                    onValueChange={(v) => update("desiredStartDate", v)}
                    disabled={readOnly}
                    wrapperClassName="sm:col-span-4"
                />
            </FormSection>

            <FormSection id="motivo" title="Motivo">
                <div
                    role="radiogroup"
                    aria-label="Motivo"
                    aria-disabled={readOnly || undefined}
                    className={clsx("flex flex-col gap-1.5 sm:col-span-4", readOnly && "gommo-disabled-surface")}
                >
                    {JOB_REQUISITION_REASON_VALUES.map((value) => {
                        const active = form.reason === value;
                        return (
                            <label
                                key={value}
                                className={clsx(
                                    "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                                    active ? "border-primary/35 bg-primary/8" : "border-transparent",
                                    !readOnly && "cursor-pointer hover:bg-base-200/50",
                                )}
                            >
                                <input
                                    type="radio"
                                    className="radio radio-primary radio-sm"
                                    name="job-requisition-reason"
                                    checked={active}
                                    disabled={readOnly}
                                    onChange={() => update("reason", value as JobRequisitionReason)}
                                />
                                <span className="font-medium text-base-content">
                                    {JOB_REQUISITION_REASON_LABELS[value]}
                                </span>
                            </label>
                        );
                    })}
                </div>
                {form.reason === "REPLACEMENT" ? (
                    <InputSelectAutocomplete
                        label="Substitui"
                        hint="Desligamento que abriu a posição."
                        items={offboardingItems}
                        value={form.offboardingId ?? ""}
                        selectedLabel={selectedOffboardingLabel}
                        onValueChange={(v) => update("offboardingId", v)}
                        placeholder="Busque pelo colaborador desligado..."
                        required
                        disabled={readOnly}
                        wrapperClassName="sm:col-span-8"
                    />
                ) : null}
            </FormSection>

            <FormSection id="remuneracao" title="Remuneração proposta">
                <InputCurrency
                    label="Salário proposto"
                    value={form.proposedSalary ?? ""}
                    onValueChange={(v) => update("proposedSalary", v)}
                    emitAsDecimal
                    required
                    disabled={readOnly}
                    wrapperClassName="sm:col-span-4"
                />
                <JobRequisitionSalaryBand
                    levelLabel={form.salaryLevel}
                    proposed={proposedSalary}
                    min={bandMin}
                    max={bandMax}
                />
                {outOfBand || form.justification ? (
                    <TextAreaField
                        label="Justificativa"
                        value={form.justification}
                        onValueChange={(v) => update("justification", v)}
                        required={outOfBand}
                        disabled={readOnly}
                        wrapperClassName="sm:col-span-12"
                    />
                ) : null}
            </FormSection>

            <FormSection
                id="aprovacao"
                title="Aprovação"
                description={
                    outOfBand
                        ? "Fora da faixa: gestor, RH e diretoria."
                        : "Dentro da faixa: gestor e RH. Aprovada, a requisição gera a vaga sem redigitar."
                }
            >
                <JobRequisitionApprovalTrack requisition={requisition} outOfBand={outOfBand} />
                {requisition?.jobVacancyId ? (
                    <p className="text-xs text-base-content/60 sm:col-span-12">
                        Vaga gerada em RH › Recrutamento › Vagas.
                    </p>
                ) : null}
            </FormSection>

            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

            <VacationReviewReasonDialog
                open={rejectOpen}
                title="Reprovar requisição"
                confirmLabel="Reprovar"
                hint="O motivo fica registrado na requisição e é exibido ao requisitante."
                onClose={() => setRejectOpen(false)}
                onConfirm={(reason) => rejectMutation.mutate(reason)}
                loading={rejectMutation.isPending}
            />
        </CrudFormShell>
    );
}
