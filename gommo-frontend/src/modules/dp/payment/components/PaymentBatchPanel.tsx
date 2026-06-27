"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { type ChangeEvent, type RefObject } from "react";
import { toast } from "sonner";

import { PaymentSlipPanel } from "@/modules/dp/payment/components/PaymentSlipPanel";
import { PAYMENT_BATCH_TABLE_COLUMNS } from "@/modules/dp/payment/config/payment.table-columns";
import type { PaymentBatch } from "@/modules/dp/payment/dto/payment.dto";
import { PAYMENT_CLIENT_MESSAGES } from "@/modules/dp/payment/exceptions/payment.messages";
import { usePaymentBatchUpload } from "@/modules/dp/payment/hooks/usePaymentBatchUpload";
import { paymentBatchKeys } from "@/modules/dp/payment/payment.query";
import { paymentBatchService } from "@/modules/dp/payment/services/payment-batch.service";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

type PaymentBatchRow = PaymentBatch & {
    batchTypeLabel: string;
};

type PaymentBatchUploadButtonProps = {
    canWrite: boolean;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleUploadClick: () => void;
    uploadMutation: UseMutationResult<Awaited<ReturnType<typeof paymentBatchService.upload>>, unknown, File, unknown>;
    uploadProgress: ReturnType<typeof usePaymentBatchUpload>["uploadProgress"];
};

export function PaymentBatchUploadButton({
    canWrite,
    fileInputRef,
    handleFileChange,
    handleUploadClick,
    uploadMutation,
    uploadProgress,
}: PaymentBatchUploadButtonProps) {
    if (!canWrite) {
        return null;
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileChange}
            />
            <Button
                type="button"
                variant="primary"
                leftIcon={<FileUp className="size-4" />}
                loading={uploadMutation.isPending}
                disabled={uploadProgress !== null}
                onClick={handleUploadClick}
            >
                Carregar Arquivo
            </Button>
        </>
    );
}

type PaymentBatchPanelProps = {
    periodId: string;
    periodLabel: string;
    upload: ReturnType<typeof usePaymentBatchUpload>;
    showUploadButton?: boolean;
};

export function PaymentBatchPanel({ periodId, periodLabel, upload, showUploadButton = false }: PaymentBatchPanelProps) {
    const {
        canWrite,
        uploadProgress,
        fileInputRef,
        uploadMutation,
        handleUploadClick,
        handleFileChange,
        progressPercent,
        selectedBatchId,
        setSelectedBatchId,
        selectedBatchStatus,
        setSelectedBatchStatus,
        slipRefreshToken,
        invalidate,
        clearSelectionIfBatch,
    } = upload;
    const loadBatchRows = async (): Promise<PaymentBatchRow[]> => {
        const batches = await paymentBatchService.getByPeriod(periodId);
        return batches.map((batch) => ({
            ...batch,
            batchTypeLabel: batch.batchType === "SALARY" ? "Salário" : batch.batchType,
        }));
    };
    const deleteMutation = useMutation({
        mutationFn: (batchId: string) => paymentBatchService.remove(batchId),
        onSuccess: async (_data, batchId) => {
            await invalidate();
            clearSelectionIfBatch(batchId);
            toast.success("Lote excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_LOAD_FAILED }),
    });
    const handleDelete = async (batch: PaymentBatch) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(batch.id);
    };

    return (
        <div className="grid w-full min-w-0 content-start gap-4">
            {uploadProgress ? (
                <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-base-content">Processando holerites...</span>
                        <span className="text-base-content/70">
                            {uploadProgress.current} / {uploadProgress.total} páginas
                        </span>
                    </div>
                    <progress className="progress progress-primary w-full" value={progressPercent} max={100} />
                </div>
            ) : null}
            {showUploadButton ? (
                <PaymentBatchUploadButton
                    canWrite={canWrite}
                    fileInputRef={fileInputRef}
                    handleFileChange={handleFileChange}
                    handleUploadClick={handleUploadClick}
                    uploadMutation={uploadMutation}
                    uploadProgress={uploadProgress}
                />
            ) : null}
            <div className="min-w-0 w-full">
                <QueryTablePanel<PaymentBatchRow>
                    queryKey={paymentBatchKeys.byPeriod(periodId)}
                    request={loadBatchRows}
                    columns={PAYMENT_BATCH_TABLE_COLUMNS}
                    onRowClick={(row) => {
                        setSelectedBatchId(row.id);
                        setSelectedBatchStatus(row.batchStatus);
                    }}
                    renderActions={(row) => (
                        <CrudTableActions
                            row={row}
                            onEdit={() => setSelectedBatchId(row.id)}
                            onDelete={canWrite ? () => void handleDelete(row) : undefined}
                            deleteLoading={deleteMutation.isPending}
                        />
                    )}
                />
            </div>
            {selectedBatchId ? (
                <PaymentSlipPanel
                    key={`${selectedBatchId}-${slipRefreshToken}`}
                    batchId={selectedBatchId}
                    periodLabel={periodLabel}
                    canWrite={canWrite}
                    refreshToken={slipRefreshToken}
                    isProcessing={selectedBatchStatus === "PROCESSING" || uploadProgress !== null}
                    onClose={() => {
                        setSelectedBatchId(null);
                        setSelectedBatchStatus(null);
                    }}
                />
            ) : null}
        </div>
    );
}
