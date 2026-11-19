"use client";

import { useQuery } from "@tanstack/react-query";
import { Gauge } from "lucide-react";
import { useEffect, useState } from "react";

import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import {
    CandidateMatchScoreDetailModal,
    type CandidateMatchScoreDetailTarget,
} from "@/modules/rh/person/jobvacancy/components/CandidateMatchScoreDetailModal";
import { CandidateProfileView } from "@/modules/rh/person/jobvacancy/components/CandidateProfileView";
import {
    applicationAiScore,
    isApplicationAiPending,
} from "@/modules/rh/person/jobvacancy/lib/application-match-score";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { Modal } from "@/shared/components/ui/Modal";
import { ExceptionCapture } from "@/shared/exceptions";

type CandidateAnalysisModalProps = {
    open: boolean;
    candidateId: string | null;
    jobVacancyId?: string | null;
    applicationId?: string | null;
    candidateName?: string | null;
    onClose: () => void;
};

export function CandidateAnalysisModal({
    open,
    candidateId,
    jobVacancyId,
    applicationId,
    candidateName,
    onClose,
}: CandidateAnalysisModalProps) {
    const [scoreDetailOpen, setScoreDetailOpen] = useState(false);

    const detailQuery = useQuery({
        queryKey: candidateKeys.detail(candidateId ?? ""),
        queryFn: () => candidateService.getById(candidateId!),
        enabled: open && Boolean(candidateId),
    });

    const applicationsQuery = useQuery({
        queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId ?? ""),
        queryFn: () => jobVacancyApplicationService.getByVacancy(jobVacancyId!),
        enabled: open && Boolean(jobVacancyId),
    });

    const application = (applicationsQuery.data ?? []).find((row) => row.id === applicationId) ?? null;

    useEffect(() => {
        if (!open) setScoreDetailOpen(false);
    }, [open]);

    const candidate = detailQuery.data;
    const canOpenScore = Boolean(jobVacancyId && applicationId && candidateId);
    const score = applicationAiScore(application);
    const pending = isApplicationAiPending(application);
    const scoreTarget: CandidateMatchScoreDetailTarget | null =
        canOpenScore && applicationId && candidateId
            ? {
                  applicationId,
                  candidateId,
                  candidateName: candidateName ?? candidate?.fullName,
              }
            : null;

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title="Perfil do candidato"
                subtitle={candidate?.fullName ?? "Carregando dados do candidato…"}
                size="3xl"
                actions={[{ title: "Fechar", variant: "ghost", onClick: onClose }]}
            >
                        {detailQuery.isLoading ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="skeleton-shimmer h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : null}

                        {detailQuery.isError ? (
                            <p className="text-sm text-error">
                                {ExceptionCapture.displayMessage(
                                    detailQuery.error,
                                    "Não foi possível carregar o candidato.",
                                )}
                            </p>
                        ) : null}

                        {candidate ? (
                            <CandidateProfileView
                                candidate={candidate}
                                curriculumRowActionsExtra={
                                    canOpenScore ? (
                                        <TableActionButton
                                            actionVariant="open"
                                            aria-label={
                                                pending
                                                    ? "Análise em andamento"
                                                    : score != null
                                                      ? `Análise de compatibilidade: ${score}%`
                                                      : "Abrir análise de compatibilidade"
                                            }
                                            title={
                                                pending
                                                    ? "Análise em andamento"
                                                    : score != null
                                                      ? `Compatibilidade: ${score}%`
                                                      : "Análise de compatibilidade"
                                            }
                                            leftIcon={<Gauge className="size-3.5" />}
                                            onClick={() => setScoreDetailOpen(true)}
                                        />
                                    ) : null
                                }
                            />
                        ) : null}
            </Modal>

            <CandidateMatchScoreDetailModal
                open={scoreDetailOpen && Boolean(scoreTarget)}
                jobVacancyId={jobVacancyId ?? null}
                target={scoreTarget}
                onClose={() => setScoreDetailOpen(false)}
            />
        </>
    );
}
