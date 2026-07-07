"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {toast} from "sonner";

import {VacationReviewReasonDialog} from "@/modules/rh/person/leave/components/VacationReviewReasonDialog";
import {LEAVE_PENDING_TABLE_COLUMNS} from "@/modules/rh/person/leave/config/leave-pending.table-columns";
import type {LeaveRequest} from "@/modules/rh/person/leave/dto/leave-request.dto";
import {leaverequestKeys} from "@/modules/rh/person/leave/leave.query";
import {isPendingVacationRequest} from "@/modules/rh/person/leave/lib/leave-request.filters";
import {
    leaverequestService,
    type VacationReviewAction,
} from "@/modules/rh/person/leave/services/leave-request.service";
import {CRUD_TAB_FORM, useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {QueryTablePanel} from "@/shared/components/data/DataPanel";
import {Button} from "@/shared/components/ui/Button";
import {ExceptionCapture} from "@/shared/exceptions";

type ReviewDialogState = {
    action: "RETURN" | "REJECT";
    row: LeaveRequest;
} | null;

export function AttendanceRecordRequestsClient() {
    const {startEdit, goToTab} = useCrudScreen();
    const queryClient = useQueryClient();
    const [dialog, setDialog] = useState<ReviewDialogState>(null);

    const reviewMutation = useMutation({
        mutationFn: async (payload: { id: string; action: VacationReviewAction; reason?: string }) =>
            leaverequestService.reviewVacation(payload.id, {
                action: payload.action,
                reason: payload.reason,
            }),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({queryKey: leaverequestKeys.all});
            const messages: Record<VacationReviewAction, string> = {
                APPROVE: "Solicitação aprovada",
                RETURN: "Solicitação devolvida ao RH",
                REJECT: "Solicitação reprovada",
            };
            toast.success(messages[variables.action]);
            setDialog(null);
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível concluir a revisão."});
        },
    });

    const handleRegister = (row: LeaveRequest) => {
        startEdit(row.id, row);
        goToTab(CRUD_TAB_FORM);
    };

    return (
        <>
            <QueryTablePanel<LeaveRequest>
                queryKey={[...leaverequestKeys.all, "pending-vacation"]}
                request={async () => {
                    const rows = await leaverequestService.getAll();
                    return rows.filter(isPendingVacationRequest);
                }}
                columns={LEAVE_PENDING_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhuma solicitação de férias pendente."
                renderActions={(row) => (
                    <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                            className={"text-[8pt]! p-2.5!"}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRegister(row)}
                        >
                            Analisar
                        </Button>
                        <Button
                            className={"text-[8pt]! p-2.5!"}
                            type="button"
                            size="sm"
                            variant="success"
                            loading={reviewMutation.isPending}
                            onClick={() => reviewMutation.mutate({id: row.id, action: "APPROVE"})}
                        >
                            Aprovar
                        </Button>
                        <Button
                            className={"text-[8pt]! p-2.5!"}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setDialog({action: "RETURN", row})}
                        >
                            Devolver
                        </Button>
                        <Button
                            className={"text-[8pt]! p-2.5!"}
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={() => setDialog({action: "REJECT", row})}
                        >
                            Reprovar
                        </Button>
                    </div>
                )}
            />
            <VacationReviewReasonDialog
                open={dialog != null}
                title={dialog?.action === "REJECT" ? "Reprovar solicitação" : "Devolver solicitação"}
                confirmLabel={dialog?.action === "REJECT" ? "Reprovar" : "Devolver"}
                loading={reviewMutation.isPending}
                onClose={() => setDialog(null)}
                onConfirm={(reason) => {
                    if (!dialog) return;
                    reviewMutation.mutate({id: dialog.row.id, action: dialog.action, reason});
                }}
            />
        </>
    );
}
