"use client";

import { useQuery } from "@tanstack/react-query";
import { Gauge, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import {
    CandidateMatchScoreDetailModal,
    type CandidateMatchScoreDetailTarget,
} from "@/modules/rh/person/jobvacancy/components/CandidateMatchScoreDetailModal";
import { CandidateProfileView } from "@/modules/rh/person/jobvacancy/components/CandidateProfileView";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import { mockMatchScore } from "@/modules/rh/person/jobvacancy/lib/mock-match-score-breakdown";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { Button } from "@/shared/components/ui/Button";
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [scoreDetailOpen, setScoreDetailOpen] = useState(false);

    const detailQuery = useQuery({
        queryKey: candidateKeys.detail(candidateId ?? ""),
        queryFn: () => candidateService.getById(candidateId!),
        enabled: open && Boolean(candidateId),
    });

    const vacancyQuery = useQuery({
        queryKey: jobVacancyKeys.detail(jobVacancyId ?? ""),
        queryFn: () => jobVacancyService.getById(jobVacancyId!),
        enabled: open && Boolean(jobVacancyId),
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) setScoreDetailOpen(false);
    }, [open]);

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

    const candidate = detailQuery.data;
    const canOpenScore = Boolean(jobVacancyId && applicationId && candidateId);
    const score = applicationId ? mockMatchScore(applicationId, vacancyQuery.data) : null;
    const scoreTarget: CandidateMatchScoreDetailTarget | null =
        canOpenScore && applicationId && candidateId
            ? {
                  applicationId,
                  candidateId,
                  candidateName: candidateName ?? candidate?.fullName,
              }
            : null;

    return createPortal(
        <>
            <dialog
                ref={dialogRef}
                className="modal"
                onClose={(event) => {
                    // close de dialog aninhado (ex.: preview PDF via portal) sobe na árvore React —
                    // ignore se o alvo não for este dialog.
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
                            <h3 className="text-base font-semibold text-base-content">Perfil do candidato</h3>
                            <p className="mt-0.5 truncate text-sm text-base-content/55">
                                {candidate?.fullName ?? "Carregando dados do candidato…"}
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="Fechar"
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50"
                            onClick={(event) => {
                                event.stopPropagation();
                                onClose();
                            }}
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
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
                                    canOpenScore && score != null ? (
                                        <TableActionButton
                                            actionVariant="open"
                                            aria-label={`Análise de compatibilidade: ${score}%`}
                                            title={`Compatibilidade: ${score}%`}
                                            leftIcon={<Gauge className="size-3.5" />}
                                            onClick={() => setScoreDetailOpen(true)}
                                        />
                                    ) : null
                                }
                            />
                        ) : null}
                    </div>

                    <div className="flex justify-end border-t border-base-content/10 px-5 py-3">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Fechar
                        </Button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit" aria-label="Fechar">
                        close
                    </button>
                </form>
            </dialog>

            <CandidateMatchScoreDetailModal
                open={scoreDetailOpen && Boolean(scoreTarget)}
                jobVacancyId={jobVacancyId ?? null}
                target={scoreTarget}
                onClose={() => setScoreDetailOpen(false)}
            />
        </>,
        document.body,
    );
}
