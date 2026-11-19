"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import type { PaymentSlip } from "@/modules/dp/payment/dto/payment.dto";
import { formatPersonName } from "@/modules/dp/payment/lib/format-person-name";
import { storageService } from "@/modules/storage/services/storage.service";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";

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
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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

    const title = slip?.extractedNameDisplay ?? formatPersonName(slip?.extractedName) ?? "Holerite";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            subtitle={
                slip?.collaboratorNameDisplay
                    ? `Encontrado: ${slip.collaboratorNameDisplay}`
                    : undefined
            }
            headerActions={
                canValidate && onValidate ? (
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
                ) : null
            }
            size="4xl"
            padded={false}
            scroll={false}
            bodyClassName="flex flex-col overflow-hidden"
        >
            <div className="min-h-[60vh] flex-1 bg-base-200">
                {pdfUrl ? (
                    <iframe title="Holerite" src={pdfUrl} className="h-[70vh] w-full border-0" />
                ) : (
                    <div className="flex h-[70vh] items-center justify-center text-sm text-base-content/60">
                        Carregando holerite...
                    </div>
                )}
            </div>
        </Modal>
    );
}
