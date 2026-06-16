"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PaymentBatch } from "@/modules/payment/dto/payment.dto";
import { PAYMENT_CLIENT_MESSAGES } from "@/modules/payment/exceptions/payment.messages";
import { paymentBatchKeys } from "@/modules/payment/payment.query";
import { paymentBatchService } from "@/modules/payment/services/payment-batch.service";
import { ExceptionCapture } from "@/shared/exceptions";
import {
    deriveWritePermission,
    useSessionPermissions,
} from "@/shared/auth/permissions";
import { canWriteRoute } from "@/shared/auth/route-access";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";
import { findRouteById } from "@/shared/workspace/workspace-routes";

export type PaymentBatchUploadProgress = {
    batchId: string;
    current: number;
    total: number;
};

export function usePaymentBatchUpload(periodId: string | undefined) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<PaymentBatchUploadProgress | null>(null);
    const [slipRefreshToken, setSlipRefreshToken] = useState(0);
    const [selectedBatchStatus, setSelectedBatchStatus] = useState<PaymentBatch["batchStatus"] | null>(null);
    const permissions = useSessionPermissions();
    const wsTab = useWorkspaceTabOptional();
    const route = wsTab ? findRouteById(wsTab.tab.routeId) : undefined;
    const canWrite = canWriteRoute(route, permissions, deriveWritePermission(route?.permission));

    const invalidateSlips = async (batchId: string) => {
        await queryClient.invalidateQueries({ queryKey: ["payment-slip", batchId] });
        setSlipRefreshToken((value) => value + 1);
    };

    const invalidate = async () => {
        if (!periodId) return;
        await queryClient.invalidateQueries({ queryKey: paymentBatchKeys.byPeriod(periodId) });
    };

    const uploadMutation = useMutation({
        mutationFn: (file: File) => {
            if (!periodId) {
                return Promise.reject(new Error("Period not saved"));
            }
            return paymentBatchService.upload(periodId, file);
        },
        onSuccess: async (result) => {
            await invalidate();
            setSelectedBatchId(result.batch.id);
            setSelectedBatchStatus(result.batch.batchStatus);
            const total = result.batch.totalPages ?? 0;
            if (result.batch.batchStatus === "PROCESSING" && total > 0) {
                setUploadProgress({ batchId: result.batch.id, current: 0, total });
            } else {
                await invalidateSlips(result.batch.id);
                toast.success(
                    `Arquivo processado (${result.processedCount} holerite${result.processedCount === 1 ? "" : "s"})`,
                );
            }
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_UPLOAD_FAILED }),
    });

    useEffect(() => {
        if (!uploadProgress || !periodId) {
            return;
        }

        let cancelled = false;

        const poll = async () => {
            try {
                const batches = await paymentBatchService.getByPeriod(periodId);
                if (cancelled) {
                    return;
                }
                const batch = batches.find((item) => item.id === uploadProgress.batchId);
                if (!batch) {
                    return;
                }
                if (batch.batchStatus === "PROCESSING") {
                    setSelectedBatchStatus("PROCESSING");
                    setUploadProgress({
                        batchId: batch.id,
                        current: batch.processingPage ?? 0,
                        total: batch.totalPages ?? uploadProgress.total,
                    });
                    return;
                }
                setUploadProgress(null);
                setSelectedBatchStatus(batch.batchStatus);
                await invalidate();
                await invalidateSlips(batch.id);
                toast.success("Processamento conclu\u00eddo");
            } catch {
                // keep polling on transient errors
            }
        };

        void poll();
        const intervalId = window.setInterval(() => void poll(), 800);
        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [periodId, uploadProgress?.batchId, queryClient]);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            toast.error("Selecione um arquivo PDF.");
            return;
        }
        uploadMutation.mutate(file);
    };

    const clearSelectionIfBatch = (batchId: string) => {
        if (selectedBatchId === batchId) {
            setSelectedBatchId(null);
        }
        if (uploadProgress?.batchId === batchId) {
            setUploadProgress(null);
        }
    };

    const progressPercent =
        uploadProgress && uploadProgress.total > 0
            ? Math.min(100, Math.round((uploadProgress.current / uploadProgress.total) * 100))
            : 0;

    return {
        fileInputRef,
        canWrite,
        uploadProgress,
        progressPercent,
        uploadMutation,
        selectedBatchId,
        setSelectedBatchId,
        selectedBatchStatus,
        setSelectedBatchStatus,
        slipRefreshToken,
        invalidate,
        invalidateSlips,
        handleUploadClick,
        handleFileChange,
        clearSelectionIfBatch,
    };
}
