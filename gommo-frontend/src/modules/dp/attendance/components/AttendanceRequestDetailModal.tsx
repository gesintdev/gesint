"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { AttendanceRequest } from "@/modules/dp/attendance/dto/attendance-record.dto";
import { Button } from "@/shared/components/ui/Button";

const REQUEST_TYPE_LABEL: Record<string, string> = {
    TIME_ADJUSTMENT: "Ajuste de ponto",
    DAY_ABSENCE_EXCUSE: "Abono de dia",
    MEDICAL_CERTIFICATE: "Atestado médico",
    LEAVE_ABSENCE: "Afastamento",
    HOUR_BANK: "Banco de horas",
    OTHER: "Outro",
};

const STATUS_LABEL: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovada",
    REJECTED: "Reprovada",
};

function formatTime(value?: string | null) {
    return value ? value.slice(0, 5) : "—";
}

function formatDate(value?: string | null) {
    if (!value) return "—";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
}

type CompareRow = {
    label: string;
    original?: string | null;
    requested?: string | null;
};

type AttendanceRequestDetailModalProps = {
    request: AttendanceRequest | null;
    open: boolean;
    reviewing?: boolean;
    onClose: () => void;
    onApprove?: () => void;
    onReject?: (_reason: string) => void;
};

export function AttendanceRequestDetailModal({
    request,
    open,
    reviewing = false,
    onClose,
    onApprove,
    onReject,
}: AttendanceRequestDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [rejectMode, setRejectMode] = useState(false);
    const [reason, setReason] = useState("");

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

    useEffect(() => {
        if (!open) {
            setRejectMode(false);
            setReason("");
        }
    }, [open]);

    if (!mounted || !request) {
        return null;
    }

    const rows: CompareRow[] = [
        { label: "Entrada", original: request.originalClockIn, requested: request.clockIn },
        { label: "Saída almoço", original: request.originalBreakStart, requested: request.breakStart },
        { label: "Retorno almoço", original: request.originalBreakEnd, requested: request.breakEnd },
        { label: "Saída", original: request.originalClockOut, requested: request.clockOut },
        { label: "Justificativa", original: request.originalNotes, requested: request.notes },
    ];

    const isPending = request.requestStatus === "PENDING";

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <h4 className="text-base font-semibold text-base-content">
                            Solicitação #{request.code}
                        </h4>
                        <p className="mt-1 text-sm text-base-content/65">
                            {request.collaboratorName ?? "Colaborador"} · {formatDate(request.workDate)} ·{" "}
                            {REQUEST_TYPE_LABEL[request.requestType] ?? request.requestType}
                        </p>
                        <span className="badge badge-ghost mt-2">
                            {STATUS_LABEL[request.requestStatus] ?? request.requestStatus}
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
                    <div className="overflow-hidden rounded-xl border border-base-300">
                        <table className="table table-sm">
                            <thead>
                                <tr className="bg-base-200/60">
                                    <th className="w-40">Campo</th>
                                    <th>Original</th>
                                    <th>Solicitado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => {
                                    const changed =
                                        (row.original ?? "") !== (row.requested ?? "") &&
                                        (row.requested != null && row.requested !== "");
                                    return (
                                        <tr key={row.label} className={changed ? "bg-warning/10" : undefined}>
                                            <td className="font-medium">{row.label}</td>
                                            <td className="whitespace-pre-wrap text-base-content/70">
                                                {row.label === "Justificativa"
                                                    ? row.original || "—"
                                                    : formatTime(row.original)}
                                            </td>
                                            <td
                                                className={
                                                    changed
                                                        ? "whitespace-pre-wrap font-medium text-base-content"
                                                        : "whitespace-pre-wrap text-base-content/70"
                                                }
                                            >
                                                {row.label === "Justificativa"
                                                    ? row.requested || "—"
                                                    : formatTime(row.requested)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {!isPending && (request.reviewReason || request.reviewedAt) ? (
                        <div className="mt-4 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 text-sm">
                            <p className="font-medium text-base-content">Revisão</p>
                            {request.reviewedAt ? (
                                <p className="mt-1 text-base-content/65">
                                    Em {new Date(request.reviewedAt).toLocaleString("pt-BR")}
                                </p>
                            ) : null}
                            {request.reviewReason ? (
                                <p className="mt-2 whitespace-pre-wrap text-base-content/80">
                                    {request.reviewReason}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {isPending && rejectMode ? (
                        <div className="mt-4">
                            <label className="text-sm font-medium text-base-content">
                                Motivo da reprovação
                            </label>
                            <textarea
                                className="textarea textarea-bordered mt-2 min-h-28 w-full rounded-lg"
                                value={reason}
                                onChange={(event) => setReason(event.target.value)}
                                placeholder="Informe o motivo para manter histórico de auditoria"
                            />
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-base-content/10 px-5 py-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                    {isPending && !rejectMode ? (
                        <>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => setRejectMode(true)}
                                disabled={reviewing}
                            >
                                Reprovar
                            </Button>
                            <Button
                                type="button"
                                variant="success"
                                loading={reviewing}
                                onClick={onApprove}
                            >
                                Aprovar
                            </Button>
                        </>
                    ) : null}
                    {isPending && rejectMode ? (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setRejectMode(false);
                                    setReason("");
                                }}
                            >
                                Voltar
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                loading={reviewing}
                                onClick={() => onReject?.(reason)}
                            >
                                Confirmar reprovação
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
        </dialog>,
        document.body,
    );
}

