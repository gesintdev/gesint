"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {type SubmitEvent, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {exitInterviewReturnChecklistConfigService} from "@/modules/cfg/settings/exitinterviewchecklist/services/exit-interview-return-checklist-config.service";
import type {OffboardingChecklistItemDto, OffboardingCreateDto} from "@/modules/dp/offboarding/dto/offboarding.dto";
import {OFFBOARDING_CLIENT_MESSAGES} from "@/modules/dp/offboarding/exceptions/offboarding.messages";
import {
    emptyOffboardingForm,
    mergeExitChecklist,
    offboardingToFormDto,
    toOffboardingPayload,
} from "@/modules/dp/offboarding/lib/offboarding.mapper";
import {
    ACCOUNTANT_PACKAGE_STATUS_LABELS,
    CHECKLIST_STATUS_ITEMS,
    NOTICE_TYPE_ITEMS,
    NOTICE_TYPE_LABELS,
    PROCESS_STATUS_LABELS,
} from "@/modules/dp/offboarding/lib/offboarding.options";
import {offboardingKeys} from "@/modules/dp/offboarding/offboarding.query";
import {offboardingService} from "@/modules/dp/offboarding/services/offboarding.service";
import {exitinterviewKeys} from "@/modules/rh/person/exitinterview/exitinterview.query";
import {exitinterviewService} from "@/modules/rh/person/exitinterview/services/exit-interview.service";
import {collaboratorKeys} from "@/modules/rh/person/collaborators/people/collaborator.query";
import {storageService} from "@/modules/storage/services/storage.service";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useTrackedCrudFormDirty} from "@/shared/components/crud/useTrackedCrudFormDirty";
import {EntityAttachments} from "@/shared/components/storage/EntityAttachments";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputDate, InputInfo, InputSelect, InputString} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";
import {useBranchScopedDetailQuery} from "@/shared/hooks/useBranchScopedDetailQuery";
import {sectionHasChanges} from "@/shared/lib/form-step.util";
import {SystemAlert} from "@/shared/system-alert";
import {findRouteById} from "@/shared/workspace/workspace-routes";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";

const OFFBOARDING_FORM_STEPS: FormStepNavItem[] = [
    {id: "desligamento", label: "Desligamento"},
    {id: "aviso", label: "Aviso prévio"},
    {id: "exame", label: "Exame demissional"},
    {id: "checklist", label: "Checklist"},
    {id: "entrevista", label: "Entrevista"},
    {id: "contador", label: "Contador"},
    {id: "documentos", label: "Documentos"},
];

