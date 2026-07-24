"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { UserRoundCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { ExitInterviewReturnChecklistConfig } from "@/modules/cfg/settings/exitinterviewchecklist/dto/exit-interview-return-checklist-config.dto";
import { exitInterviewReturnChecklistConfigKeys } from "@/modules/cfg/settings/exitinterviewchecklist/exitinterviewchecklist.query";
import { exitInterviewReturnChecklistConfigService } from "@/modules/cfg/settings/exitinterviewchecklist/services/exit-interview-return-checklist-config.service";
import { DepartmentPickerField } from "@/modules/dp/organization/department/components/DepartmentPickerField";
import { departmentService } from "@/modules/dp/organization/department/services/department.service";
import { JobPositionPickerField } from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import { jobpositionService } from "@/modules/dp/organization/jobposition/services/jobposition.service";
import type {
    ExitInterviewCreateDto,
    ExitInterviewInterviewer,
    ExitInterviewReason,
    ExitInterviewRelationshipType,
    ExitInterviewReturnChecklistItemDto,
    ExitInterviewTerminationType,
    ReturnItemStatus,
} from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";
import { EXITINTERVIEW_CLIENT_MESSAGES } from "@/modules/rh/person/exitinterview/exceptions/exit-interview.messages";
import { exitinterviewKeys } from "@/modules/rh/person/exitinterview/exitinterview.query";
import { loadCollaboratorExitInterviewContext } from "@/modules/rh/person/exitinterview/lib/collaborator-exit-interview-context";
import {
    emptyExitInterviewForm,
    exitinterviewToFormDto,
} from "@/modules/rh/person/exitinterview/lib/exit-interview.mapper";
import {
    CLT_TERMINATION_ITEMS,
    EXIT_INTERVIEW_DOCUMENT_TYPE_ITEMS,
    EXIT_INTERVIEW_STATUS_ITEMS,
    EXIT_REASON_ITEMS,
    PJ_TERMINATION_ITEMS,
    REHIRE_ANSWER_ITEMS,
    RELATIONSHIP_TYPE_ITEMS,
    RETURN_STATUS_ITEMS,
    YES_NO_RECOMMEND_ITEMS,
} from "@/modules/rh/person/exitinterview/lib/exit-interview.options";
import { exitinterviewService } from "@/modules/rh/person/exitinterview/services/exit-interview.service";
import { storageService } from "@/modules/storage/services/storage.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import {
    EntityAttachments,
    flushPendingAttachments,
    type PendingAttachment,
} from "@/shared/components/storage/EntityAttachments";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputAutocomplete, InputCheckbox, InputDate, InputNumber, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { sectionHasChanges } from "@/shared/lib/form-step.util";
import { SystemAlert } from "@/shared/system-alert";

const EXIT_INTERVIEW_ENTITY_TYPE = "exit_interview";
const USER_AUTOCOMPLETE_PAGE_SIZE = 8;
const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Dados" },
    { id: "motivos", label: "Motivos" },
    { id: "avaliacao", label: "Avaliação" },
    { id: "perguntas", label: "Perguntas" },
    { id: "recontratacao", label: "Recontratação" },
    { id: "devolucoes", label: "Devoluções" },
    { id: "documentos", label: "Documentos" },
];

type ExitInterviewFormField = keyof ExitInterviewCreateDto;

type TextAreaProps = {
    label: string;
    value?: string;
    onValueChange: (_value: string) => void;
    wrapperClassName?: string;
    placeholder?: string;
    disabled?: boolean;
};

function TextAreaField({ label, value, onValueChange, wrapperClassName, placeholder, disabled }: TextAreaProps) {
    const id = label.toLowerCase().replace(/\s+/g, "-");

    return (
        <InputFieldChrome label={label} id={id} wrapperClassName={wrapperClassName} disabled={disabled}>
            <textarea
                id={id}
                value={value ?? ""}
                disabled={disabled}
                placeholder={placeholder}
                className={clsx("gommo-field min-h-24 w-full resize-y py-2", fieldClass(disabled))}
                onChange={(event) => onValueChange(event.target.value)}
            />
        </InputFieldChrome>
    );
}

