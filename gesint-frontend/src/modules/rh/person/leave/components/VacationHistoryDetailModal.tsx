"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
    formatPeriodRange,
    type VacationHistoryRow,
} from "@/modules/rh/person/leave/lib/leave-history.enrich";
import { inclusiveDays } from "@/modules/rh/person/vacation/lib/vacation-rules";
import { Button } from "@/shared/components/ui/Button";

const STATUS_LABEL: Record<string, string> = {
    PENDING: "Aguardando DP",
    APPROVED: "Concedida",
    IN_VACATION: "Em férias",
    RETURNED: "Devolvida",
    REJECTED: "Reprovada",
};

const REVIEW_STATUS_LABEL: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovada",
    RETURNED: "Devolvida",
    REJECTED: "Reprovada",
};

const RECESS_MODE_LABEL: Record<string, string> = {
    FULLY_PAID: "Integralmente pago",
    UNPAID: "Não remunerado",
    PROPORTIONAL: "Proporcional",
    CUSTOM: "Personalizado",
};

function formatDateTime(iso?: string | null): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("pt-BR");
}

function formatMoney(value?: number | null): string {
    if (value == null) return "—";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="min-w-0 rounded-lg border border-base-content/8 bg-base-200/30 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">{label}</p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-base-content">{value || "—"}</p>
        </div>
    );
}

type VacationHistoryDetailModalProps = {
    row: VacationHistoryRow | null;
    open: boolean;
    onClose: () => void;
};

export function VacationHistoryDetailModal({ row, open, onClose }: VacationHistoryDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    if (!mounted || !row) {
        return null;
    }

    const siblings = row.splitSiblings ?? [row];
    const isFractionated = Boolean(row.splitGroupId) && siblings.length > 1;
    const grantedBy = row.reviewedByName || (row.approved ? row.createdByName : null);
    const groupPecuniary = siblings.reduce((sum, item) => sum + (item.pecuniaryAllowanceDays ?? 0), 0);
    const daysEntitled =
        siblings.find((item) => item.vacationDaysEntitled != null)?.vacationDaysEntitled ??
        row.vacationDaysEntitled;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <h4 className="text-base font-semibold text-base-content">
                            Férias #{row.code}
                        </h4>
                        <p className="mt-1 text-sm text-base-content/65">
                            {row.collaboratorName ?? "Colaborador"} · {row.gozoPeriodLabel}
                        </p>
                        <span className="badge badge-ghost mt-2">
                            {STATUS_LABEL[row.rhVacationStatus] ?? row.rhVacationStatus}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-4">
                    <section className="grid gap-2 sm:grid-cols-2">
                        <DetailField label="Período aquisitivo" value={row.acquisitionPeriodLabel} />
                        <DetailField label="Período concessivo" value={row.concessivePeriodLabel} />
                        <DetailField label="Gozo deste período" value={row.gozoPeriodLabel} />
                        <DetailField label="Dias de gozo" value={row.gozoDays} />
                        <DetailField
                            label="Dias acordados"
                            value={daysEntitled != null ? String(daysEntitled) : "—"}
                        />
                        <DetailField
                            label="Abono pecuniário"
                            value={String(groupPecuniary)}
                        />
                        <DetailField label="Dias restantes" value={row.remainingDaysLabel} />
                        <DetailField label="Fracionado" value={row.fractionatedLabel} />
                        <DetailField
                            label="Faltas injustificadas"
                            value={row.unjustifiedAbsences ?? "—"}
                        />
                        <DetailField label="Faltas justificadas" value={row.justifiedAbsences ?? "—"} />
                        <DetailField
                            label="Salário base (snapshot)"
                            value={formatMoney(row.baseSalarySnapshot)}
                        />
                        <DetailField
                            label="Status da revisão"
                            value={
                                row.reviewStatus
                                    ? (REVIEW_STATUS_LABEL[row.reviewStatus] ?? row.reviewStatus)
                                    : "—"
                            }
                        />
                    </section>

                    {isFractionated ? (
                        <section className="mt-4">
                            <h5 className="mb-2 text-sm font-semibold text-base-content">
                                Períodos do fracionamento
                            </h5>
                            <div className="overflow-hidden rounded-xl border border-base-300">
                                <table className="table table-sm">
                                    <thead>
                                        <tr className="bg-base-200/60">
                                            <th>Seq.</th>
                                            <th>Gozo</th>
                                            <th className="text-right">Dias</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {siblings.map((sibling) => {
                                            const days =
                                                sibling.durationDays ??
                                                (sibling.startDate && sibling.endDate
                                                    ? inclusiveDays(sibling.startDate, sibling.endDate)
                                                    : 0);
                                            return (
                                                <tr
                                                    key={sibling.id}
                                                    className={
                                                        sibling.id === row.id
                                                            ? "bg-primary/5 font-medium"
                                                            : undefined
                                                    }
                                                >
                                                    <td>{sibling.splitSequence ?? "—"}</td>
                                                    <td>
                                                        {formatPeriodRange(
                                                            sibling.startDate,
                                                            sibling.endDate,
                                                        )}
                                                    </td>
                                                    <td className="text-right">{days}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ) : null}

                    <section className="mt-4 grid gap-2 sm:grid-cols-2">
                        <DetailField label="Concedido por" value={grantedBy} />
                        <DetailField label="Data da concessão" value={formatDateTime(row.reviewedAt)} />
                        <DetailField label="Solicitado por" value={row.createdByName} />
                        <DetailField label="Criado em" value={formatDateTime(row.createdAt)} />
                        <DetailField label="Atualizado em" value={formatDateTime(row.updatedAt)} />
                        {row.reviewReason ? (
                            <DetailField label="Motivo da revisão" value={row.reviewReason} />
                        ) : null}
                        {row.notes ? <DetailField label="Observações" value={row.notes} /> : null}
                        {row.recessPeriodId ? (
                            <>
                                <DetailField
                                    label="Modo financeiro (recesso)"
                                    value={
                                        row.recessFinancialMode
                                            ? (RECESS_MODE_LABEL[row.recessFinancialMode] ??
                                              row.recessFinancialMode)
                                            : "—"
                                    }
                                />
                                <DetailField
                                    label="% pago (recesso)"
                                    value={
                                        row.recessPaidPercentage != null
                                            ? `${row.recessPaidPercentage}%`
                                            : "—"
                                    }
                                />
                            </>
                        ) : null}
                    </section>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-base-content/10 px-5 py-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
        </dialog>,
        document.body,
    );
}
