"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PaymentSlip } from "@/modules/payment/dto/payment.dto";
import { formatPersonName } from "@/modules/payment/lib/format-person-name";
import { storageService } from "@/modules/storage/services/storage.service";
import { Button } from "@/shared/components/ui/Button";

type PaymentSlipReviewDialogProps = {
    slip: PaymentSlip | null;
    open: boolean;
    canValidate: boolean;
    validating?: boolean;
    onClose: () => void;
    onValidate?: () => void;
};

export function PaymentSlipReviewDialog({
    slip,
    open,
    canValidate,
    validating = false,
    onClose,
    onValidate,
}: PaymentSlipReviewDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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

    useEffect(() => {
        if (!open || !slip?.slipObjectId) {
            setPdfUrl(null);
            return;
        }
        let active = true;
        void storageService.fetchBlobUrl(slip.slipObjectId).then((url) => {
            if (active) {
                setPdfUrl(url);
            }
        });
        return () => {
            active = false;
        };
    }, [open, slip?.slipObjectId]);

    if (!mounted) {
        return null;
    }

    const title =
        slip?.extractedNameDisplay ??
        formatPersonName(slip?.extractedName) ??
        "Holerite";

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex max-h-[92vh] w-full max-w-5xl flex-col gap-4 p-0">
                <div className="flex items-center justify-between gap-3 border-b border-base-content/10 px-4 py-3">
                    <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold">{title}</h4>
                        {slip?.collaboratorNameDisplay ? (
                            <p className="truncate text-sm text-base-content/70">
                                Encontrado: {slip.collaboratorNameDisplay}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        {canValidate && onValidate ? (
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                leftIcon={<Check className="size-4" />}
                                loading={validating}
                                onClick={onValidate}
                            >
                                Validar
                            </Button>
                        ) : null}
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label="Fechar"
                            onClick={onClose}
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
                <div className="min-h-[60vh] flex-1 bg-base-200">
                    {pdfUrl ? (
                        <iframe title="Holerite" src={pdfUrl} className="h-[70vh] w-full border-0" />
                    ) : (
                        <div className="flex h-[70vh] items-center justify-center text-sm text-base-content/60">
                            Carregando holerite...
                        </div>
                    )}
                </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={onClose} />
        </dialog>,
        document.body,
    );
}