export function OffboardingFormClient() {
    const {editingId, isEditing, goToList, startCreate, showSavedRecord} = useCrudScreen();
    const queryClient = useQueryClient();
    const {openRouteRecord, openRouteCreate} = useWorkspaceNavigation();
    const [form, setForm] = useState<OffboardingCreateDto>(emptyOffboardingForm);
    const [error, setError] = useState<string | null>(null);
    const [waiverNotes, setWaiverNotes] = useState("");
    const emptyDefaults = useMemo(() => emptyOffboardingForm(), []);

    const detailQuery = useBranchScopedDetailQuery(
        offboardingKeys.detail(editingId ?? ""),
        () => offboardingService.getById(editingId!),
        {enabled: isEditing && Boolean(editingId)},
    );

    const isCompleted = detailQuery.data?.processStatus === "COMPLETED";
    const readOnly = isCompleted;

    const attachmentsQuery = useQuery({
        queryKey: ["storage-links", "offboarding", editingId],
        queryFn: () => storageService.listLinks("offboarding", editingId!),
        enabled: Boolean(editingId),
    });

    const reasonsQuery = useQuery({
        queryKey: [...offboardingKeys.all, "esocial-reasons"],
        queryFn: () => offboardingService.listEsocialDismissalReasons(),
    });

    const checklistConfigQuery = useQuery({
        queryKey: ["exit-interview-return-checklist-items"],
        queryFn: () => exitInterviewReturnChecklistConfigService.getAll(),
    });

    const demissionalQuery = useQuery({
        queryKey: [...offboardingKeys.detail(editingId ?? ""), "demissional"],
        queryFn: () => offboardingService.demissionalPreview(editingId!),
        enabled: Boolean(editingId),
    });

    const packageQuery = useQuery({
        queryKey: [...offboardingKeys.detail(editingId ?? ""), "accountant-package"],
        queryFn: () => offboardingService.accountantPackagePreview(editingId!),
        enabled: Boolean(editingId),
    });

    const interviewsQuery = useQuery({
        queryKey: [...exitinterviewKeys.all, "for-collaborator", form.collaboratorId],
        queryFn: () => exitinterviewService.getAll(),
        enabled: Boolean(form.collaboratorId),
    });

    const linkedInterviewQuery = useBranchScopedDetailQuery(
        exitinterviewKeys.detail(form.exitInterviewId ?? ""),
        () => exitinterviewService.getById(form.exitInterviewId!),
        {enabled: Boolean(form.exitInterviewId)},
    );

    useEffect(() => {
        if (!isEditing) {
            setForm({
                ...emptyOffboardingForm(),
                exitChecklist: mergeExitChecklist([], checklistConfigQuery.data),
            });
            setError(null);
            setWaiverNotes("");
            return;
        }

        if (detailQuery.data) {
            const next = offboardingToFormDto(detailQuery.data);
            next.exitChecklist = mergeExitChecklist(next.exitChecklist, checklistConfigQuery.data);
            setForm(next);
            setWaiverNotes(detailQuery.data.demissionalWaiverNotes ?? "");
            setError(null);
        }
    }, [isEditing, detailQuery.data, editingId, checklistConfigQuery.data]);

    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: offboardingToFormDto,
        getEmptyForm: () => emptyOffboardingForm(),
    });

    const reasonItems = useMemo(
        () =>
            (reasonsQuery.data ?? []).map((reason) => ({
                value: reason.reasonCode,
                label: reason.label || `${reason.reasonCode} · ${reason.description}`,
            })),
        [reasonsQuery.data],
    );

    const interviewItems = useMemo(() => {
        const rows = (interviewsQuery.data ?? []).filter(
            (row) => row.collaboratorId === form.collaboratorId,
        );
        return rows.map((row) => ({
            value: row.id,
            label: `#${row.code} · ${row.interviewDate?.slice(0, 10) ?? "—"} · ${row.interviewStatus}`,
        }));
    }, [interviewsQuery.data, form.collaboratorId]);

    const saveMutation = useMutation({
        mutationFn: async (dto: OffboardingCreateDto) => {
            const payload = toOffboardingPayload(dto);
            if (isEditing && editingId) return offboardingService.update(editingId, payload);
            return offboardingService.create(payload);
        },
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({queryKey: offboardingKeys.all});
            await queryClient.invalidateQueries({queryKey: collaboratorKeys.all});
            await queryClient.invalidateQueries({queryKey: offboardingKeys.detail(result.id)});
            toast.success(isEditing ? "Rascunho salvo" : "Desligamento criado como rascunho");
            void showSavedRecord(result.id, result);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OFFBOARDING_CLIENT_MESSAGES.OFFBOARDING_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const concludeMutation = useMutation({
        mutationFn: async () => {
            if (!editingId) throw new Error("Salve o rascunho antes de concluir");
            await offboardingService.update(editingId, toOffboardingPayload(form));
            return offboardingService.conclude(editingId);
        },
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({queryKey: offboardingKeys.all});
            await queryClient.invalidateQueries({queryKey: collaboratorKeys.all});
            await queryClient.invalidateQueries({queryKey: offboardingKeys.detail(result.id)});
            toast.success("Desligamento concluído");
            void showSavedRecord(result.id, result);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível concluir o desligamento",
            });
            setError(ex.displayMessage);
        },
    });

    const waiverMutation = useMutation({
        mutationFn: async () => {
            if (!editingId) throw new Error("Salve o rascunho antes de registrar a dispensa");
            return offboardingService.registerDemissionalWaiver(editingId, waiverNotes);
        },
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({queryKey: offboardingKeys.detail(result.id)});
            toast.success("Dispensa do exame demissional registrada");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível registrar a dispensa"});
        },
    });

    const packageMutation = useMutation({
        mutationFn: async () => {
            if (!editingId) throw new Error("Salve o rascunho antes de gerar o pacote");
            return offboardingService.sendAccountantPackage(editingId);
        },
        onSuccess: async () => {
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: [...offboardingKeys.detail(editingId), "accountant-package"],
                });
                await queryClient.invalidateQueries({queryKey: offboardingKeys.detail(editingId)});
            }
            toast.success("Pacote do contador atualizado");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível montar/enviar o pacote"});
        },
    });

    const update = <K extends keyof OffboardingCreateDto>(field: K, value: OffboardingCreateDto[K]) => {
        setForm((prev) => {
            const next = {...prev, [field]: value};
            if (field === "lastWorkDay" && typeof value === "string") {
                next.dismissalDate = value;
            }
            return next;
        });
    };

    const updateChecklist = (
        key: string,
        field: keyof OffboardingChecklistItemDto,
        value: string,
    ) => {
        setForm((prev) => ({
            ...prev,
            exitChecklist: prev.exitChecklist.map((item) =>
                item.key === key ? {...item, [field]: value} : item,
            ),
        }));
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (readOnly) return;
        setError(null);
        saveMutation.mutate(form);
    };

    const handleConclude = async () => {
        if (!editingId) {
            toast.message("Salve o rascunho antes de concluir");
            return;
        }
        if (!form.esocialDismissalReasonCode?.trim() || !form.lastWorkDay?.trim()) {
            toast.error("Informe o motivo eSocial e o último dia trabalhado");
            return;
        }
        const confirmed = await SystemAlert.confirm({
            title: "Concluir desligamento",
            message:
                "Ao concluir, o colaborador será inativado, o exame demissional e a posição vaga serão disparados, e o pacote ao contador será preparado. Continuar?",
            confirmLabel: "Concluir",
        });
        if (!confirmed) return;
        setError(null);
        concludeMutation.mutate();
    };

    const openExitInterview = () => {
        const route = findRouteById("exit-interview");
        if (!route) {
            toast.error("Módulo de entrevista de desligamento não encontrado");
            return;
        }
        if (form.exitInterviewId) {
            openRouteRecord(route, form.exitInterviewId, {
                titleSuffix: linkedInterviewQuery.data?.collaboratorName,
                shortLabel: "Entrev",
            });
            return;
        }
        openRouteCreate(route, "Entrev");
    };

    const filledStepIds = useMemo(() => {
        const empty = emptyDefaults;
        const filled: string[] = [];
        if (
            sectionHasChanges(form, empty, [
                "collaboratorId",
                "lastWorkDay",
                "esocialDismissalReasonCode",
                "dismissalNotes",
                "homologationNotes",
            ])
        ) {
            filled.push("desligamento");
        }
        if (form.noticeType || form.noticeDays != null) {
            filled.push("aviso");
        }
        if (demissionalQuery.data || form.demissionalWaiverRegistered) {
            filled.push("exame");
        }
        if (form.exitChecklist.some((item) => item.status !== "PENDING" || item.notes?.trim())) {
            filled.push("checklist");
        }
        if (form.exitInterviewId) {
            filled.push("entrevista");
        }
        if (packageQuery.data?.packageStatus && packageQuery.data.packageStatus !== "PENDING") {
            filled.push("contador");
        }
        if ((attachmentsQuery.data?.length ?? 0) > 0) {
            filled.push("documentos");
        }
        return filled;
    }, [form, emptyDefaults, attachmentsQuery.data, demissionalQuery.data, packageQuery.data]);

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    const processLabel =
        PROCESS_STATUS_LABELS[detailQuery.data?.processStatus ?? "DRAFT"] ?? "Rascunho";
    const demissional = demissionalQuery.data;
    const pack = packageQuery.data;

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: OFFBOARDING_FORM_STEPS,
                filledStepIds,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="outline" onClick={startCreate}>
                        Novo cadastro
                    </Button>
                    {!readOnly ? (
                        <Button type="submit" loading={saveMutation.isPending}>
                            Salvar
                        </Button>
                    ) : null}
                    {!readOnly && isEditing ? (
                        <Button
                            type="button"
                            loading={concludeMutation.isPending}
                            onClick={() => void handleConclude()}
                        >
                            Concluir desligamento
                        </Button>
                    ) : null}
                </>
            }
        >
            {isEditing ? (
                <p className="sm:col-span-12 text-sm text-base-content/70">
                    Status do processo: <span className="font-medium text-base-content">{processLabel}</span>
                    {detailQuery.data?.esocialDismissalReasonLabel
                        ? ` · ${detailQuery.data.esocialDismissalReasonCode} · ${detailQuery.data.esocialDismissalReasonLabel}`
                        : null}
                </p>
            ) : null}

            <FormSection
                id="desligamento"
                title="Desligamento"
                description="Colaborador, motivo eSocial (Tabela 19) e último dia trabalhado."
            >
                <div className="sm:col-span-8">
                    <CollaboratorPickerField
                        value={form.collaboratorId}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                        disabled={readOnly || isEditing}
                    />
                </div>
                <InputDate
                    label="Último dia trabalhado"
                    value={form.lastWorkDay ?? ""}
                    onValueChange={(v) => update("lastWorkDay", v)}
                    wrapperClassName="sm:col-span-2"
                    required
                    disabled={readOnly}
                />
                <InputSelect
                    label="Motivo eSocial (mtvDeslig)"
                    items={reasonItems}
                    value={form.esocialDismissalReasonCode ?? ""}
                    onValueChange={(v) => update("esocialDismissalReasonCode", v || undefined)}
                    placeholder="Selecione"
                    wrapperClassName="sm:col-span-2"
                    clearable
                    disabled={readOnly}
                    required
                />
                <InputString
                    label="Observações do desligamento"
                    value={form.dismissalNotes ?? ""}
                    onValueChange={(v) => update("dismissalNotes", v)}
                    wrapperClassName="sm:col-span-12"
                    disabled={readOnly}
                />
                <InputString
                    label="Observações da homologação (opcional)"
                    value={form.homologationNotes ?? ""}
                    onValueChange={(v) => update("homologationNotes", v)}
                    wrapperClassName="sm:col-span-12"
                    disabled={readOnly}
                />
            </FormSection>

            <FormSection
                id="aviso"
                title="Aviso prévio"
                description="Tipo editável; dias e datas são calculados no servidor conforme o motivo e o tempo de casa."
            >
                <InputSelect
                    label="Tipo de aviso"
                    items={NOTICE_TYPE_ITEMS}
                    value={form.noticeType ?? ""}
                    onValueChange={(v) =>
                        update("noticeType", (v || undefined) as OffboardingCreateDto["noticeType"])
                    }
                    placeholder="Automático"
                    wrapperClassName="sm:col-span-3"
                    clearable
                    disabled={readOnly}
                />
                <InputInfo
                    label="Dias de aviso"
                    value={form.noticeDays != null ? String(form.noticeDays) : "—"}
                    wrapperClassName="sm:col-span-2"
                />
                <InputInfo
                    label="Início do aviso"
                    value={form.noticeStartDate || "—"}
                    wrapperClassName="sm:col-span-2"
                />
                <InputInfo
                    label="Fim do aviso"
                    value={form.noticeEndDate || "—"}
                    wrapperClassName="sm:col-span-2"
                />
                <InputInfo
                    label="Redução de jornada (CLT 488)"
                    value={form.workloadReductionApplicable ? "Aplicável" : "Não se aplica"}
                    wrapperClassName="sm:col-span-3"
                />
                {form.noticeType ? (
                    <p className="sm:col-span-12 text-xs text-base-content/60">
                        Tipo atual: {NOTICE_TYPE_LABELS[form.noticeType] ?? form.noticeType}. Salve para
                        recalcular dias e datas.
                    </p>
                ) : (
                    <p className="sm:col-span-12 text-xs text-base-content/60">
                        Salve o rascunho com motivo eSocial e último dia para calcular o aviso.
                    </p>
                )}
            </FormSection>

            <FormSection
                id="exame"
                title="Exame demissional"
                description="Status conforme NR-7. Não bloqueia a conclusão do desligamento."
                bodyClassName="!block"
            >
                {!editingId ? (
                    <p className="text-sm text-base-content/65">
                        Salve o rascunho para avaliar a dispensa ou a pendência do exame demissional.
                    </p>
                ) : demissionalQuery.isLoading ? (
                    <div className="skeleton-shimmer h-20 w-full" />
                ) : demissional ? (
                    <div className="space-y-3 rounded-lg border border-base-300/70 bg-base-100 p-4">
                        <p className="text-sm font-medium text-base-content">
                            {demissional.waived ? "Dispensável" : "Pendente"}
                        </p>
                        <p className="text-sm text-base-content/75">{demissional.message}</p>
                        <div className="grid gap-2 text-xs text-base-content/60 sm:grid-cols-3">
                            <span>
                                Último exame clínico: {demissional.lastClinicalExamDate?.slice(0, 10) || "—"}
                            </span>
                            <span>Prazo (10 dias): {demissional.dueDate?.slice(0, 10) || "—"}</span>
                            <span>Grau de risco: {demissional.riskGrade ?? "—"}</span>
                        </div>
                        {demissional.waiverRegistered || form.demissionalWaiverRegistered ? (
                            <p className="text-sm text-success">
                                Dispensa registrada
                                {demissional.waiverNotes || form.demissionalWaiverNotes
                                    ? `: ${demissional.waiverNotes || form.demissionalWaiverNotes}`
                                    : ""}
                            </p>
                        ) : !readOnly && demissional.waived ? (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <InputString
                                    label="Evidência da dispensa"
                                    value={waiverNotes}
                                    onValueChange={setWaiverNotes}
                                    wrapperClassName="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    loading={waiverMutation.isPending}
                                    onClick={() => waiverMutation.mutate()}
                                >
                                    Registrar dispensa
                                </Button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <p className="text-sm text-base-content/65">Prévia indisponível.</p>
                )}
            </FormSection>

            <FormSection
                id="checklist"
                title="Checklist de saída"
                description="Itens de devolução (CFG) e acessos (PDV / Gesint)."
                bodyClassName="!block"
            >
                <div className="overflow-hidden rounded-lg border border-base-300/70 bg-base-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-190 text-sm">
                            <thead className="border-b border-base-300/70 bg-base-200/40 text-left text-xs font-semibold uppercase text-base-content/55">
                                <tr>
                                    <th className="px-3 py-2">Item</th>
                                    <th className="px-3 py-2">Categoria</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Data</th>
                                    <th className="px-3 py-2">Observação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-300/60">
                                {form.exitChecklist.length === 0 ? (
                                    <tr>
                                        <td className="px-3 py-4 text-sm text-base-content/60" colSpan={5}>
                                            Nenhum item configurado. Cadastre itens em CFG › Checklist de
                                            devoluções.
                                        </td>
                                    </tr>
                                ) : (
                                    form.exitChecklist.map((item) => (
                                        <tr key={item.key} className="align-top">
                                            <td className="px-3 py-2 font-medium text-base-content">
                                                {item.description}
                                            </td>
                                            <td className="px-3 py-2 text-base-content/70">
                                                {item.category === "ACCESS" ? "Acesso" : "Devolução"}
                                            </td>
                                            <td className="px-3 py-2">
                                                <InputSelect
                                                    items={CHECKLIST_STATUS_ITEMS}
                                                    value={item.status ?? "PENDING"}
                                                    onValueChange={(value) =>
                                                        updateChecklist(item.key, "status", value)
                                                    }
                                                    wrapperClassName="min-w-40"
                                                    disabled={readOnly}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <InputDate
                                                    value={item.returnedAt ?? ""}
                                                    onValueChange={(value) =>
                                                        updateChecklist(item.key, "returnedAt", value)
                                                    }
                                                    wrapperClassName="min-w-44"
                                                    disabled={readOnly}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    className={clsx(
                                                        "gommo-control h-10 w-full px-3 text-sm",
                                                        readOnly && "gommo-field--disabled",
                                                    )}
                                                    value={item.notes ?? ""}
                                                    disabled={readOnly}
                                                    onChange={(event) =>
                                                        updateChecklist(
                                                            item.key,
                                                            "notes",
                                                            event.target.value,
                                                        )
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
                <p className="mt-2 text-xs text-base-content/60">
                    Marque &quot;Acesso ao Gesint desativado&quot; para inativar o usuário do colaborador ao
                    concluir.
                </p>
            </FormSection>

            <FormSection
                id="entrevista"
                title="Entrevista de desligamento"
                description="Vínculo com a entrevista RH existente — o formulário completo fica no módulo de entrevista."
            >
                <InputSelect
                    label="Entrevista vinculada"
                    items={interviewItems}
                    value={form.exitInterviewId ?? ""}
                    onValueChange={(v) => update("exitInterviewId", v || "")}
                    placeholder={
                        form.collaboratorId
                            ? "Selecione uma entrevista do colaborador"
                            : "Selecione o colaborador primeiro"
                    }
                    wrapperClassName="sm:col-span-8"
                    clearable
                    disabled={readOnly || !form.collaboratorId}
                />
                <div className="sm:col-span-4 flex flex-wrap items-end gap-2">
                    <Button type="button" variant="outline" onClick={openExitInterview}>
                        {form.exitInterviewId ? "Abrir entrevista" : "Nova entrevista"}
                    </Button>
                </div>
                {linkedInterviewQuery.data ? (
                    <p className="sm:col-span-12 text-sm text-base-content/70">
                        Entrevista #{linkedInterviewQuery.data.code} · status{" "}
                        {linkedInterviewQuery.data.interviewStatus}
                        {linkedInterviewQuery.data.interviewDate
                            ? ` · ${linkedInterviewQuery.data.interviewDate.slice(0, 10)}`
                            : ""}
                    </p>
                ) : null}
            </FormSection>

            <FormSection
                id="contador"
                title="Pacote ao contador"
                description="Resumo para o contador (sem cálculo de verbas/TRCT). Envio por e-mail quando configurado na empresa."
                bodyClassName="!block"
            >
                {!editingId ? (
                    <p className="text-sm text-base-content/65">
                        Salve o rascunho para visualizar e gerar o pacote.
                    </p>
                ) : packageQuery.isLoading ? (
                    <div className="skeleton-shimmer h-24 w-full" />
                ) : (
                    <div className="space-y-3 rounded-lg border border-base-300/70 bg-base-100 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                                Status:{" "}
                                {ACCOUNTANT_PACKAGE_STATUS_LABELS[pack?.packageStatus ?? "PENDING"] ??
                                    pack?.packageStatus ??
                                    "Pendente"}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                loading={packageMutation.isPending}
                                onClick={() => packageMutation.mutate()}
                            >
                                Gerar / enviar pacote
                            </Button>
                        </div>
                        <p className="text-xs text-base-content/60">
                            Contador: {pack?.accountantName || "—"} · {pack?.accountantEmail || "sem e-mail"}
                        </p>
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-base-200/50 p-3 text-xs text-base-content/80">
                            {pack?.summaryText ||
                                detailQuery.data?.accountantPackageDetail ||
                                "Pacote ainda não gerado. Conclua o desligamento ou use Gerar / enviar."}
                        </pre>
                    </div>
                )}
            </FormSection>

            <FormSection
                id="documentos"
                title="Documentos"
                description="Anexos vinculados ao desligamento."
                bodyClassName="!block"
            >
                <EntityAttachments entityType="offboarding" entityId={editingId} />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
