"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { PaymentBatchPanel, PaymentBatchUploadButton } from "@/modules/dp/payment/components/PaymentBatchPanel";
import type { PaymentPeriodCreateDto } from "@/modules/dp/payment/dto/payment.dto";
import { PAYMENT_CLIENT_MESSAGES } from "@/modules/dp/payment/exceptions/payment.messages";
import { usePaymentBatchUpload } from "@/modules/dp/payment/hooks/usePaymentBatchUpload";
import {
    emptyPaymentPeriodForm,
    formatPaymentReference,
    paymentPeriodToFormDto,
} from "@/modules/dp/payment/lib/payment.mapper";
import { paymentPeriodKeys } from "@/modules/dp/payment/payment.query";
import { paymentPeriodService } from "@/modules/dp/payment/services/payment-period.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputMonth, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

export function PaymentPeriodFormClient() {
    const { editingId, isEditing, goToList, startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<PaymentPeriodCreateDto>(() => emptyPaymentPeriodForm());
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: paymentPeriodKeys.detail(editingId ?? ""),
        queryFn: () => paymentPeriodService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const periodId = editingId ?? detailQuery.data?.id;
    const batchUpload = usePaymentBatchUpload(periodId);
    const formSteps: FormStepNavItem[] = [{ id: "cadastro", label: "Per\u00edodo" }];

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyPaymentPeriodForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(paymentPeriodToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: PaymentPeriodCreateDto) => {
            const payload: PaymentPeriodCreateDto = {
                referenceDate: dto.referenceDate,
                notes: dto.notes,
            };
            if (isEditing && editingId) return paymentPeriodService.update(editingId, payload);
            return paymentPeriodService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({ queryKey: paymentPeriodKeys.all });
            await queryClient.invalidateQueries({ queryKey: paymentPeriodKeys.detail(saved.id) });
            toast.success(isEditing ? "Período atualizado" : "Período cadastrado");
            startEdit(saved.id);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof PaymentPeriodCreateDto>(field: K, value: PaymentPeriodCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: formSteps,
                resetKey: periodId ?? "new",
                entityCode: detailQuery.data?.code,
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        {periodId ? "Voltar para lista" : "Cancelar"}
                    </Button>
                    <Button type="submit" variant="primary" loading={saveMutation.isPending}>
                        Salvar período
                    </Button>
                </>
            }
        >
            <div className="flex min-h-[70vh] flex-col gap-2 pb-16">
                {error ? <p className="text-sm text-error">{error}</p> : null}
                <FormSection id="cadastro" title="Competência de pagamentos" bodyClassName="!grid-cols-1">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                        <div className="w-full shrink-0 lg:w-auto lg:min-w-[11rem]">
                            <InputMonth
                                label="Competência (MM/AAAA)"
                                value={form.referenceDate}
                                onValueChange={(value) => update("referenceDate", value)}
                                required
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <InputString
                                label="Observações"
                                value={form.notes ?? ""}
                                onValueChange={(value) => update("notes", value)}
                            />
                        </div>
                        {periodId ? (
                            <div className="shrink-0">
                                <span className="gommo-label invisible block select-none" aria-hidden>
                                    &nbsp;
                                </span>
                                <PaymentBatchUploadButton
                                    canWrite={batchUpload.canWrite}
                                    fileInputRef={batchUpload.fileInputRef}
                                    handleFileChange={batchUpload.handleFileChange}
                                    handleUploadClick={batchUpload.handleUploadClick}
                                    uploadMutation={batchUpload.uploadMutation}
                                    uploadProgress={batchUpload.uploadProgress}
                                />
                            </div>
                        ) : null}
                    </div>
                </FormSection>
                {periodId ? (
                    <PaymentBatchPanel
                        periodId={periodId}
                        periodLabel={formatPaymentReference(form.referenceDate)}
                        upload={batchUpload}
                    />
                ) : null}
            </div>
        </CrudFormShell>
    );
}
