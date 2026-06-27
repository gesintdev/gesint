"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
    ExitInterviewCreateDto,
    ExitInterviewReason,
    ExitInterviewRelationshipType,
    ExitInterviewReturnChecklistItemDto,
    ExitInterviewTerminationType,
    ReturnItemStatus,
} from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";
import { EXITINTERVIEW_CLIENT_MESSAGES } from "@/modules/rh/person/exitinterview/exceptions/exit-interview.messages";
import { exitinterviewKeys } from "@/modules/rh/person/exitinterview/exitinterview.query";
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
import { InputDate, InputNumber, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { ExceptionCapture } from "@/shared/exceptions";
import { sectionHasChanges } from "@/shared/lib/form-step.util";
import { SystemAlert } from "@/shared/system-alert";

const EXIT_INTERVIEW_ENTITY_TYPE = "exit_interview";
const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Dados" },
    { id: "motivos", label: "Motivos" },
    { id: "avaliacao", label: "Avaliacao" },
    { id: "perguntas", label: "Perguntas" },
    { id: "recontratacao", label: "Recontratacao" },
    { id: "devolucoes", label: "Devolucoes" },
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

function toPayload(form: ExitInterviewCreateDto): ExitInterviewCreateDto {
    const tenureDays = inclusiveTenureDays(form.admissionOrContractStartDate, form.terminationOrContractEndDate);
    return trimEmpty({
        ...form,
        tenureDays,
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

export function ExitInterviewFormClient() {
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
    const clearPendingAttachments = useCallback(() => setPendingAttachments([]), []);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyExitInterviewForm());
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
    }, [isEditing, detailQuery.data, clearPendingAttachments]);

    const isFinal = detailQuery.data?.interviewStatus === "COMPLETED" || detailQuery.data?.interviewStatus === "CANCELED";
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
        mutationFn: () => exitinterviewService.complete(editingId!),
        onSuccess: async (result) => {
            setForm(exitinterviewToFormDto(result));
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.all });
            await queryClient.invalidateQueries({ queryKey: exitinterviewKeys.detail(result.id) });
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
                next.tenureDays = inclusiveTenureDays(next.admissionOrContractStartDate, next.terminationOrContractEndDate);
            }
            return next;
        });
    };

    const updateRating = (key: string, score: number | null) => {
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
        saveMutation.mutate(form);
    };

    const handleComplete = async () => {
        if (!editingId) return;
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
        completeMutation.mutate();
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
        if (sectionHasChanges(form, emptyDefaults, ["mainReason", "secondaryReasons", "detailedReason"])) {
            filled.push("motivos");
        }
        if (form.ratings.some((item) => item.score != null)) filled.push("avaliacao");
        if (form.openAnswers.some((item) => item.answer?.trim())) filled.push("perguntas");
        if (sectionHasChanges(form, emptyDefaults, ["wouldReturn", "companyWouldRehire", "rehireNotes"])) {
            filled.push("recontratacao");
        }
        if (
            form.returnChecklist.some(
                (item) => item.status !== "PENDING" || item.returnedAt || item.notes?.trim(),
            )
        ) {
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
            <FormSection id="dados" title="Dados basicos">
                <div className="sm:col-span-6">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                    />
                </div>
                <InputSelect
                    label="Tipo de vinculo"
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
                <InputString
                    label={form.relationshipType === "PJ" ? "Prestador" : "Colaborador"}
                    value={form.collaboratorName ?? ""}
                    onValueChange={(v) => update("collaboratorName", v)}
                    wrapperClassName="sm:col-span-4"
                    disabled={isFinal}
                />
                <InputString
                    label="Matricula"
                    value={form.registrationNumber ?? ""}
                    onValueChange={(v) => update("registrationNumber", v)}
                    wrapperClassName="sm:col-span-2"
                    disabled={isFinal}
                />
                <InputString
                    label="Cargo/funcao"
                    value={form.jobPositionName ?? ""}
                    onValueChange={(v) => update("jobPositionName", v)}
                    wrapperClassName="sm:col-span-3"
                    disabled={isFinal}
                />
                <InputString
                    label="Departamento/setor"
                    value={form.departmentName ?? ""}
                    onValueChange={(v) => update("departmentName", v)}
                    wrapperClassName="sm:col-span-3"
                    disabled={isFinal}
                />
                <InputString
                    label="Empresa/unidade"
                    value={form.companyName ?? ""}
                    onValueChange={(v) => update("companyName", v)}
                    wrapperClassName="sm:col-span-4"
                    disabled={isFinal}
                />
                <InputString
                    label="Gestor/responsavel"
                    value={form.managerName ?? ""}
                    onValueChange={(v) => update("managerName", v)}
                    wrapperClassName="sm:col-span-4"
                    disabled={isFinal}
                />
                <InputString
                    label="Responsavel pela entrevista"
                    value={form.interviewerName ?? ""}
                    onValueChange={(v) => update("interviewerName", v)}
                    wrapperClassName="sm:col-span-4"
                    required
                    disabled={isFinal}
                />
                <InputDate
                    label={form.relationshipType === "PJ" ? "Inicio do contrato" : "Data de admissao"}
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
                    disabled={isFinal}
                />
                <InputNumber
                    label="Tempo em dias"
                    value={form.tenureDays ?? inclusiveTenureDays(form.admissionOrContractStartDate, form.terminationOrContractEndDate) ?? null}
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
                    clearable
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
                    clearable
                    disabled={isFinal}
                />
                <InputString
                    label="Motivo resumido"
                    value={form.departureReason ?? ""}
                    onValueChange={(v) => update("departureReason", v)}
                    wrapperClassName="sm:col-span-8"
                    disabled={isFinal}
                />
                <div className="sm:col-span-12">
                    <span className="gommo-label">Motivos secundarios</span>
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                        {EXIT_REASON_ITEMS.map((item) => (
                            <label key={item.value} className="flex items-center gap-2 text-sm text-base-content/75">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs"
                                    checked={form.secondaryReasons.includes(item.value as ExitInterviewReason)}
                                    disabled={isFinal}
                                    onChange={() => toggleSecondaryReason(item.value as ExitInterviewReason)}
                                />
                                <span>{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <TextAreaField
                    label="Descricao detalhada"
                    value={form.detailedReason ?? ""}
                    onValueChange={(v) => update("detailedReason", v)}
                    wrapperClassName="sm:col-span-12"
                    disabled={isFinal}
                />
            </FormSection>

            <FormSection id="avaliacao" title="Avaliacao da empresa">
                {form.ratings.map((item) => (
                    <InputNumber
                        key={item.key}
                        label={item.label}
                        value={item.score ?? null}
                        onValueChange={(v) => updateRating(item.key, v)}
                        wrapperClassName="sm:col-span-3"
                        integer
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

            <FormSection id="recontratacao" title="Recontratacao">
                <InputSelect
                    label={form.relationshipType === "PJ" ? "Prestador aceitaria retornar?" : "Colaborador aceitaria retornar?"}
                    items={REHIRE_ANSWER_ITEMS}
                    value={form.wouldReturn ?? ""}
                    onValueChange={(v) => update("wouldReturn", (v || undefined) as ExitInterviewCreateDto["wouldReturn"])}
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
                    label="Observacoes sobre recontratacao"
                    value={form.rehireNotes ?? ""}
                    onValueChange={(v) => update("rehireNotes", v)}
                    wrapperClassName="sm:col-span-12"
                    disabled={isFinal}
                />
            </FormSection>

            <FormSection id="devolucoes" title="Checklist de devolucoes">
                <div className="grid gap-3 sm:col-span-12">
                    {form.returnChecklist.map((item) => (
                        <div key={item.key} className="grid gap-3 rounded-lg border border-base-300 p-3 sm:grid-cols-12">
                            <InputString
                                label="Item"
                                value={item.description ?? ""}
                                onValueChange={(v) => updateChecklist(item.key, "description", v)}
                                wrapperClassName="sm:col-span-3"
                                disabled={isFinal}
                            />
                            <InputSelect
                                label="Status"
                                items={RETURN_STATUS_ITEMS}
                                value={item.status ?? "PENDING"}
                                onValueChange={(v) => updateChecklist(item.key, "status", v as ReturnItemStatus)}
                                wrapperClassName="sm:col-span-3"
                                disabled={isFinal}
                            />
                            <InputDate
                                label="Data da devolucao"
                                value={item.returnedAt ?? ""}
                                onValueChange={(v) => updateChecklist(item.key, "returnedAt", v)}
                                wrapperClassName="sm:col-span-2"
                                disabled={isFinal}
                            />
                            <InputString
                                label="Observacao"
                                value={item.notes ?? ""}
                                onValueChange={(v) => updateChecklist(item.key, "notes", v)}
                                wrapperClassName="sm:col-span-4"
                                disabled={isFinal}
                            />
                        </div>
                    ))}
                </div>
                {isEditing && !isFinal ? (
                    <InputString
                        label="Motivo do cancelamento"
                        value={cancelReason}
                        onValueChange={setCancelReason}
                        wrapperClassName="sm:col-span-12"
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