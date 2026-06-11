"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PAYMENT_PERIOD_TABLE_COLUMNS } from "@/modules/payment/config/payment.table-columns";
import type { PaymentPeriod } from "@/modules/payment/dto/payment.dto";
import { PAYMENT_CLIENT_MESSAGES } from "@/modules/payment/exceptions/payment.messages";
import { formatPaymentReference } from "@/modules/payment/lib/payment.mapper";
import { paymentPeriodKeys } from "@/modules/payment/payment.query";
import { paymentPeriodService } from "@/modules/payment/services/payment-period.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";
import {
    deriveWritePermission,
    useSessionPermissions,
} from "@/shared/auth/permissions";
import { canWriteRoute } from "@/shared/auth/route-access";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";
import { findRouteById } from "@/shared/workspace/workspace-routes";

type PaymentPeriodListRow = PaymentPeriod & {
    referencePeriod: string;
};

async function loadPaymentPeriodRows(): Promise<PaymentPeriodListRow[]> {
    const periods = await paymentPeriodService.getAll();
    return periods.map((period) => ({
        ...period,
        referencePeriod: formatPaymentReference(period.referenceDate),
    }));
}

export function PaymentPeriodListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const permissions = useSessionPermissions();
    const wsTab = useWorkspaceTabOptional();
    const route = wsTab ? findRouteById(wsTab.tab.routeId) : undefined;
    const canWrite = canWriteRoute(route, permissions, deriveWritePermission(route?.permission));

    const invalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: paymentPeriodKeys.all });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => paymentPeriodService.remove(id),
        onSuccess: async () => {
            await invalidate();
            toast.success("Período excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYMENT_CLIENT_MESSAGES.PAYMENT_LOAD_FAILED }),
    });

    const handleDelete = async (row: PaymentPeriod) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<PaymentPeriodListRow>
            queryKey={paymentPeriodKeys.all}
            request={loadPaymentPeriodRows}
            columns={PAYMENT_PERIOD_TABLE_COLUMNS}
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={canWrite ? () => void handleDelete(row) : undefined}
                    deleteLoading={deleteMutation.isPending}
                />
            )}
        />
    );
}
