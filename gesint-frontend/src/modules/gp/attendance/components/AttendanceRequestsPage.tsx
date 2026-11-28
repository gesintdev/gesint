"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { attendancerecordKeys } from "@/modules/gp/attendance/attendance.query";
import { AttendanceRequestDetailModal } from "@/modules/gp/attendance/components/AttendanceRequestDetailModal";
import type {
    AttendanceCompensationType,
    AttendanceRequest,
    AttendanceRequestStatus,
} from "@/modules/gp/attendance/dto/attendance-record.dto";
import { attendancerecordService } from "@/modules/gp/attendance/services/attendance-record.service";
import { invalidateTimeQueries } from "@/modules/gp/shared/lib/invalidate-time-queries";
import { REQUEST_TYPE_LABELS } from "@/modules/gp/shared/lib/time-labels";
import { useHasPermission } from "@/shared/auth/permissions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";
import { CrudTabList } from "@/shared/components/ui/CrudTabList";
import { ExceptionCapture } from "@/shared/exceptions";
import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

type RequestRow = AttendanceRequest & {
    typeLabel: string;
    proposed: string;
};

const TABS: Array<{ value: AttendanceRequestStatus; label: string; help: string }> = [
    { value: "PENDING", label: "Pendentes", help: "Aguardando a sua decisão." },
    { value: "APPROVED", label: "Aprovadas", help: "Ajustes aplicados ao ponto." },
    { value: "REJECTED", label: "Reprovadas", help: "Recusadas, com o motivo informado." },
];

const COLUMNS: TableColumnConfig[] = [
    { id: "collaboratorName", columnName: "Colaborador", fieldValue: "collaboratorName", dataType: TableDataType.TEXT },
    { id: "typeLabel", columnName: "Tipo", fieldValue: "typeLabel", dataType: TableDataType.TEXT },
    { id: "workDate", columnName: "Dia", fieldValue: "workDate", dataType: TableDataType.DATE, notFilterable: true },
    { id: "proposed", columnName: "Horários pedidos", fieldValue: "proposed", dataType: TableDataType.TEXT, notFilterable: true },
    { id: "notes", columnName: "Justificativa", fieldValue: "notes", dataType: TableDataType.TEXT },
    {
        id: "submittedAt",
        columnName: "Enviada em",
        fieldValue: "submittedAt",
        dataType: TableDataType.DATETIME,
        notFilterable: true,
    },
];

const REVIEWED_COLUMNS: TableColumnConfig[] = [
    ...COLUMNS,
    { id: "reviewReason", columnName: "Motivo da decisão", fieldValue: "reviewReason", dataType: TableDataType.TEXT },
];

function time(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}

function proposedTimes(request: AttendanceRequest): string {
    const parts = [request.clockIn, request.breakStart, request.breakEnd, request.clockOut].map(time).filter(Boolean);
    return parts.length ? parts.join(" · ") : "—";
}

/** Fila de solicitações de ajuste com desfecho (pendente, aprovada, reprovada). */
export function AttendanceRequestsPage() {
    const queryClient = useQueryClient();
    const canReview = useHasPermission("attendance:write");
    const [tab, setTab] = useState<AttendanceRequestStatus>("PENDING");
    const [selected, setSelected] = useState<AttendanceRequest | null>(null);
    const listKey = useBranchScopedQueryKey([...attendancerecordKeys.all, "requests"]);
    const countsQuery = useQuery({
        queryKey: listKey,
        queryFn: () => attendancerecordService.listRequests(),
    });
    const counts = useMemo(() => {
        const result: Record<AttendanceRequestStatus, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
        for (const request of countsQuery.data ?? []) {
            result[request.requestStatus] = (result[request.requestStatus] ?? 0) + 1;
        }
        return result;
    }, [countsQuery.data]);

    const reviewMutation = useMutation({
        mutationFn: (input: {
            id: string;
            action: "APPROVE" | "REJECT";
            reason?: string;
            compensationType?: AttendanceCompensationType;
        }) => attendancerecordService.review(input.id, input.action, input.reason, input.compensationType),
        onSuccess: async (_result, input) => {
            await invalidateTimeQueries(queryClient);
            toast.success(input.action === "APPROVE" ? "Ajuste aprovado e aplicado ao ponto" : "Ajuste recusado");
            setSelected(null);
        },
        onError: (error: unknown) =>
            ExceptionCapture.handle(error, { fallbackMessage: "Não foi possível registrar a decisão." }),
    });

    return (
        <WorkspacePage>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="px-1.5">
                    <CrudTabList
                        className="!px-1"
                        ariaLabel="Situação das solicitações"
                        items={TABS.map((item) => ({ ...item, badge: counts[item.value] }))}
                        value={tab}
                        onChange={setTab}
                    />
                </div>
                <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
                    <QueryPagedTablePanel<RequestRow>
                        key={tab}
                        queryKey={[...attendancerecordKeys.all, "requests", "list", tab]}
                        request={async (page, size, filters) => {
                            const all = await attendancerecordService.listRequests();
                            const rows = all
                                .filter((request) => request.requestStatus === tab)
                                .map((request) => ({
                                    ...request,
                                    typeLabel: REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType,
                                    proposed: proposedTimes(request),
                                }));
                            return paginateCatalogRows(rows, page, size, filters);
                        }}
                        columns={tab === "PENDING" ? COLUMNS : REVIEWED_COLUMNS}
                        rowKey="id"
                        emptyMessage={
                            tab === "PENDING"
                                ? "Tudo em dia: nenhum ajuste aguardando decisão."
                                : "Nenhuma solicitação nesta situação."
                        }
                        onRowActivate={(row) => setSelected(row)}
                        renderActions={(row) => (
                            <TableActionButton
                                actionVariant="open"
                                aria-label="Ver solicitação"
                                title={tab === "PENDING" && canReview ? "Ver e decidir" : "Ver solicitação"}
                                leftIcon={<Eye className="size-3.5" />}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelected(row);
                                }}
                            />
                        )}
                    />
                </div>
            </div>
            <AttendanceRequestDetailModal
                request={selected}
                open={selected != null}
                reviewing={reviewMutation.isPending}
                onClose={() => setSelected(null)}
                onApprove={
                    selected?.requestStatus === "PENDING" && canReview
                        ? (compensationType) =>
                              reviewMutation.mutate({ id: selected.id, action: "APPROVE", compensationType })
                        : undefined
                }
                onReject={
                    selected?.requestStatus === "PENDING" && canReview
                        ? (reason) => reviewMutation.mutate({ id: selected.id, action: "REJECT", reason })
                        : undefined
                }
            />
        </WorkspacePage>
    );
}

export default AttendanceRequestsPage;