type RatingFieldProps = {
    label: string;
    name: string;
    value?: number | null;
    onValueChange: (_value: number) => void;
    disabled?: boolean;
    wrapperClassName?: string;
};

function RatingField({ label, name, value, onValueChange, disabled, wrapperClassName }: RatingFieldProps) {
    const ratingValue = value ?? 1;

    return (
        <div
            className={clsx("grid gap-2 rounded-lg border border-base-300/60 bg-base-100 px-3 py-3", wrapperClassName)}
        >
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-base-content">{label}</span>
                <span className="text-xs font-medium text-base-content/55">{ratingValue}/5</span>
            </div>
            <div className={clsx("rating rating-sm", disabled && "opacity-60")}>
                {Array.from({ length: 5 }, (_, index) => {
                    const score = index + 1;
                    return (
                        <input
                            key={score}
                            type="radio"
                            name={name}
                            className="mask mask-star-2 bg-orange-400"
                            aria-label={`${score} estrela${score > 1 ? "s" : ""}`}
                            checked={ratingValue === score}
                            disabled={disabled}
                            onChange={() => onValueChange(score)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function inclusiveTenureDays(startDate?: string, endDate?: string) {
    if (!startDate || !endDate || endDate < startDate) return undefined;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

function trimEmpty<T extends Record<string, unknown>>(payload: T): T {
    return Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, value === "" ? undefined : value]),
    ) as T;
}

function configuredChecklistToReturnItems(
    items?: ExitInterviewReturnChecklistConfig[],
): ExitInterviewReturnChecklistItemDto[] {
    return (items ?? []).map((item) => ({
        key: item.itemKey,
        description: item.description,
        status: "PENDING" as const,
        returnedAt: "",
        notes: "",
    }));
}

function appUserToInterviewerItem(user: ExitInterviewInterviewer): SelectItem {
    const label = user.label?.trim() || user.username?.trim() || user.email?.trim() || "Usuário";
    const description = [user.username, user.email]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value) && value !== label)
        .join(" • ");
    return {
        value: label,
        label,
        description: description || undefined,
    };
}

async function searchTenantUsers(query: string, page: number): Promise<SelectSearchResult> {
    const normalizedQuery = query.trim().toLowerCase();
    const users = await exitinterviewService.listInterviewers();
    const filtered = normalizedQuery
        ? users.filter((user) =>
              [user.label, user.username, user.email].some((value) =>
                  value?.toLowerCase().includes(normalizedQuery),
              ),
          )
        : users;
    const start = page * USER_AUTOCOMPLETE_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + USER_AUTOCOMPLETE_PAGE_SIZE).map(appUserToInterviewerItem);
    return {
        items: pageItems,
        hasMore: start + USER_AUTOCOMPLETE_PAGE_SIZE < filtered.length,
        page,
    };
}
function toPayload(form: ExitInterviewCreateDto): ExitInterviewCreateDto {
    const tenureDays = inclusiveTenureDays(form.admissionOrContractStartDate, form.terminationOrContractEndDate);
    return trimEmpty({
        ...form,
        registrationNumber: undefined,
        companyName: undefined,
        managerName: undefined,
        tenureDays,
        ratings: form.ratings.map((item) => ({ ...item, score: item.score ?? 1 })),
        returnChecklist: form.returnChecklist.map((item) => ({
            ...item,
            returnedAt: item.returnedAt || undefined,
            notes: item.notes || undefined,
        })),
        openAnswers: form.openAnswers.map((item) => ({
            ...item,
            answer: item.answer || undefined,
        })),
    });
}

function validateBeforeSave(form: ExitInterviewCreateDto): string | null {
    if (!form.collaboratorId?.trim()) return "Selecione o colaborador antes de salvar.";
    if (!form.interviewDate) return "Informe a data da entrevista antes de salvar.";
    if (!form.relationshipType) return "Selecione o tipo de vínculo antes de salvar.";
    if (form.terminationType && !form.terminationType.startsWith(`${form.relationshipType}_`)) {
        return "O tipo de desligamento selecionado não é compatível com o vínculo informado.";
    }
    return null;
}

function validateBeforeComplete(form: ExitInterviewCreateDto): string | null {
    if (!form.collaboratorId?.trim()) return "Selecione o colaborador antes de concluir.";
    if (!form.relationshipType) return "Selecione o tipo de vínculo antes de concluir.";
    if (!form.interviewDate) return "Informe a data da entrevista antes de concluir.";
    if (!form.terminationOrContractEndDate) return "Informe a data de desligamento antes de concluir.";
    if (form.admissionOrContractStartDate && form.terminationOrContractEndDate < form.admissionOrContractStartDate) {
        return "A data de desligamento não pode ser anterior à data de admissão.";
    }
    if (!form.terminationType) return "Selecione o tipo de desligamento antes de concluir.";
    if (!form.terminationType.startsWith(`${form.relationshipType}_`)) {
        return "O tipo de desligamento selecionado não é compatível com o vínculo informado.";
    }
    if (!form.interviewerName?.trim()) return "Informe o responsável pela entrevista antes de concluir.";
    if (!form.mainReason) return "Selecione o motivo principal antes de concluir.";
    return null;
}

export function ExitInterviewFormClient() {
    const { data: session } = useSession();
    const { editingId, isEditing, goToList, startCreate, startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ExitInterviewCreateDto>(emptyExitInterviewForm);
    const [error, setError] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
    const emptyDefaults = useMemo(() => emptyExitInterviewForm(), []);
    const detailQuery = useQuery({
        queryKey: exitinterviewKeys.detail(editingId ?? ""),
        queryFn: () => exitinterviewService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const attachmentsQuery = useQuery({
        queryKey: ["storage-links", EXIT_INTERVIEW_ENTITY_TYPE, editingId],
        queryFn: () => storageService.listLinks(EXIT_INTERVIEW_ENTITY_TYPE, editingId!),
        enabled: Boolean(editingId),
    });
    const returnChecklistConfigQuery = useQuery({
        queryKey: exitInterviewReturnChecklistConfigKeys.all,
        queryFn: () => exitInterviewReturnChecklistConfigService.getAll(),
    });
    const clearPendingAttachments = useCallback(() => setPendingAttachments([]), []);

    useEffect(() => {
        if (!isEditing) {
            const next = emptyExitInterviewForm();
            const configuredChecklist = configuredChecklistToReturnItems(returnChecklistConfigQuery.data);
            if (configuredChecklist.length > 0) {
                next.returnChecklist = configuredChecklist;
            }
            setForm(next);
            setError(null);
            setCancelReason("");
            clearPendingAttachments();
            return;
        }

        if (detailQuery.data) {
            setForm(exitinterviewToFormDto(detailQuery.data));
            setError(null);
            setCancelReason(detailQuery.data.cancelReason ?? "");
            clearPendingAttachments();
        }
    }, [isEditing, detailQuery.data, clearPendingAttachments, returnChecklistConfigQuery.data]);

    const isFinal =
        detailQuery.data?.interviewStatus === "COMPLETED" || detailQuery.data?.interviewStatus === "CANCELED";
    const terminationItems = form.relationshipType === "PJ" ? PJ_TERMINATION_ITEMS : CLT_TERMINATION_ITEMS;
    const saveMutation = useMutation({
        mutationFn: async (dto: ExitInterviewCreateDto) => {
            const payload = toPayload(dto);
            let savedId = editingId ?? null;
            if (isEditing && editingId) {
                const updated = await exitinterviewService.update(editingId, payload);
                savedId = updated.id;
            } else {
                const created = await exitinterviewService.create(payload);
                savedId = created.id;
            }
            if (!savedId) throw new Error("Nao foi possivel identificar a entrevista salva.");
            await flushPendingAttachments({
                entityType: EXIT_INTERVIEW_ENTITY_TYPE,
                entityId: savedId,
                linkRole: "DOCUMENT",
                items: pendingAttachments,
            });
            return savedId;
        },
        onSuccess: async (savedId) => {
            clearPendingAttachments();
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.all });
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.detail(savedId) });
            await queryClient.invalidateQueries({ queryKey: ["storage-links", EXIT_INTERVIEW_ENTITY_TYPE, savedId] });
            toast.success(isEditing ? "Entrevista de desligamento salva" : "Entrevista de desligamento cadastrada");
            startEdit(savedId);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: EXITINTERVIEW_CLIENT_MESSAGES.EXITINTERVIEW_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const completeMutation = useMutation({
        mutationFn: async (dto: ExitInterviewCreateDto) => {
            const payload = toPayload(dto);
            const updated = await exitinterviewService.update(editingId!, payload);
            await flushPendingAttachments({
                entityType: EXIT_INTERVIEW_ENTITY_TYPE,
                entityId: updated.id,
                linkRole: "DOCUMENT",
                items: pendingAttachments,
            });
            return exitinterviewService.complete(updated.id);
        },
        onSuccess: async (result) => {
            clearPendingAttachments();
            setForm(exitinterviewToFormDto(result));
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.all });
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.detail(result.id) });
            await queryClient.invalidateQueries({ queryKey: ["storage-links", EXIT_INTERVIEW_ENTITY_TYPE, result.id] });
            toast.success("Entrevista concluida");
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Nao foi possivel concluir a entrevista.",
            });
            setError(ex.displayMessage);
        },
    });
    const cancelMutation = useMutation({
        mutationFn: () => exitinterviewService.cancel(editingId!, { reason: cancelReason || undefined }),
        onSuccess: async (result) => {
            setForm(exitinterviewToFormDto(result));
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.all });
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.detail(result.id) });
            toast.success("Entrevista cancelada");
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Nao foi possivel cancelar a entrevista.",
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends ExitInterviewFormField>(field: K, value: ExitInterviewCreateDto[K]) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "relationshipType") {
                const nextRelationship = value as ExitInterviewRelationshipType;
                if (next.terminationType && !next.terminationType.startsWith(`${nextRelationship}_`)) {
                    next.terminationType = undefined;
                }
            }
            if (field === "admissionOrContractStartDate" || field === "terminationOrContractEndDate") {
                next.tenureDays = inclusiveTenureDays(
                    next.admissionOrContractStartDate,
                    next.terminationOrContractEndDate,
                );
            }
            return next;
        });
    };
    const handleCollaboratorChange = useCallback((collaboratorId: string) => {
        if (!collaboratorId) {
            setForm((prev) => ({
                ...prev,
                collaboratorId: "",
                collaboratorName: "",
                departmentId: "",
                departmentName: "",
                jobPositionId: "",
                jobPositionName: "",
                admissionOrContractStartDate: "",
                tenureDays: inclusiveTenureDays("", prev.terminationOrContractEndDate),
            }));
            return;
        }
        setForm((prev) => ({ ...prev, collaboratorId }));
        void loadCollaboratorExitInterviewContext(collaboratorId)
            .then((ctx) => {
                setForm((prev) => {
                    if (prev.collaboratorId !== collaboratorId) return prev;
                    const admissionOrContractStartDate =
                        ctx.admissionOrContractStartDate ?? prev.admissionOrContractStartDate;
                    const terminationOrContractEndDate =
                        ctx.terminationOrContractEndDate ?? prev.terminationOrContractEndDate;
                    return {
                        ...prev,
                        collaboratorId,
                        collaboratorName: ctx.collaboratorName ?? prev.collaboratorName,
                        relationshipType: ctx.relationshipType ?? prev.relationshipType,
                        departmentId: ctx.departmentId ?? "",
                        departmentName: ctx.departmentName ?? "",
                        jobPositionId: ctx.jobPositionId ?? "",
                        jobPositionName: ctx.jobPositionName ?? "",
                        admissionOrContractStartDate,
                        terminationOrContractEndDate,
                        tenureDays: inclusiveTenureDays(admissionOrContractStartDate, terminationOrContractEndDate),
                    };
                });
            })
            .catch(() => undefined);
    }, []);
    const handleDepartmentChange = useCallback((departmentId: string) => {
        setForm((prev) => ({
            ...prev,
            departmentId,
            departmentName: "",
            jobPositionId: "",
            jobPositionName: "",
        }));
        if (!departmentId) return;
        void departmentService
            .getById(departmentId)
            .then((department) => {
                setForm((prev) =>
                    prev.departmentId === departmentId ? { ...prev, departmentName: department.name } : prev,
                );
            })
            .catch(() => undefined);
    }, []);
    const handleJobPositionChange = useCallback((jobPositionId: string) => {
        setForm((prev) => ({ ...prev, jobPositionId, jobPositionName: "" }));
        if (!jobPositionId) return;
        void jobpositionService
            .getById(jobPositionId)
            .then(async (jobPosition) => {
                const department = jobPosition.departmentId
                    ? await departmentService.getById(jobPosition.departmentId).catch(() => null)
                    : null;
                setForm((prev) => {
                    if (prev.jobPositionId !== jobPositionId) return prev;
                    const departmentId = prev.departmentId || jobPosition.departmentId || "";
                    return {
                        ...prev,
                        jobPositionName: jobPosition.title,
                        departmentId,
                        departmentName: department?.name ?? prev.departmentName,
                    };
                });
            })
            .catch(() => undefined);
    }, []);
    const handleBindCurrentUser = useCallback(() => {
        const currentUserName = session?.user?.name?.trim() || session?.user?.email?.trim() || "";
        if (!currentUserName) {
            toast.error("Não foi possível identificar o usuário logado.");
            return;
        }
        update("interviewerName", currentUserName);
    }, [session?.user?.email, session?.user?.name]);

    const updateRating = (key: string, score: number) => {
        setForm((prev) => ({
            ...prev,
            ratings: prev.ratings.map((item) => (item.key === key ? { ...item, score } : item)),
        }));
    };
    const updateAnswer = (key: string, answer: string) => {
        setForm((prev) => ({
            ...prev,
            openAnswers: prev.openAnswers.map((item) => (item.key === key ? { ...item, answer } : item)),
        }));
    };
    const updateChecklist = <K extends keyof ExitInterviewReturnChecklistItemDto>(
        key: string,
        field: K,
        value: ExitInterviewReturnChecklistItemDto[K],
    ) => {
        setForm((prev) => ({
            ...prev,
            returnChecklist: prev.returnChecklist.map((item) =>
                item.key === key ? { ...item, [field]: value } : item,
            ),
        }));
    };
    const toggleSecondaryReason = (reason: ExitInterviewReason) => {
        setForm((prev) => ({
            ...prev,
            secondaryReasons: prev.secondaryReasons.includes(reason)
                ? prev.secondaryReasons.filter((item) => item !== reason)
                : [...prev.secondaryReasons, reason],
        }));
    };
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const validationMessage = validateBeforeSave(form);
        if (validationMessage) {
            setError(validationMessage);
            toast.error(validationMessage);
            return;
        }
        saveMutation.mutate(form);
    };
    const handleComplete = async () => {
        if (!editingId) return;
        setError(null);
        const validationMessage = validateBeforeComplete(form);
        if (validationMessage) {
            setError(validationMessage);
            toast.error(validationMessage);
            return;
        }
        if (
            !(await SystemAlert.confirm({
                title: "Concluir entrevista",
                message: "Depois de concluida, a entrevista nao podera ser editada.",
                confirmLabel: "Concluir",
                cancelLabel: "Voltar",
                variant: "success",
            }))
        ) {
            return;
        }
        setError(null);
        completeMutation.mutate(form);
    };
    const handleCancelInterview = async () => {
        if (!editingId) return;
        if (
            !(await SystemAlert.confirm({
                title: "Cancelar entrevista",
                message: "A entrevista sera marcada como cancelada e nao podera ser editada.",
                confirmLabel: "Cancelar entrevista",
                cancelLabel: "Voltar",
                variant: "error",
            }))
        ) {
            return;
        }
        setError(null);
        cancelMutation.mutate();
    };
    const filledStepIds = useMemo(() => {
        const filled: string[] = [];
        if (
            sectionHasChanges(form, emptyDefaults, [
                "collaboratorId",
                "interviewDate",
                "relationshipType",
                "terminationType",
                "interviewerName",
            ])
        ) {
            filled.push("dados");
        }
        if (sectionHasChanges(form, emptyDefaults, ["mainReason", "secondaryReasons", "departureReason", "detailedReason"])) {
            filled.push("motivos");
        }
        if (form.ratings.some((item) => (item.score ?? 1) !== 1)) filled.push("avaliacao");
        if (form.openAnswers.some((item) => item.answer?.trim())) filled.push("perguntas");
        if (sectionHasChanges(form, emptyDefaults, ["wouldReturn", "companyWouldRehire", "rehireNotes"])) {
            filled.push("recontratacao");
        }
        if (form.returnChecklist.some((item) => item.status !== "PENDING" || item.returnedAt || item.notes?.trim())) {
            filled.push("devolucoes");
        }
        if ((attachmentsQuery.data?.length ?? 0) > 0 || pendingAttachments.length > 0) filled.push("documentos");
        return filled;
    }, [attachmentsQuery.data, emptyDefaults, form, pendingAttachments.length]);

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        EXITINTERVIEW_CLIENT_MESSAGES.EXITINTERVIEW_LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                filledStepIds,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Voltar
                    </Button>
                    {isEditing ? (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    ) : null}
                    {isEditing && !isFinal ? (
                        <Button
                            type="button"
                            variant="danger"
                            loading={cancelMutation.isPending}
                            onClick={() => void handleCancelInterview()}
                        >
                            Cancelar entrevista
                        </Button>
                    ) : null}
                    {isEditing && !isFinal ? (
                        <Button
                            type="button"
                            variant="success"
                            loading={completeMutation.isPending}
                            onClick={() => void handleComplete()}
                        >
                            Concluir
                        </Button>
                    ) : null}
                    {!isFinal ? (
                        <Button type="submit" loading={saveMutation.isPending}>
                            {isEditing ? "Salvar" : "Cadastrar"}
                        </Button>
                    ) : null}
                </>
            }
        >
            <FormSection id="dados" title="Dados básicos">
                <CollaboratorPickerField
                    value={form.collaboratorId ?? ""}
                    onValueChange={handleCollaboratorChange}
                    wrapperClassName="sm:col-span-6"
                    required
                    disabled={isFinal}
                />
                <InputSelect
                    label="Tipo de vínculo"
                    items={RELATIONSHIP_TYPE_ITEMS}
                    value={form.relationshipType}
                    onValueChange={(v) => update("relationshipType", v as ExitInterviewRelationshipType)}
                    wrapperClassName="sm:col-span-2"
                    required
                    disabled={isFinal}
                />
                <InputSelect
                    label="Status"
                    items={EXIT_INTERVIEW_STATUS_ITEMS}
                    value={form.interviewStatus}
                    onValueChange={(v) => update("interviewStatus", v as ExitInterviewCreateDto["interviewStatus"])}
                    wrapperClassName="sm:col-span-2"
                    required
                    disabled={isFinal}
                />
                <InputDate
                    label="Data da entrevista"
                    value={form.interviewDate ?? ""}
                    onValueChange={(v) => update("interviewDate", v)}
                    wrapperClassName="sm:col-span-2"
                    required
                    disabled={isFinal}
                />
                <DepartmentPickerField
                    value={form.departmentId ?? ""}
                    onValueChange={handleDepartmentChange}
                    wrapperClassName="sm:col-span-4"
                    disabled={isFinal}
                />
                <JobPositionPickerField
                    value={form.jobPositionId ?? ""}
                    departmentId={form.departmentId}
                    onValueChange={handleJobPositionChange}
                    wrapperClassName="sm:col-span-4"
                    disabled={isFinal}
                />
                <div className="grid gap-2 sm:col-span-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <InputAutocomplete
                        label="Responsável pela entrevista"
                        value={form.interviewerName ?? ""}
                        selectedLabel={form.interviewerName ?? ""}
                        onValueChange={(v) => update("interviewerName", v)}
                        onSearch={searchTenantUsers}
                        placeholder="Buscar usuário"
                        required
                        disabled={isFinal}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-[var(--gommo-control-h)] whitespace-nowrap"
                        leftIcon={<UserRoundCheck className="size-4" />}
                        disabled={isFinal}
                        onClick={handleBindCurrentUser}
                    >
                        Me Vincular
                    </Button>
                </div>
                <InputDate
                    label={form.relationshipType === "PJ" ? "Início do contrato" : "Data de admissão"}
                    value={form.admissionOrContractStartDate ?? ""}
                    onValueChange={(v) => update("admissionOrContractStartDate", v)}
                    wrapperClassName="sm:col-span-3"
                    disabled={isFinal}
                />
                <InputDate
                    label={form.relationshipType === "PJ" ? "Encerramento do contrato" : "Data de desligamento"}
                    value={form.terminationOrContractEndDate ?? ""}
                    onValueChange={(v) => update("terminationOrContractEndDate", v)}
                    wrapperClassName="sm:col-span-3"
                    required
                    disabled={isFinal}
                />
                <InputNumber
                    label="Tempo em dias"
                    value={
                        form.tenureDays ??
                        inclusiveTenureDays(form.admissionOrContractStartDate, form.terminationOrContractEndDate) ??
                        null
                    }
                    onValueChange={(v) => update("tenureDays", v ?? undefined)}
                    wrapperClassName="sm:col-span-2"
                    integer
                    readOnly
                />
                <InputSelect
                    label={form.relationshipType === "PJ" ? "Tipo de encerramento" : "Tipo de desligamento"}
                    items={terminationItems}
                    value={form.terminationType ?? ""}
                    onValueChange={(v) => update("terminationType", (v || undefined) as ExitInterviewTerminationType)}
                    placeholder="Selecione"
                    wrapperClassName="sm:col-span-4"
                    required
                    disabled={isFinal}
                />
            </FormSection>
            <FormSection id="motivos" title="Motivos do desligamento">
                <InputSelect
                    label="Motivo principal"
                    items={EXIT_REASON_ITEMS}
                    value={form.mainReason ?? ""}
                    onValueChange={(v) => update("mainReason", (v || undefined) as ExitInterviewReason)}
                    placeholder="Selecione"
                    wrapperClassName="sm:col-span-4"
                    required
                    disabled={isFinal}
                />
                <InputString
                    label="Motivo resumido"
                    value={form.departureReason ?? ""}
                    onValueChange={(v) => update("departureReason", v)}
                    wrapperClassName="sm:col-span-8"
                    disabled={isFinal}
                />
                <section className="sm:col-span-12 rounded-lg border border-base-300/70 bg-base-100 p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-base-content">Motivos secundários</h4>
                        <span className="text-xs text-base-content/55">
                            {form.secondaryReasons.length} selecionado(s)
                        </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                        {EXIT_REASON_ITEMS.map((item) => (
                            <InputCheckbox
                                key={item.value}
                                size="xs"
                                checked={form.secondaryReasons.includes(item.value as ExitInterviewReason)}
                                disabled={isFinal}
                                onChange={() => toggleSecondaryReason(item.value as ExitInterviewReason)}
                                label={item.label}
                                className="min-h-9 rounded-lg border border-base-300/50 bg-base-200/20 px-3 py-2 transition-colors hover:bg-base-200/40"
                                labelClassName="text-sm text-base-content/75"
                            />
                        ))}
                    </div>
                </section>
                <TextAreaField
                    label="Descricao detalhada"
                    value={form.detailedReason ?? ""}
                    onValueChange={(v) => update("detailedReason", v)}
                    wrapperClassName="sm:col-span-12"
                    disabled={isFinal}
                />
            </FormSection>
            <FormSection id="avaliacao" title="Avaliação da empresa">
                {form.ratings.map((item) => (
                    <RatingField
                        key={item.key}
                        label={item.label}
                        name={`exit-interview-rating-${item.key}`}
                        value={item.score}
                        onValueChange={(value) => updateRating(item.key, value)}
                        wrapperClassName="sm:col-span-4 xl:col-span-3"
                        disabled={isFinal}
                    />
                ))}
            </FormSection>
            <FormSection id="perguntas" title="Perguntas abertas">
                {form.openAnswers.map((item) => (
                    <TextAreaField
                        key={item.key}
                        label={item.question}
                        value={item.answer ?? ""}
                        onValueChange={(v) => updateAnswer(item.key, v)}
                        wrapperClassName="sm:col-span-6"
                        disabled={isFinal}
                    />
                ))}
            </FormSection>
            <FormSection id="recontratacao" title="Recontratação">
                <InputSelect
                    label={
                        form.relationshipType === "PJ"
                            ? "Prestador aceitaria retornar?"
                            : "Colaborador aceitaria retornar?"
                    }
                    items={REHIRE_ANSWER_ITEMS}
                    value={form.wouldReturn ?? ""}
                    onValueChange={(v) =>
                        update("wouldReturn", (v || undefined) as ExitInterviewCreateDto["wouldReturn"])
                    }
                    wrapperClassName="sm:col-span-3"
                    placeholder="Selecione"
                    clearable
                    disabled={isFinal}
                />
                <InputSelect
                    label="Empresa recontrataria?"
                    items={REHIRE_ANSWER_ITEMS}
                    value={form.companyWouldRehire ?? ""}
                    onValueChange={(v) =>
                        update("companyWouldRehire", (v || undefined) as ExitInterviewCreateDto["companyWouldRehire"])
                    }
                    wrapperClassName="sm:col-span-3"
                    placeholder="Selecione"
                    clearable
                    disabled={isFinal}
                />
                <InputSelect
                    label="Indicaria a empresa?"
                    items={YES_NO_RECOMMEND_ITEMS}
                    value={form.wouldRecommend == null ? "" : String(form.wouldRecommend)}
                    onValueChange={(v) => update("wouldRecommend", v === "" ? undefined : v === "true")}
                    wrapperClassName="sm:col-span-3"
                    placeholder="Selecione"
                    clearable
                    disabled={isFinal}
                />
                <TextAreaField
                    label="Observações sobre recontratação"
                    value={form.rehireNotes ?? ""}
                    onValueChange={(v) => update("rehireNotes", v)}
                    wrapperClassName="sm:col-span-12"
                    disabled={isFinal}
                />
            </FormSection>
            <FormSection id="devolucoes" title="Checklist de devoluções" bodyClassName="!block">
                <div className="overflow-hidden rounded-lg border border-base-300/70 bg-base-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead className="border-b border-base-300/70 bg-base-200/40 text-left text-xs font-semibold uppercase text-base-content/55">
                                <tr>
                                    <th className="px-3 py-2">Item</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Data da devolução</th>
                                    <th className="px-3 py-2">Observação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-300/60">
                                {form.returnChecklist.length === 0 ? (
                                    <tr>
                                        <td className="px-3 py-4 text-sm text-base-content/60" colSpan={4}>
                                            Nenhum item configurado.
                                        </td>
                                    </tr>
                                ) : (
                                    form.returnChecklist.map((item) => (
                                        <tr key={item.key} className="align-top">
                                            <td className="px-3 py-2 font-medium text-base-content">
                                                {item.description}
                                            </td>
                                            <td className="px-3 py-2 align-top">
                                                <InputSelect
                                                    items={RETURN_STATUS_ITEMS}
                                                    value={item.status ?? "PENDING"}
                                                    onValueChange={(value) =>
                                                        updateChecklist(item.key, "status", value as ReturnItemStatus)
                                                    }
                                                    wrapperClassName="min-w-40"
                                                    disabled={isFinal}
                                                />
                                            </td>
                                            <td className="px-3 py-2 align-top">
                                                <InputDate
                                                    value={item.returnedAt ?? ""}
                                                    onValueChange={(value) =>
                                                        updateChecklist(item.key, "returnedAt", value)
                                                    }
                                                    wrapperClassName="min-w-44"
                                                    disabled={isFinal}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    className={clsx(
                                                        "gommo-control h-10 w-full px-3 text-sm",
                                                        fieldClass(isFinal),
                                                    )}
                                                    value={item.notes ?? ""}
                                                    disabled={isFinal}
                                                    onChange={(event) =>
                                                        updateChecklist(item.key, "notes", event.target.value)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {isEditing && !isFinal ? (
                    <InputString
                        label="Motivo do cancelamento"
                        value={cancelReason}
                        onValueChange={setCancelReason}
                        wrapperClassName="mt-4 sm:col-span-12"
                    />
                ) : null}
            </FormSection>
            <FormSection
                id="documentos"
                title="Documentos"
                description="Anexos vinculados a entrevista de desligamento."
                bodyClassName="!block"
            >
                <EntityAttachments
                    entityType={EXIT_INTERVIEW_ENTITY_TYPE}
                    entityId={editingId}
                    documentTypeItems={EXIT_INTERVIEW_DOCUMENT_TYPE_ITEMS}
                    deferUpload
                    pendingAttachments={pendingAttachments}
                    onPendingAttachmentsChange={setPendingAttachments}
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
