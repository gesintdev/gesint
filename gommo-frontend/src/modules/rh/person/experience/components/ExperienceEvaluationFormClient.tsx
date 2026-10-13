"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
    ExperienceDecision,
    ExperienceEvaluation,
    ExperienceScoreItem,
} from "@/modules/rh/person/experience/dto/experience-evaluation.dto";
import { EXPERIENCE_CLIENT_MESSAGES } from "@/modules/rh/person/experience/exceptions/experience-evaluation.messages";
import { experienceEvaluationKeys } from "@/modules/rh/person/experience/experience.query";
import {
    EXPERIENCE_DECISION_LABELS,
    EXPERIENCE_DECISION_REASONS,
    EXPERIENCE_PERIOD_LABELS,
    EXPERIENCE_PERIOD_STATUS_LABELS,
} from "@/modules/rh/person/experience/lib/experience-evaluation.options";
import { experienceEvaluationService } from "@/modules/rh/person/experience/services/experience-evaluation.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { fieldClass } from "@/shared/components/ui/input/InputFieldChrome";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";
import { findRouteById } from "@/shared/workspace/workspace-routes";
import { useWorkspaceNavigation } from "@/shared/workspace/WorkspaceNavigationProvider";

type ScoreDraft = {
    score: number | null;
    justification: string;
};

const SCORE_LEVELS = [1, 2, 3, 4];

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

