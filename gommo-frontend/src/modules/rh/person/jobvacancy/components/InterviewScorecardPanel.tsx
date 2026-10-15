"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DevelopmentPlanDomainService } from "@/modules/cfg/settings/developmentplan/services/development-plan-domain.service";
import type {
    InterviewRecommendation,
    InterviewScoreItem,
    InterviewScorecard,
} from "@/modules/rh/person/jobvacancyapplication/dto/interview-scorecard.dto";
import { INTERVIEW_RECOMMENDATION_ITEMS } from "@/modules/rh/person/jobvacancyapplication/dto/interview-scorecard.dto";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { Button } from "@/shared/components/ui/Button";
import { fieldClass } from "@/shared/components/ui/input/InputFieldChrome";
import { InputSelect } from "@/shared/components/ui/input/InputSelect";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

const proficiencyLevelService = new DevelopmentPlanDomainService("/api/v1/development/proficiency-levels");

type ScoreDraft = {
    score: number | null;
    justification: string;
};

type InterviewScorecardPanelProps = {
    applicationId: string;
    jobVacancyId?: string | null;
    columnKey: string;
};

function draftsFromScorecard(scorecard: InterviewScorecard | undefined): Record<string, ScoreDraft> {
    const next: Record<string, ScoreDraft> = {};
    for (const competency of scorecard?.competencies ?? []) {
        const existing = scorecard?.myEvaluation?.scores?.find(
            (score) => score.competencyId === competency.competencyId,
        );
        next[competency.competencyId] = {
            score: existing?.score ?? null,
            justification: existing?.justification ?? "",
        };
    }
    return next;
}

function recommendationLabel(value?: InterviewRecommendation | null): string | null {
    if (!value) return null;
    return INTERVIEW_RECOMMENDATION_ITEMS.find((item) => item.value === value)?.label ?? value;
}

