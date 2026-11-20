"use client";

import { useEffect, useState } from "react";

import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import { InputString } from "@/shared/components/ui/input/index";
import { Modal } from "@/shared/components/ui/Modal";

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
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setReason("");
        setError(null);
    }, [open]);

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Informe o motivo.");
            return;
        }
        onConfirm(reason.trim());
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            subtitle={hint}
            size="sm"
            closeDisabled={loading}
            actions={[
                { title: "Cancelar", variant: "ghost", onClick: onClose, disabled: loading },
                { title: confirmLabel, onClick: handleConfirm, loading, disabled: loading },
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
