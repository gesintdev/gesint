"use client";

import {useEffect, useRef, useState} from "react";

import {Button} from "@/shared/components/ui/Button";
import {InputString} from "@/shared/components/ui/input/index";
import {ModalHeader} from "@/shared/components/ui/ModalHeader";

type AttendanceRequestRejectDialogProps = {
    open: boolean;
    loading?: boolean;
    onClose: () => void;
    onConfirm: (_reason: string) => void;
};

export function AttendanceRequestRejectDialog({
                                                  open,
                                                  loading = false,
                                                  onClose,
                                                  onConfirm,
                                              }: AttendanceRequestRejectDialogProps) {
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
            setError("Informe o motivo da recusa.");
            return;
        }
        onConfirm(reason.trim());
    };

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex max-w-md flex-col gap-0 p-0">
                <ModalHeader
                    title="Recusar solicitação"
                    subtitle="Informe o motivo para manter o histórico de auditoria."
                    onClose={onClose}
                    closeDisabled={loading}
                />
                <div className="px-4 py-4">
                    <InputString
                        label="Motivo"
                        value={reason}
                        onValueChange={(value) => {
                            setReason(value);
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
                    <Button type="button" variant="danger" onClick={handleConfirm} loading={loading}>
                        Recusar
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