export function ExperienceEvaluationFormClient() {
    const { editingId, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const { openRouteRecord } = useWorkspaceNavigation();
    const [drafts, setDrafts] = useState<Record<string, ScoreDraft>>({});
    const [decisionOpen, setDecisionOpen] = useState(false);
    const [decisionAction, setDecisionAction] = useState<Exclude<ExperienceDecision, "AUTO_EFFECTIVE">>("EFFECTIVE");
    const [decisionReason, setDecisionReason] = useState<string>(EXPERIENCE_DECISION_REASONS[0]);
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
        await queryClient.invalidateQueries({ queryKey: experienceEvaluationKeys.all });
        if (editingId) {
            await queryClient.invalidateQueries({ queryKey: experienceEvaluationKeys.detail(editingId) });
        }
    };

    const draftMutation = useMutation({
        mutationFn: () => experienceEvaluationService.saveScoresDraft(editingId!, { scores: buildPayload() }),
        onSuccess: async () => {
            toast.success("Rascunho salvo");
            await invalidate();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_SAVE_FAILED }),
    });

    const submitMutation = useMutation({
        mutationFn: () => experienceEvaluationService.submitScores(editingId!, { scores: buildPayload() }),
        onSuccess: async () => {
            toast.success("Avaliação enviada");
            await invalidate();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_SAVE_FAILED }),
    });

    const decideMutation = useMutation({
        mutationFn: () =>
            experienceEvaluationService.decide(editingId!, {
                action: decisionAction,
                reason: decisionReason,
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
            ExceptionCapture.handle(err, { fallbackMessage: EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_DECIDE_FAILED }),
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
                    ? "Será aberto um desligamento (eSocial 09 — término de contrato a termo)."
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

    const headerMeta = useMemo(() => {
        if (!detail) return null;
        return (
            <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
                <span className="badge badge-outline">
                    {EXPERIENCE_PERIOD_STATUS_LABELS[detail.periodStatus]}
                </span>
                <span>{EXPERIENCE_PERIOD_LABELS[detail.experiencePeriod]}</span>
                <span>Marco: {detail.experienceMilestoneDays} dias</span>
                <span>Vence: {detail.experienceDueDate}</span>
                {detail.selectionAverage != null || detail.averageScore != null ? (
                    <span>
                        Seleção {detail.selectionAverage ?? "—"} → Exp. {detail.averageScore ?? "—"}
                    </span>
                ) : null}
            </div>
        );
    }, [detail]);

    if (!editingId) {
        return (
            <p className="text-sm text-base-content/55">
                Selecione um colaborador na fila de experiência para avaliar.
            </p>
        );
    }

    if (detailQuery.isLoading) {
        return (
            <div className="grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-14 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (detailQuery.isError || !detail) {
        return (
            <p className="text-sm text-error">
                {ExceptionCapture.displayMessage(
                    detailQuery.error,
                    EXPERIENCE_CLIENT_MESSAGES.EXPERIENCE_LOAD_FAILED,
                )}
            </p>
        );
    }

    const busy = draftMutation.isPending || submitMutation.isPending || decideMutation.isPending;

    return (
        <div className="grid gap-5">
            <div className="grid gap-1">
                <h3 className="text-base font-semibold text-base-content">
                    {detail.collaboratorName ?? "Colaborador"} · {detail.jobPositionName ?? "Cargo"}
                </h3>
                {headerMeta}
            </div>

            <section className="grid gap-3 rounded-lg border border-base-content/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h4 className="text-sm font-semibold">Avaliação por competências</h4>
                        <p className="text-xs text-base-content/55">
                            Mesmas competências do cargo com uso Experiência (escala 1–4).
                        </p>
                    </div>
                    {!decided && !submitted ? (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                loading={draftMutation.isPending}
                                disabled={busy || buildPayload().length === 0}
                                onClick={() => draftMutation.mutate()}
                            >
                                Salvar rascunho
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                loading={submitMutation.isPending}
                                disabled={busy}
                                onClick={() => void handleSubmitScores()}
                            >
                                Enviar avaliação
                            </Button>
                        </div>
                    ) : submitted ? (
                        <span className="rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            Avaliação enviada
                        </span>
                    ) : null}
                </div>

                {competencies.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-base-content/15 px-3 py-3 text-xs text-base-content/55">
                        Configure competências do cargo com uso &quot;Experiência&quot; para habilitar o scorecard.
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {competencies.map((competency) => {
                            const draft = drafts[competency.competencyId] ?? {
                                score: null,
                                justification: "",
                            };
                            return (
                                <div
                                    key={competency.competencyId}
                                    className="rounded-lg border border-base-content/10 px-3 py-3"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-base-content">
                                            {competency.competencyName ?? "Competência"}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {SCORE_LEVELS.map((level) => {
                                                const active = draft.score === level;
                                                return (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        disabled={submitted || decided || busy}
                                                        className={clsx(
                                                            "inline-flex size-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                                                            active
                                                                ? "border-primary/40 bg-primary/10 text-primary"
                                                                : "border-base-content/12 text-base-content/70 hover:bg-base-content/[0.04]",
                                                            (submitted || decided || busy) && "opacity-60",
                                                        )}
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
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <textarea
                                        className={clsx(fieldClass(), "mt-2 min-h-16")}
                                        placeholder="Evidência observável *"
                                        disabled={submitted || decided || busy}
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
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="grid gap-3 rounded-lg border border-base-content/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h4 className="text-sm font-semibold">Decisão do período</h4>
                        <p className="text-xs text-base-content/55">
                            Efetivar, prorrogar (1×) ou encerrar com motivo e autor (RN-05 / RN-13 / RN-41).
                        </p>
                    </div>
                    {!decided ? (
                        <Button type="button" size="sm" onClick={() => setDecisionOpen(true)} disabled={busy}>
                            Registrar decisão
                        </Button>
                    ) : (
                        <span className="badge badge-outline">
                            {detail.decision ? EXPERIENCE_DECISION_LABELS[detail.decision] : "Decidido"}
                            {detail.decisionReason ? ` · ${detail.decisionReason}` : ""}
                        </span>
                    )}
                </div>
                {detail.offboardingId ? (
                    <p className="text-xs text-base-content/55">
                        Desligamento aberto: {detail.offboardingId}
                    </p>
                ) : null}
            </section>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => void goToList()}>
                    Fechar
                </Button>
            </div>

            {decisionOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-content/40 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-base-content/10 bg-base-100 p-4 shadow-xl">
                        <h4 className="text-base font-semibold">
                            Fim do período de experiência · {detail.collaboratorName}
                        </h4>
                        <p className="mt-1 text-xs text-base-content/55">
                            Contrato de experiência ({EXPERIENCE_PERIOD_LABELS[detail.experiencePeriod]}). Vence em{" "}
                            {detail.experienceDueDate}.
                        </p>

                        <div className="mt-4 grid gap-2">
                            {(
                                [
                                    ["EFFECTIVE", "Efetivar (prazo indeterminado)"],
                                    ["END", "Encerrar ao fim do prazo → abre desligamento (RN-21)"],
                                    ["EXTEND", "Prorrogar"],
                                ] as const
                            ).map(([action, label]) => {
                                const disabled = action === "EXTEND" && !detail.canExtend;
                                return (
                                    <label
                                        key={action}
                                        className={clsx(
                                            "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                                            decisionAction === action
                                                ? "border-primary/40 bg-primary/5"
                                                : "border-base-content/10",
                                            disabled && "cursor-not-allowed opacity-50",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            className="radio radio-sm mt-0.5"
                                            name="experience-decision"
                                            disabled={disabled || busy}
                                            checked={decisionAction === action}
                                            onChange={() => setDecisionAction(action)}
                                        />
                                        <span>
                                            {label}
                                            {disabled ? (
                                                <span className="block text-xs text-base-content/45">
                                                    Indisponível: já prorrogado uma vez ou período sem prorrogação
                                                </span>
                                            ) : null}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <label className="mt-3 grid gap-1 text-xs text-base-content/60">
                            Motivo {decisionAction === "END" ? "*" : ""}
                            <select
                                className={fieldClass()}
                                value={decisionReason}
                                disabled={busy}
                                onChange={(event) => setDecisionReason(event.target.value)}
                            >
                                {EXPERIENCE_DECISION_REASONS.map((reason) => (
                                    <option key={reason} value={reason}>
                                        {reason}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="mt-3 grid gap-1 text-xs text-base-content/60">
                            Observações
                            <textarea
                                className={clsx(fieldClass(), "min-h-16")}
                                value={decisionNotes}
                                disabled={busy}
                                onChange={(event) => setDecisionNotes(event.target.value)}
                            />
                        </label>

                        <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                            Se nada for decidido até o vencimento, o contrato vira prazo indeterminado
                            automaticamente (CLT arts. 445 e 451).
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
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
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
