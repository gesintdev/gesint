"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { formatCpf, formatCellValue, formatPhone } from "@/shared/lib/table/format-cell-value";
import { TableDataType } from "@/shared/types/table.types";

type CandidateAnalysisModalProps = {
    open: boolean;
    candidateId: string | null;
    onClose: () => void;
};

function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-lg border border-base-content/8 bg-base-content/[0.02] px-3 py-2.5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-base-content/40">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-base-content">{value || "—"}</p>
        </div>
    );
}

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
                        <h3 className="text-base font-semibold text-base-content">Análise do candidato</h3>
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

                    {candidate ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailField label="Código" value={candidate.code != null ? String(candidate.code) : "—"} />
                            <DetailField
                                label="Status"
                                value={formatCellValue(candidate.status, TableDataType.BADGE)}
                            />
                            <DetailField label="Nome completo" value={candidate.fullName ?? "—"} />
                            <DetailField
                                label="CPF"
                                value={candidate.cpf ? formatCpf(candidate.cpf) : "—"}
                            />
                            <DetailField label="E-mail" value={candidate.email ?? "—"} />
                            <DetailField
                                label="Telefone"
                                value={candidate.phone ? formatPhone(candidate.phone) : "—"}
                            />
                            <DetailField
                                label="Data de nascimento"
                                value={formatCellValue(candidate.birthDate, TableDataType.DATE)}
                            />
                            <DetailField
                                label="Criado em"
                                value={formatCellValue(candidate.createdAt, TableDataType.DATETIME)}
                            />
                            <DetailField
                                label="Atualizado em"
                                value={formatCellValue(candidate.updatedAt, TableDataType.DATETIME)}
                            />
                        </div>
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
        </dialog>,
        document.body,
    );
}
