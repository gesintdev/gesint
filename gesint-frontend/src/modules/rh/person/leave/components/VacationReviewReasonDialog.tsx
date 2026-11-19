"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";
import { ModalHeader } from "@/shared/components/ui/ModalHeader";

type Props = {
    open: boolean;
    title: string;
    confirmLabel: string;
    hint?: string;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading?: boolean;
};

export function VacationReviewReasonDialog({
    open,
    title,
    confirmLabel,
    hint = LEAVE_VACATION_CRUD_LABELS.reviewReasonHint,
    onClose,
    onConfirm,
    loading,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    if (!mounted) return null;

    // Portal + backdrop em button: evita <form> aninhado no CrudFormShell.
    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex max-w-md flex-col gap-0 p-0">
                <ModalHeader title={title} subtitle={hint} onClose={onClose} closeDisabled={loading} />
                <div className="px-4 py-4">
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
                <div className="modal-action mt-0 px-4 pb-4">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="primary" onClick={handleConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
        </dialog>,
        document.body,
    );
}
