"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {type SubmitEvent, useEffect, useState} from "react";
import {toast} from "sonner";

import type {
    ExperienceCompetency,
    ExperienceDecision,
    ExperienceEvaluation,
    ExperiencePeriodStatus,
    ExperienceScoreItem,
} from "@/modules/rh/person/experience/dto/experience-evaluation.dto";
import {EXPERIENCE_CLIENT_MESSAGES} from "@/modules/rh/person/experience/exceptions/experience-evaluation.messages";
import {experienceEvaluationKeys} from "@/modules/rh/person/experience/experience.query";
import {
    EXPERIENCE_DECISION_LABELS,
    EXPERIENCE_DECISION_REASONS,
    EXPERIENCE_PERIOD_LABELS,
    EXPERIENCE_PERIOD_STATUS_LABELS,
} from "@/modules/rh/person/experience/lib/experience-evaluation.options";
import {experienceEvaluationService} from "@/modules/rh/person/experience/services/experience-evaluation.service";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {InputRadio, InputSelect} from "@/shared/components/ui/input";
import {fieldClass, InputFieldChrome} from "@/shared/components/ui/input/InputFieldChrome";
import {LineContainer} from "@/shared/components/ui/line-container/LineContainer";
import {Modal} from "@/shared/components/ui/Modal";
import {SkeletonStack} from "@/shared/components/ui/SkeletonStack";
import {ExceptionCapture} from "@/shared/exceptions";
import {isoToDateBr} from "@/shared/lib/input/date";
import {SystemAlert} from "@/shared/system-alert";
import {findRouteById} from "@/shared/workspace/workspace-routes";
import {useWorkspaceNavigation} from "@/shared/workspace/WorkspaceNavigationProvider";

type ScoreDraft = {
    score: number | null;
    justification: string;
};

const SCORE_LEVELS = [1, 2, 3, 4];

/** Motivo da tela 16 (RN-05 / RN-41): vazio até a escolha, e ligado à competência quando o cargo tem scorecard. */
function decisionReasonItems(competencies: ExperienceCompetency[]) {
    const names = competencies
        .map((item) => item.competencyName?.trim())
        .filter((name): name is string => Boolean(name));
    const specific = names.map((name) => {
        const label = `Desempenho abaixo do esperado em ${name}`;
        return {value: label, label};
    });
    const generic = EXPERIENCE_DECISION_REASONS.filter(
        (reason) => specific.length === 0 || reason !== "Desempenho abaixo do esperado",
    ).map((reason) => ({value: reason, label: reason}));
    return [...specific, ...generic];
}

const DECISION_OPTIONS = [
    ["EFFECTIVE", "Efetivar em prazo indeterminado"],
    ["END", "Encerrar ao fim do prazo e abrir o desligamento"],
    ["EXTEND", "Prorrogar"],
] as const;

function draftsFromDetail(detail: ExperienceEvaluation | undefined): Record<string, ScoreDraft> {
    const next: Record<string, ScoreDraft> = {};
    for (const competency of detail?.competencies ?? []) {
        const existing = detail?.scores?.find((score) => score.competencyId === competency.competencyId);
        next[competency.competencyId] = {
            score: existing?.score ?? null,
            justification: existing?.justification ?? "",
        };
    }
    return next;
}

function periodBadgeClass(status: ExperiencePeriodStatus): string {
    switch (status) {
        case "PENDING_DECISION":
            return "gesint-badge--warning";
        case "EFFECTIVE":
            return "gesint-badge--success";
        case "ENDED":
            return "gesint-badge--neutral";
        default:
            return "gesint-badge--info";
    }
}

function formatDueDate(value?: string | null): string {
    if (!value) return "—";
    return isoToDateBr(value.slice(0, 10)) || "—";
}

