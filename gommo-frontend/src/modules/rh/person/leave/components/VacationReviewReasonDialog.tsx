"use client";

import { useEffect, useRef, useState } from "react";

import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";

type Props = {
    open: boolean;
    title: string;
    confirmLabel: string;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading?: boolean;
};

export function VacationReviewReasonDialog({ open, title, confirmLabel, onClose, onConfirm, loading }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            setReason("");
            setError(null);
            dialog.showModal();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Informe o motivo.");
            return;
        }
        onConfirm(reason.trim());
    };

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-md">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-base-content/65">{LEAVE_VACATION_CRUD_LABELS.reviewReasonHint}</p>
                <div className="mt-4">
                    <InputString
                        label="Motivo"
                        value={reason}
                        onValueChange={(v) => {
                            setReason(v);
                            if (error) setError(null);
                        }}
                        required
                        error={error ?? undefined}
                    />
                </div>
                <div className="modal-action">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="primary" onClick={handleConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    fechar
                </button>
            </form>
        </dialog>
    );
}
