"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {Button} from "@/shared/components/ui/Button";
import {InputString} from "@/shared/components/ui/input/index";

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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [justification, setJustification] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            setJustification("");
            setError(null);
            dialog.showModal();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    const handleConfirm = () => {
        if (!justification.trim()) {
            setError("Informe a justificativa.");
            return;
        }
        onConfirm(justification.trim());
    };

    if (!mounted) return null;

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-md">
                <h3 className="text-base font-semibold">Conceder dado sensível / financeiro</h3>
                <p className="mt-1 text-sm text-base-content/65">
                    Informe a justificativa para liberar este acesso. A concessão poderá ser auditada.
                </p>
                <div className="mt-4">
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
                </div>
                <div className="modal-action">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="primary" onClick={handleConfirm}>
                        Conceder
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    fechar
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