export function ExperienceEvaluationFormClient() {
    const {editingId, goToList, cancelAndClose} = useCrudScreen();
    const queryClient = useQueryClient();
    const {openRouteRecord} = useWorkspaceNavigation();
    const [drafts, setDrafts] = useState<Record<string, ScoreDraft>>({});
    const [decisionOpen, setDecisionOpen] = useState(false);
    const [decisionAction, setDecisionAction] = useState<Exclude<ExperienceDecision, "AUTO_EFFECTIVE">>("EFFECTIVE");
    const [decisionReason, setDecisionReason] = useState("");
    const [decisionNotes, setDecisionNotes] = useState("");

    const detailQuery = useQuery({
        queryKey: experienceEvaluationKeys.detail(editingId ?? ""),
        queryFn: () => experienceEvaluationService.getById(editingId!),
        enabled: Boolean(editingId),
    });

    useEffect(() => {
        if (detailQuery.data) {
            setDrafts(draftsFromDetail(detailQuery.data));
            if (detailQuery.data.canExtend) {
                setDecisionAction("EFFECTIVE");
            }
        }
    }, [detailQuery.data]);

    const detail = detailQuery.data;
    const submitted = detail?.evaluationStatus === "SUBMITTED";
    const decided = Boolean(detail?.decided);
    const competencies = detail?.competencies ?? [];
    const locked = submitted || decided;

    const buildPayload = (): ExperienceScoreItem[] => {
        const items: ExperienceScoreItem[] = [];
        for (const competency of competencies) {
            const draft = drafts[competency.competencyId];
            if (!draft?.score) continue;
            items.push({
                competencyId: competency.competencyId,
                score: draft.score,
                justification: draft.justification,
            });
        }
        return items;
    };

    const invalidate = async () => {
        await queryClient.invalidateQueries({queryKey: experienceEvaluationKeys.all});
        if (editingId) {
            await queryClient.invalidateQueries({queryKey: experienceEvaluationKeys.detail(editingId)});
        }
    };

    const draftMutation = useMutation({
        mutationFn: () => experienceEvaluationService.saveScoresDraft(editingId!, {scores: buildPayload()}),
        onSuccess: async () => {
            toast.success("Rascunho salvo");
            await invalidate();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_SAVE_FAILED}),
    });

    const submitMutation = useMutation({
        mutationFn: () => experienceEvaluationService.submitScores(editingId!, {scores: buildPayload()}),
        onSuccess: async () => {
            toast.success("Avaliação enviada");
            await invalidate();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_SAVE_FAILED}),
    });

    const decideMutation = useMutation({
        mutationFn: () =>
            experienceEvaluationService.decide(editingId!, {
                action: decisionAction,
                reason: decisionReason.trim() || undefined,
                notes: decisionNotes.trim() || undefined,
            }),
        onSuccess: async (result) => {
            toast.success("Decisão registrada");
            setDecisionOpen(false);
            await invalidate();
            if (result.decision === "END" && result.offboardingId) {
                const route = findRouteById("offboarding");
                if (route) {
                    openRouteRecord(route, result.offboardingId, {
                        titleSuffix: result.collaboratorName ?? "Desligamento",
                    });
                }
            }
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_DECIDE_FAILED}),
    });

    const handleSubmitScores = async () => {
        for (const competency of competencies) {
            const draft = drafts[competency.competencyId];
            if (!draft?.score || !draft.justification.trim()) {
                toast.error("Preencha nota e evidência para todas as competências.");
                return;
            }
        }
        const confirmed = await SystemAlert.confirm({
            title: "Enviar avaliação",
            message: "Após enviar, as notas de experiência não poderão ser editadas.",
            confirmLabel: "Enviar",
            cancelLabel: "Cancelar",
            variant: "warning",
        });
        if (!confirmed) return;
        submitMutation.mutate();
    };

    const handleDecide = async () => {
        if (decisionAction === "END" && !decisionReason.trim()) {
            toast.error("Informe o motivo do encerramento.");
            return;
        }
        const confirmed = await SystemAlert.confirm({
            title: EXPERIENCE_DECISION_LABELS[decisionAction],
            message:
                decisionAction === "END"
                    ? "Será aberto um desligamento por término de contrato a termo."
                    : decisionAction === "EXTEND"
                        ? "A prorrogação só pode ocorrer uma vez e o total não passa de 90 dias."
                        : "O vínculo passa a prazo indeterminado.",
            confirmLabel: "Registrar decisão",
            cancelLabel: "Cancelar",
            variant: "warning",
            destructive: decisionAction === "END",
        });
        if (!confirmed) return;
        decideMutation.mutate();
    };

    const openOffboarding = () => {
        if (!detail?.offboardingId) return;
        const route = findRouteById("offboarding");
        if (!route) return;
        openRouteRecord(route, detail.offboardingId, {
            titleSuffix: detail.collaboratorName ?? "Desligamento",
        });
    };

    if (!editingId) {
        return (
            <p className="p-5 text-sm text-base-content/55">
                Selecione um colaborador na fila de experiência para avaliar.
            </p>
        );
    }

    if (detailQuery.isPending) {
        return <SkeletonStack count={3} padded/>;
    }

    if (detailQuery.isError || !detail) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" className="mt-3" onClick={() => void goToList()}>
                    Voltar
                </Button>
            </div>
        );
    }

    const busy = draftMutation.isPending || submitMutation.isPending || decideMutation.isPending;
    const dueLabel = formatDueDate(detail.experienceDueDate);

    const handleFormSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!locked) void handleSubmitScores();
    };

    return (
        <>
            <CrudFormShell onSubmit={handleFormSubmit} header={
                                                           <>
                                                               <Button type="button" variant="ghost"
                                                                       onClick={() => void goToList()}>
                                                                   Cancelar
                                                               </Button>
                                                               <Button type="button" variant="warning"
                                                                       onClick={() => void cancelAndClose()}>
                                                                   Cancelar e Fechar
                                                               </Button>
                                                               {!decided ? (
                                                                   <Button
                                                                       type="button"
                                                                       variant={locked ? "primary" : "outline"}
                                                                       disabled={busy}
                                                                       onClick={() => setDecisionOpen(true)}
                                                                   >
                                                                       Registrar decisão
                                                                   </Button>
                                                               ) : null}
                                                               {!locked ? (
                                                                   <>
                                                                       <Button
                                                                           type="button"
                                                                           variant="outline"
                                                                           loading={draftMutation.isPending}
                                                                           disabled={busy || buildPayload().length === 0}
                                                                           onClick={() => draftMutation.mutate()}
                                                                       >
                                                                           Salvar rascunho
                                                                       </Button>
                                                                       <Button type="submit"
                                                                               loading={submitMutation.isPending}
                                                                               disabled={busy}>
                                                                           Enviar avaliação
                                                                       </Button>
                                                                   </>
                                                               ) : null}
                                                           </>
                                                       }>
                <FormSection id="periodo" title="Período" bodyClassName="!block">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={clsx("gesint-badge", periodBadgeClass(detail.periodStatus))}>
                            {EXPERIENCE_PERIOD_STATUS_LABELS[detail.periodStatus]}
                        </span>
                        {submitted ? (
                            <span className="gesint-badge gesint-badge--success">Avaliação enviada</span>
                        ) : null}
                        {decided && detail.decision ? (
                            <span className="gesint-badge gesint-badge--neutral">
                                {EXPERIENCE_DECISION_LABELS[detail.decision]}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-2 text-sm text-base-content">
                        {detail.collaboratorName ?? "Colaborador"}
                        {detail.jobPositionName ? ` · ${detail.jobPositionName}` : ""}
                    </p>
                    <p className="gesint-hint">
                        {EXPERIENCE_PERIOD_LABELS[detail.experiencePeriod]}
                        {" · "}
                        Marco de {detail.experienceMilestoneDays} dias
                        {" · "}
                        Vence em {dueLabel}
                        {detail.selectionAverage != null || detail.averageScore != null
                            ? ` · Seleção ${detail.selectionAverage ?? "—"} → Experiência ${detail.averageScore ?? "—"}`
                            : ""}
                    </p>
                </FormSection>

                <FormSection
                    id="competencias"
                    title="Avaliação por competências"
                    bodyClassName="!block"
                >
                    {competencies.length === 0 ? (
                        <p className="text-sm text-base-content/55">
                            Configure competências do cargo com uso Experiência para habilitar a avaliação.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {competencies.map((competency) => {
                                const draft = drafts[competency.competencyId] ?? {
                                    score: null,
                                    justification: "",
                                };
                                const fieldId = `experience-evidence-${competency.competencyId}`;
                                return (
                                    <div
                                        key={competency.competencyId}
                                        className="grid gap-2 border-b border-base-content/8 pb-4 last:border-b-0 last:pb-0"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm font-medium text-base-content">
                                                {competency.competencyName ?? "Competência"}
                                            </p>
                                            <div
                                                className="flex flex-wrap gap-1"
                                                role="group"
                                                aria-label={`Nota de ${competency.competencyName ?? "competência"}`}
                                            >
                                                {SCORE_LEVELS.map((level) => {
                                                    const active = draft.score === level;
                                                    return (
                                                        <Button
                                                            key={level}
                                                            type="button"
                                                            variant={active ? "primary" : "outline"}
                                                            aria-pressed={active}
                                                            disabled={locked || busy}
                                                            onClick={() =>
                                                                setDrafts((current) => ({
                                                                    ...current,
                                                                    [competency.competencyId]: {
                                                                        ...draft,
                                                                        score: level,
                                                                    },
                                                                }))
                                                            }
                                                        >
                                                            {level}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <InputFieldChrome
                                            id={fieldId}
                                            label="Evidência"
                                            required
                                            disabled={locked || busy}
                                        >
                                            <textarea
                                                id={fieldId}
                                                rows={2}
                                                className={clsx(
                                                    "gesint-control inline-block! h-auto! min-h-16! w-full resize-y items-start! py-2!",
                                                    fieldClass(locked || busy),
                                                )}
                                                disabled={locked || busy}
                                                value={draft.justification}
                                                onChange={(event) =>
                                                    setDrafts((current) => ({
                                                        ...current,
                                                        [competency.competencyId]: {
                                                            ...draft,
                                                            justification: event.target.value,
                                                        },
                                                    }))
                                                }
                                            />
                                        </InputFieldChrome>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </FormSection>

                <FormSection id="decisao" title="Decisão do período" bodyClassName="!block">
                    {decided ? (
                        <>
                            <p className="text-sm text-base-content">
                                {detail.decision ? EXPERIENCE_DECISION_LABELS[detail.decision] : "Decidido"}
                                {detail.decisionReason ? ` · ${detail.decisionReason}` : ""}
                            </p>
                            {detail.decisionNotes ? <p className="gesint-hint">{detail.decisionNotes}</p> : null}
                            {detail.decidedByName ? (
                                <p className="gesint-hint">Registrada por {detail.decidedByName}</p>
                            ) : null}
                        </>
                    ) : (
                        <p className="text-sm text-base-content/70">
                            Efetivar em prazo indeterminado, prorrogar uma vez ou encerrar e abrir o desligamento.
                        </p>
                    )}
                    {detail.offboardingId ? (
                        <Button type="button" variant="outline" className="mt-3" onClick={openOffboarding}>
                            Abrir desligamento
                        </Button>
                    ) : null}
                    {!decided ? (
                        <p className="gesint-hint">
                            Se nada for decidido até o vencimento, o contrato passa a prazo indeterminado.
                        </p>
                    ) : null}
                </FormSection>
            </CrudFormShell>

            <Modal
                open={decisionOpen}
                onClose={() => setDecisionOpen(false)}
                title="Decisão do período"
                subtitle={`${detail.collaboratorName ?? "Colaborador"} · ${EXPERIENCE_PERIOD_LABELS[detail.experiencePeriod]} · vence em ${dueLabel}`}
                size="md"
                closeDisabled={busy}
                footer={
                    <LineContainer>
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={busy}
                                onClick={() => setDecisionOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                loading={decideMutation.isPending}
                                disabled={busy}
                                onClick={() => void handleDecide()}
                            >
                                Registrar decisão
                            </Button>
                        </>
                    </LineContainer>
                }
            >
                <div className="grid gap-3">
                    {DECISION_OPTIONS.map(([action, label]) => {
                        const unavailable = action === "EXTEND" && !detail.canExtend;
                        return (
                            <InputRadio
                                key={action}
                                name="experience-decision"
                                disabled={unavailable || busy}
                                checked={decisionAction === action}
                                onChange={() => setDecisionAction(action)}
                                isActive={decisionAction === action}
                                isUnavailable={unavailable}
                                labelUnvailable="Indisponível: já prorrogado uma vez ou período sem prorrogação."
                                label={label}
                            />
                        );
                    })}
                    <InputSelect
                        label="Motivo padronizado"
                        items={decisionReasonItems(competencies)}
                        value={decisionReason}
                        onValueChange={setDecisionReason}
                        placeholder="Selecione"
                        required={decisionAction === "END"}
                        disabled={busy}
                    />
                    <InputFieldChrome id="experience-decision-notes" label="Observações" disabled={busy}>
                        <textarea
                            id="experience-decision-notes"
                            rows={3}
                            className={clsx(
                                "gesint-control inline-block! h-auto! min-h-16! w-full resize-y items-start! py-2!",
                                fieldClass(busy),
                            )}
                            disabled={busy}
                            value={decisionNotes}
                            onChange={(event) => setDecisionNotes(event.target.value)}
                        />
                    </InputFieldChrome>
                    <p className="gesint-hint">
                        Se nada for decidido até o vencimento, o contrato passa a prazo indeterminado.
                    </p>
                </div>
            </Modal>
        </>
    );
}
