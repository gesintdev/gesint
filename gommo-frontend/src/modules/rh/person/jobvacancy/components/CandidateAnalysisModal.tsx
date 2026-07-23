"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import { CandidateProfileView } from "@/modules/rh/person/jobvacancy/components/CandidateProfileView";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

type CandidateAnalysisModalProps = {
    open: boolean;
    candidateId: string | null;
    onClose: () => void;
};

export function CandidateAnalysisModal({ open, candidateId, onClose }: CandidateAnalysisModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);

    const detailQuery = useQuery({
        queryKey: candidateKeys.detail(candidateId ?? ""),
        queryFn: () => candidateService.getById(candidateId!),
        enabled: open && Boolean(candidateId),
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

    const candidate = detailQuery.data;

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
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
                        onClick={onClose}
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

                    {candidate ? <CandidateProfileView candidate={candidate} /> : null}
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
        </dialog>,
        document.body,
    );
}
