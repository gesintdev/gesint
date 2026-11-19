"use client";

import { useEffect, useState } from "react";

import { InputString } from "@/shared/components/ui/input/index";
import { Modal } from "@/shared/components/ui/Modal";

type SensitivePermissionJustificationDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: (_justification: string) => void;
};

export function SensitivePermissionJustificationDialog({
    open,
    onClose,
    onConfirm,
}: SensitivePermissionJustificationDialogProps) {
    const [justification, setJustification] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setJustification("");
        setError(null);
    }, [open]);

    const handleConfirm = () => {
        if (!justification.trim()) {
            setError("Informe a justificativa.");
            return;
        }
        onConfirm(justification.trim());
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Conceder dado sensível / financeiro"
            subtitle="Informe a justificativa para liberar este acesso. A concessão poderá ser auditada."
            size="sm"
            actions={[
                { title: "Cancelar", variant: "ghost", onClick: onClose },
                { title: "Conceder", onClick: handleConfirm },
            ]}
        >
            <InputString
                label="Justificativa"
                value={justification}
                onValueChange={(value) => {
                    setJustification(value);
                    if (error) setError(null);
                }}
                required
                error={error ?? undefined}
            />
        </Modal>
    );
}
