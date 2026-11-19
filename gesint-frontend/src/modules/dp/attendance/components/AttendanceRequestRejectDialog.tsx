"use client";

import { useEffect, useState } from "react";

import { InputString } from "@/shared/components/ui/input/index";
import { Modal } from "@/shared/components/ui/Modal";

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
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setReason("");
        setError(null);
    }, [open]);

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Informe o motivo da recusa.");
            return;
        }
        onConfirm(reason.trim());
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Recusar solicitação"
            subtitle="Informe o motivo para manter o histórico de auditoria."
            size="sm"
            closeDisabled={loading}
            actions={[
                { title: "Cancelar", variant: "ghost", onClick: onClose, disabled: loading },
                { title: "Recusar", variant: "danger", onClick: handleConfirm, loading },
            ]}
        >
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
        </Modal>
    );
}
