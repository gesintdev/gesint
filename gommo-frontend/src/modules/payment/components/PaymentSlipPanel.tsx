"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, Mail, MessageCircle, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PaymentSlipReviewDialog } from "@/modules/payment/components/PaymentSlipReviewDialog";
import {
    PAYMENT_SLIP_DIVERGENT_TABLE_COLUMNS,
    PAYMENT_SLIP_NOT_FOUND_TABLE_COLUMNS,
    PAYMENT_SLIP_TABLE_COLUMNS,
} from "@/modules/payment/config/payment.table-columns";
import type { PaymentSlip, PaymentSlipStatus } from "@/modules/payment/dto/payment.dto";
import { PAYMENT_CLIENT_MESSAGES } from "@/modules/payment/exceptions/payment.messages";
import { formatPersonName } from "@/modules/payment/lib/format-person-name";
import { paymentBatchKeys } from "@/modules/payment/payment.query";
import { paymentBatchService } from "@/modules/payment/services/payment-batch.service";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";
import clsx from "clsx";

type PaymentSlipRow = PaymentSlip & {
    displayName: string;
    extractedNameDisplay: string;
    matchedNameDisplay: string;
};

type SlipTab = "DIVERGENT" | "NOT_FOUND" | "PROCESSED" | "SENT";

type PaymentSlipPanelProps = {
    batchId: string;
    periodLabel: string;
    canWrite: boolean;
    refreshToken?: number;
    isProcessing?: boolean;
    onClose?: () => void;
};

const TAB_ITEMS: Array<{ id: SlipTab; label: string; status: PaymentSlipStatus }> = [
    { id: "DIVERGENT", label: "Dados divergentes", status: "DIVERGENT" },
    { id: "NOT_FOUND", label: "Não encontrados", status: "NOT_FOUND" },
    { id: "PROCESSED", label: "Processados", status: "PROCESSED" },
    { id: "SENT", label: "Enviados", status: "SENT" },
];

function mapSlipRow(slip: PaymentSlip): PaymentSlipRow {
    const extractedNameDisplay =
        slip.extractedNameDisplay ?? formatPersonName(slip.extractedName) ?? slip.extractedName;
    const matchedNameDisplay =
        slip.collaboratorNameDisplay ?? formatPersonName(slip.collaboratorName) ?? "";
    return {
        ...slip,
        extractedNameDisplay,
        matchedNameDisplay,
        displayName: slip.collaboratorNameDisplay ?? (matchedNameDisplay || extractedNameDisplay),
    };
}

function slipSortKey(row: PaymentSlipRow, tab: SlipTab): string {
    if (tab === "DIVERGENT" || tab === "NOT_FOUND") {
        return row.extractedNameDisplay;
    }
    return row.displayName;
}

