"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import { CandidateMatchScoreTag } from "@/modules/rh/person/jobvacancy/components/CandidateMatchScoreTag";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import {
    buildMatchBreakdownFromApplication,
    isApplicationAiPending,
} from "@/modules/rh/person/jobvacancy/lib/application-match-score";
import {
    JOB_VACANCY_CONTRACT_TYPE_LABELS,
    JOB_VACANCY_SENIORITY_LABELS,
    JOB_VACANCY_WORK_MODALITY_LABELS,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";
import { splitLines } from "@/modules/rh/person/jobvacancy/lib/careers-form.util";
import type { MatchScoreCriterion } from "@/modules/rh/person/jobvacancy/lib/mock-match-score-breakdown";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { Button } from "@/shared/components/ui/Button";
import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";
import { ExceptionCapture } from "@/shared/exceptions";

export type CandidateMatchScoreDetailTarget = {
    applicationId: string;
    candidateId: string;
    candidateName?: string;
};

type CandidateMatchScoreDetailModalProps = {
    open: boolean;
    jobVacancyId: string | null;
    target: CandidateMatchScoreDetailTarget | null;
    onClose: () => void;
};

function scoreBarColor(score: number): string {
    const hue = (Math.max(0, Math.min(100, score)) / 100) * 120;
    return `hsl(${hue} 68% 38%)`;
}

function CriterionRow({ item }: { item: MatchScoreCriterion }) {
    return (
        <article className="rounded-lg border border-base-content/10 bg-base-content/[0.02] p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h5 className="m-0 text-sm font-semibold text-base-content">{item.label}</h5>
                    <p className="mt-1 text-[0.6875rem] text-base-content/45">
                        <span className="font-semibold text-base-content/55">Exigido:</span> {item.required}
                    </p>
                </div>
                <CandidateMatchScoreTag score={item.score} />
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-base-content/10">
                <div
                    className="h-full rounded-full transition-[width]"
                    style={{ width: `${item.score}%`, backgroundColor: scoreBarColor(item.score) }}
                />
            </div>
            <p className="mt-2.5 m-0 text-xs leading-relaxed text-base-content/70">{item.found}</p>
        </article>
    );
}

export function CandidateMatchScoreDetailModal({
    open,
    jobVacancyId,
    target,
    onClose,
}: CandidateMatchScoreDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const queryClient = useQueryClient();

    const vacancyQuery = useQuery({
        queryKey: jobVacancyKeys.detail(jobVacancyId ?? ""),
        queryFn: () => jobVacancyService.getById(jobVacancyId!),
        enabled: open && Boolean(jobVacancyId),
    });

    const candidateQuery = useQuery({
        queryKey: candidateKeys.detail(target?.candidateId ?? ""),
        queryFn: () => candidateService.getById(target!.candidateId),
        enabled: open && Boolean(target?.candidateId),
    });

    const applicationsQuery = useQuery({
        queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId ?? ""),
        queryFn: () => jobVacancyApplicationService.getByVacancy(jobVacancyId!),
        enabled: open && Boolean(jobVacancyId),
        refetchInterval: (current) => {
            const row = (current.state.data ?? []).find((item) => item.id === target?.applicationId);
            return isApplicationAiPending(row) ? 3000 : false;
        },
    });

    const application = useMemo(
        () => (applicationsQuery.data ?? []).find((row) => row.id === target?.applicationId) ?? null,
        [applicationsQuery.data, target?.applicationId],
    );

    const breakdown = useMemo(() => buildMatchBreakdownFromApplication(application), [application]);
    const pending = isApplicationAiPending(application);

    const reanalyzeMutation = useMutation({
        mutationFn: () => jobVacancyApplicationService.reanalyze(target!.applicationId),
        onSuccess: async () => {
            toast.success("Reanálise iniciada");
            if (jobVacancyId) {
                await queryClient.invalidateQueries({
                    queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId),
                });
            }
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível reanalisar." }),
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    if (!mounted) return null;

    const vacancy = vacancyQuery.data;
    const requirements = splitLines(vacancy?.requirements);
    const activities = splitLines(vacancy?.activities);
    const assignments = splitLines(vacancy?.assignments);

    const chips = [
        vacancy?.department,
        vacancy?.location,
        vacancy?.seniorityLevel ? JOB_VACANCY_SENIORITY_LABELS[vacancy.seniorityLevel] : null,
        vacancy?.workModality ? JOB_VACANCY_WORK_MODALITY_LABELS[vacancy.workModality] : null,
        vacancy?.contractType ? JOB_VACANCY_CONTRACT_TYPE_LABELS[vacancy.contractType] : null,
    ].filter(Boolean) as string[];

    const candidateName = target?.candidateName ?? candidateQuery.data?.fullName ?? "Candidato";

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={(event) => {
                event.stopPropagation();
                if (event.target !== dialogRef.current) return;
                onClose();
            }}
            onCancel={(event) => {
                event.stopPropagation();
                if (event.target !== dialogRef.current) {
                    event.preventDefault();
                    return;
                }
                const openDialogs = document.querySelectorAll("dialog[open]");
                const topmost = openDialogs[openDialogs.length - 1];
                if (topmost && topmost !== dialogRef.current) {
                    event.preventDefault();
                }
            }}
        >
            <div className="modal-box flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-base-content">
                                Análise de compatibilidade
                            </h3>
                            <CandidateMatchScoreTag
                                score={breakdown?.totalScore}
                                pending={pending}
                            />
                        </div>
                        <p className="mt-0.5 truncate text-sm text-base-content/55">
                            {candidateName}
                            {vacancy?.jobTitle ? ` · ${vacancy.jobTitle}` : ""}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            leftIcon={<RefreshCw className="size-3.5" strokeWidth={2.25} />}
                            loading={reanalyzeMutation.isPending}
                            disabled={!target?.applicationId || pending}
                            onClick={() => reanalyzeMutation.mutate()}
                        >
                            Reanalisar
                        </Button>
                        <button
                            type="button"
                            aria-label="Fechar"
                            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only text-base-content/50"
                            onClick={(event) => {
                                event.stopPropagation();
                                onClose();
                            }}
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {vacancyQuery.isLoading || applicationsQuery.isLoading ? (
                        <div className="grid gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="skeleton-shimmer h-16 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : null}

                    {vacancyQuery.isError ? (
                        <p className="text-sm text-error">
                            {ExceptionCapture.displayMessage(
                                vacancyQuery.error,
                                "Não foi possível carregar os dados da vaga.",
                            )}
                        </p>
                    ) : null}

                    {vacancy ? (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <section className="min-w-0">
                                <h4 className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-base-content/45">
                                    O que a vaga exige
                                </h4>
                                <p className="mt-2 text-sm font-semibold text-base-content">{vacancy.jobTitle}</p>
                                {chips.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {chips.map((chip) => (
                                            <span
                                                key={chip}
                                                className="rounded-md border border-base-content/10 bg-base-content/5 px-2 py-0.5 text-[0.6875rem] text-base-content/70"
                                            >
                                                {chip}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}

                                {vacancy.description ? (
                                    <div className="mt-4">
                                        <p className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-base-content/40">
                                            Descrição
                                        </p>
                                        <MarkdownContent
                                            value={vacancy.description}
                                            className="text-xs text-base-content/75"
                                        />
                                    </div>
                                ) : null}

                                {requirements.length > 0 ? (
                                    <div className="mt-4">
                                        <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-base-content/40">
                                            Requisitos
                                        </p>
                                        <ul className="m-0 grid list-none gap-1.5 p-0">
                                            {requirements.map((item) => (
                                                <li
                                                    key={item}
                                                    className="rounded-md border border-base-content/8 bg-base-100 px-2.5 py-1.5 text-xs text-base-content/75"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {assignments.length > 0 ? (
                                    <div className="mt-4">
                                        <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-base-content/40">
                                            Atribuições
                                        </p>
                                        <ul className="m-0 grid list-none gap-1.5 p-0">
                                            {assignments.map((item) => (
                                                <li
                                                    key={item}
                                                    className="text-xs leading-relaxed text-base-content/70"
                                                >
                                                    • {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {activities.length > 0 && assignments.length === 0 ? (
                                    <div className="mt-4">
                                        <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-base-content/40">
                                            Atividades
                                        </p>
                                        <ul className="m-0 grid list-none gap-1.5 p-0">
                                            {activities.map((item) => (
                                                <li
                                                    key={item}
                                                    className="text-xs leading-relaxed text-base-content/70"
                                                >
                                                    • {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </section>

                            <section className="min-w-0">
                                <h4 className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-base-content/45">
                                    Avaliação do candidato
                                </h4>
                                {pending ? (
                                    <p className="mt-3 text-sm text-base-content/55">
                                        Análise em andamento. O score será atualizado automaticamente.
                                    </p>
                                ) : null}
                                {breakdown?.summary ? (
                                    <p className="mt-3 text-sm leading-relaxed text-base-content/75">
                                        {breakdown.summary}
                                    </p>
                                ) : null}
                                {application?.aiStatus === "FAILED" && application.aiAnalysis?.error ? (
                                    <p className="mt-2 text-xs leading-relaxed text-error/80">
                                        Detalhe: {application.aiAnalysis.error}
                                    </p>
                                ) : null}
                                {breakdown && breakdown.criteria.length > 0 ? (
                                    <div className="mt-4 grid gap-2.5">
                                        {breakdown.criteria.map((item) => (
                                            <CriterionRow key={item.id} item={item} />
                                        ))}
                                    </div>
                                ) : !pending ? (
                                    <p className="mt-3 text-sm text-base-content/45">
                                        Ainda não há breakdown de score para esta candidatura.
                                    </p>
                                ) : null}
                            </section>
                        </div>
                    ) : null}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    close
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