export function InterviewScorecardPanel({
    applicationId,
    jobVacancyId,
    columnKey,
}: InterviewScorecardPanelProps) {
    const queryClient = useQueryClient();
    const [drafts, setDrafts] = useState<Record<string, ScoreDraft>>({});
    const [recommendation, setRecommendation] = useState<InterviewRecommendation | null>(null);

    const levelsQuery = useQuery({
        queryKey: ["development-proficiency-levels", "interview-scorecard"],
        queryFn: () => proficiencyLevelService.getAll({ status: "ACTIVE" }),
        staleTime: 60_000,
    });

    const scorecardQuery = useQuery({
        queryKey: [...jobVacancyApplicationKeys.all, "interview-scorecard", applicationId, columnKey],
        queryFn: () => jobVacancyApplicationService.getInterviewScorecard(applicationId, columnKey),
        enabled: Boolean(applicationId && columnKey),
    });

    useEffect(() => {
        if (scorecardQuery.data) {
            setDrafts(draftsFromScorecard(scorecardQuery.data));
            setRecommendation(scorecardQuery.data.myEvaluation?.recommendation ?? null);
        }
    }, [scorecardQuery.data]);

    const levels = useMemo(() => {
        return [...(levelsQuery.data ?? [])]
            .filter((level) => level.levelOrder != null)
            .sort((a, b) => (a.levelOrder ?? 0) - (b.levelOrder ?? 0));
    }, [levelsQuery.data]);

    const submitted = scorecardQuery.data?.myEvaluation?.evaluationStatus === "SUBMITTED";
    const competencies = scorecardQuery.data?.competencies ?? [];

    const buildPayload = (): InterviewScoreItem[] => {
        const items: InterviewScoreItem[] = [];
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
        await queryClient.invalidateQueries({
            queryKey: [...jobVacancyApplicationKeys.all, "interview-scorecard", applicationId, columnKey],
        });
        if (jobVacancyId) {
            await queryClient.invalidateQueries({
                queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId),
            });
        }
        await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
    };

    const draftMutation = useMutation({
        mutationFn: () =>
            jobVacancyApplicationService.saveInterviewScorecardDraft(applicationId, {
                columnKey,
                recommendation,
                scores: buildPayload(),
            }),
        onSuccess: async () => {
            toast.success("Rascunho salvo");
            await invalidate();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível salvar o rascunho." }),
    });

    const submitMutation = useMutation({
        mutationFn: () =>
            jobVacancyApplicationService.submitInterviewScorecard(applicationId, {
                columnKey,
                recommendation,
                scores: buildPayload(),
            }),
        onSuccess: async () => {
            toast.success("Avaliação enviada");
            await invalidate();
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível enviar a avaliação." }),
    });

    const handleSubmit = async () => {
        for (const competency of competencies) {
            const draft = drafts[competency.competencyId];
            if (!draft?.score || !draft.justification.trim()) {
                toast.error("Preencha nota e justificativa para todas as competências.");
                return;
            }
        }
        if (!recommendation) {
            toast.error("Informe a recomendação antes de enviar.");
            return;
        }
        const confirmed = await SystemAlert.confirm({
            title: "Enviar avaliação",
            message:
                "Após enviar, você não poderá editar. As notas dos outros avaliadores e a média só ficam visíveis quando todos enviarem.",
            confirmLabel: "Enviar",
            cancelLabel: "Cancelar",
            variant: "warning",
        });
        if (!confirmed) return;
        submitMutation.mutate();
    };

    if (scorecardQuery.isLoading || levelsQuery.isLoading) {
        return (
            <div className="grid gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-16 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (scorecardQuery.isError) {
        return (
            <p className="text-sm text-error">
                {ExceptionCapture.displayMessage(
                    scorecardQuery.error,
                    "Não foi possível carregar o scorecard.",
                )}
            </p>
        );
    }

    if (competencies.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-base-content/15 px-3 py-3 text-xs text-base-content/55">
                Configure as competências do cargo (uso Entrevista) ou da vaga para usar o scorecard.
            </p>
        );
    }

    const averages = scorecardQuery.data?.averages ?? [];
    const others = scorecardQuery.data?.otherEvaluations ?? [];
    const canSeeOthers = Boolean(scorecardQuery.data?.canSeeOthers);
    const busy = draftMutation.isPending || submitMutation.isPending;

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-base-content/55">
                    Escala do PDI (níveis de proficiência). Cada nota exige evidência escrita.
                    {scorecardQuery.data?.submittedCount
                        ? ` · ${scorecardQuery.data.submittedCount} avaliação(ões) enviada(s)`
                        : ""}
                </p>
                {!submitted ? (
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
                            onClick={() => void handleSubmit()}
                        >
                            Enviar avaliação
                        </Button>
                    </div>
                ) : (
                    <span className="rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
                        Avaliação enviada
                    </span>
                )}
            </div>

            <div className="grid gap-3">
                {competencies.map((competency) => {
                    const draft = drafts[competency.competencyId] ?? {
                        score: null,
                        justification: "",
                    };
                    const guide =
                        competency.interviewGuideQuestion?.trim() || competency.description?.trim() || null;
                    return (
                        <div
                            key={competency.competencyId}
                            className="rounded-lg border border-base-content/10 px-3 py-3"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-base-content">
                                        {competency.competencyName ?? "Competência"}
                                    </p>
                                    {guide ? (
                                        <p className="mt-0.5 text-[0.6875rem] italic text-base-content/55">
                                            {guide.startsWith('"') ? guide : `“${guide}”`}
                                        </p>
                                    ) : null}
                                    {competency.source === "JOB_POSITION" ? (
                                        <p className="mt-0.5 text-[0.6875rem] text-base-content/45">
                                            Do cargo
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {levels.map((level) => {
                                        const active = draft.score === level.levelOrder;
                                        const title = level.description?.trim()
                                            ? `${level.name}: ${level.description}`
                                            : level.name;
                                        return (
                                            <button
                                                key={level.id}
                                                type="button"
                                                disabled={submitted || busy}
                                                title={title}
                                                aria-label={title}
                                                className={clsx(
                                                    "inline-flex size-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                                                    active
                                                        ? "border-primary/40 bg-primary/10 text-primary"
                                                        : "border-base-content/12 text-base-content/70 hover:bg-base-content/[0.04]",
                                                    (submitted || busy) && "opacity-60",
                                                )}
                                                onClick={() =>
                                                    setDrafts((current) => ({
                                                        ...current,
                                                        [competency.competencyId]: {
                                                            ...draft,
                                                            score: level.levelOrder ?? null,
                                                        },
                                                    }))
                                                }
                                            >
                                                {level.levelOrder}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <textarea
                                rows={2}
                                disabled={submitted || busy}
                                value={draft.justification}
                                placeholder="Evidência observável"
                                onChange={(event) =>
                                    setDrafts((current) => ({
                                        ...current,
                                        [competency.competencyId]: {
                                            ...draft,
                                            justification: event.target.value,
                                        },
                                    }))
                                }
                                className={clsx(
                                    "gommo-control mt-2 inline-block! h-auto! min-h-16! items-start! w-full resize-y px-2.5! py-2! text-xs",
                                    fieldClass(),
                                )}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="max-w-sm">
                <InputSelect
                    label="Recomendação"
                    value={recommendation ?? undefined}
                    onValueChange={(value) =>
                        setRecommendation(value ? (value as InterviewRecommendation) : null)
                    }
                    items={INTERVIEW_RECOMMENDATION_ITEMS}
                    placeholder="Selecione"
                    disabled={submitted || busy}
                    clearable
                    required
                />
            </div>

            {canSeeOthers && averages.length > 0 ? (
                <div className="rounded-lg border border-base-content/10 bg-base-content/[0.02] px-3 py-3">
                    <p className="text-xs font-semibold text-base-content">Média por competência</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {averages.map((average) => (
                            <span
                                key={average.competencyId}
                                className="rounded-md border border-base-content/10 bg-base-100 px-2 py-1 text-[0.6875rem] text-base-content/75"
                            >
                                {average.competencyName ?? "Competência"} · {average.average}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {!canSeeOthers && (scorecardQuery.data?.submittedCount ?? 0) > 0 ? (
                <p className="text-xs text-base-content/50">
                    {submitted
                        ? "Aguardando os demais avaliadores enviarem para liberar a consolidação."
                        : "As notas dos outros e a média só ficam visíveis quando todos enviarem."}
                </p>
            ) : null}

            {canSeeOthers && others.length > 0 ? (
                <div className="grid gap-2">
                    <p className="text-xs font-semibold text-base-content">Outras avaliações</p>
                    {others.map((evaluation) => (
                        <div
                            key={evaluation.id ?? evaluation.evaluatorUserId}
                            className="rounded-lg border border-base-content/10 px-3 py-2.5"
                        >
                            <p className="text-xs font-medium text-base-content">
                                {evaluation.evaluatorName ?? "Avaliador"}
                                {recommendationLabel(evaluation.recommendation)
                                    ? ` · ${recommendationLabel(evaluation.recommendation)}`
                                    : ""}
                            </p>
                            <div className="mt-1.5 grid gap-1">
                                {(evaluation.scores ?? []).map((score) => (
                                    <p
                                        key={`${evaluation.id}-${score.competencyId}`}
                                        className="text-[0.6875rem] text-base-content/65"
                                    >
                                        <span className="font-medium text-base-content/80">
                                            {score.competencyName}
                                        </span>
                                        {" · "}
                                        {score.score}
                                        {score.justification ? ` — ${score.justification}` : ""}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