export function PaymentSlipPanel({
    batchId,
    periodLabel,
    canWrite,
    refreshToken = 0,
    isProcessing = false,
    onClose,
}: PaymentSlipPanelProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<SlipTab>("PROCESSED");
    const [reviewSlip, setReviewSlip] = useState<PaymentSlip | null>(null);
    const tabConfig = TAB_ITEMS.find((tab) => tab.id === activeTab)!;

    const countsQuery = useQuery({
        queryKey: [...paymentBatchKeys.slips(batchId, "counts"), refreshToken],
        queryFn: async () => {
            const all = await paymentBatchService.getSlips(batchId);
            return {
                DIVERGENT: all.filter((slip) => slip.slipStatus === "DIVERGENT").length,
                NOT_FOUND: all.filter((slip) => slip.slipStatus === "NOT_FOUND").length,
                PROCESSED: all.filter((slip) => slip.slipStatus === "PROCESSED").length,
                SENT: all.filter((slip) => slip.slipStatus === "SENT").length,
            };
        },
        refetchInterval: isProcessing ? 800 : false,
    });

    const invalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: ["payment-slip", batchId] });
    };

    const loadSlipRows = async (): Promise<PaymentSlipRow[]> => {
        const slips = await paymentBatchService.getSlips(batchId, tabConfig.status);
        return slips
            .map(mapSlipRow)
            .sort((left, right) =>
                slipSortKey(left, activeTab).localeCompare(slipSortKey(right, activeTab), "pt-BR", {
                    sensitivity: "base",
                }),
            );
    };

    const columns = useMemo(() => {
        if (activeTab === "DIVERGENT") {
            return PAYMENT_SLIP_DIVERGENT_TABLE_COLUMNS;
        }
        if (activeTab === "NOT_FOUND") {
            return PAYMENT_SLIP_NOT_FOUND_TABLE_COLUMNS;
        }
        return PAYMENT_SLIP_TABLE_COLUMNS;
    }, [activeTab]);

    const sendEmailMutation = useMutation({
        mutationFn: (slipId: string) => paymentBatchService.sendEmail(slipId),
        onSuccess: async () => {
            await invalidate();
            toast.success("E-mail enviado");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_SEND_FAILED }),
    });

    const sendWhatsappMutation = useMutation({
        mutationFn: (slipId: string) => paymentBatchService.sendWhatsapp(slipId),
        onSuccess: async (result) => {
            await invalidate();
            if (result.whatsappUrl) {
                window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
            }
            toast.success("WhatsApp preparado para envio");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_SEND_FAILED }),
    });

    const sendAllMutation = useMutation({
        mutationFn: () => paymentBatchService.sendAll(batchId),
        onSuccess: async (result) => {
            await invalidate();
            toast.success(`${result.sentCount} holerite(s) enviado(s) por e-mail`);
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_SEND_FAILED }),
    });

    const validateMutation = useMutation({
        mutationFn: (slipId: string) => paymentBatchService.validateSlip(slipId),
        onSuccess: async () => {
            await invalidate();
            setReviewSlip(null);
            toast.success("Holerite validado");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_LOAD_FAILED }),
    });

    const handleSendAll = async () => {
        if (
            !(await SystemAlert.confirm({
                title: "Enviar todos",
                message: `Enviar todos os holerites processados de ${periodLabel}?`,
                confirmLabel: "Enviar todos",
            }))
        ) {
            return;
        }
        sendAllMutation.mutate();
    };

    const handleValidate = async (slip: PaymentSlip) => {
        if (
            !(await SystemAlert.confirm({
                title: "Validar holerite",
                message: "Confirmar o vínculo deste holerite com o colaborador encontrado?",
                confirmLabel: "Validar",
            }))
        ) {
            return;
        }
        validateMutation.mutate(slip.id);
    };

    const queryKey = useMemo(
        () => [...paymentBatchKeys.slips(batchId, tabConfig.status), refreshToken],
        [batchId, tabConfig.status, refreshToken],
    );

    const tabCount = (tabId: SlipTab) => countsQuery.data?.[tabId] ?? 0;

    return (
        <div className="grid w-full min-w-0 content-start gap-3 rounded-xl border border-base-content/10 p-4">
            <div className="flex min-h-[var(--gommo-control-h)] shrink-0 items-center justify-between gap-3">
                <h3 className="text-base font-semibold leading-none">Pagamentos {periodLabel}</h3>
                <div className="flex min-h-[var(--gommo-control-h)] shrink-0 items-center gap-2">
                    {canWrite && activeTab === "PROCESSED" ? (
                        <Button
                            type="button"
                            variant="primary"
                            leftIcon={<Send className="size-4" />}
                            loading={sendAllMutation.isPending}
                            onClick={() => void handleSendAll()}
                        >
                            Enviar todos
                        </Button>
                    ) : null}
                    {onClose ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label="Fechar detalhamento"
                            leftIcon={<X className="size-4" />}
                            onClick={onClose}
                        />
                    ) : null}
                </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-start gap-2 border-b border-base-content/10 pb-2">
                {TAB_ITEMS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={clsx(
                            "self-start rounded-md px-3 py-1.5 text-sm leading-tight transition-colors",
                            activeTab === tab.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-base-content/70 hover:bg-base-200",
                        )}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label} ({tabCount(tab.id)})
                    </button>
                ))}
            </div>
            <div className="min-h-0 min-w-0 w-full max-h-96 overflow-y-auto">
                <QueryTablePanel<PaymentSlipRow>
                    key={`${activeTab}-${refreshToken}`}
                    queryKey={queryKey}
                    request={loadSlipRows}
                    columns={columns}
                    renderActions={(row) => (
                        <div className="flex items-center gap-1">
                            {activeTab === "DIVERGENT" ? (
                                <>
                                    <TableActionButton
                                        actionVariant="open"
                                        aria-label="Visualizar"
                                        leftIcon={<Eye className="size-3.5" />}
                                        disabled={!row.slipObjectId}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setReviewSlip(row);
                                        }}
                                    />
                                    {canWrite ? (
                                        <TableActionButton
                                            actionVariant="edit"
                                            aria-label="Validar"
                                            leftIcon={<Check className="size-3.5" />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void handleValidate(row);
                                            }}
                                        />
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    <TableActionButton
                                        actionVariant="open"
                                        aria-label="Visualizar"
                                        leftIcon={<Eye className="size-3.5" />}
                                        disabled={!row.slipObjectId}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setReviewSlip(row);
                                        }}
                                    />
                                    {canWrite && row.slipStatus === "PROCESSED" ? (
                                        <>
                                            <TableActionButton
                                                actionVariant="edit"
                                                aria-label="Enviar e-mail"
                                                leftIcon={<Mail className="size-3.5" />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    sendEmailMutation.mutate(row.id);
                                                }}
                                            />
                                            <TableActionButton
                                                actionVariant="edit"
                                                aria-label="Enviar WhatsApp"
                                                leftIcon={<MessageCircle className="size-3.5" />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    sendWhatsappMutation.mutate(row.id);
                                                }}
                                            />
                                        </>
                                    ) : null}
                                </>
                            )}
                        </div>
                    )}
                />
            </div>
            <PaymentSlipReviewDialog
                slip={reviewSlip}
                open={reviewSlip !== null}
                canValidate={canWrite && reviewSlip?.slipStatus === "DIVERGENT"}
                validating={validateMutation.isPending}
                onClose={() => setReviewSlip(null)}
                onValidate={
                    reviewSlip && canWrite
                        ? () => {
                              void handleValidate(reviewSlip);
                          }
                        : undefined
                }
            />
        </div>
    );
}
