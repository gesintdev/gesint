"use client";

import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Plus} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {notificationKeys} from "@/modules/cfg/settings/notification/notification.query";
import {attendancerecordKeys} from "@/modules/dp/attendance/attendance.query";
import {AttendanceEditableGrid, isAttendanceDraftId,} from "@/modules/dp/attendance/components/AttendanceEditableGrid";
import {AttendancePeriodDateFilters} from "@/modules/dp/attendance/components/AttendancePeriodDateFilters";
import {AttendanceRequestDetailModal} from "@/modules/dp/attendance/components/AttendanceRequestDetailModal";
import {AttendanceRequestRejectDialog} from "@/modules/dp/attendance/components/AttendanceRequestRejectDialog";
import type {
    AttendanceCompensationType,
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceRequest,
    AttendanceReviewAction,
} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {ATTENDANCE_CLIENT_MESSAGES} from "@/modules/dp/attendance/exceptions/attendance-record.messages";
import {
    ATTENDANCE_COLLABORATOR_FOCUS_EVENT,
    type AttendanceCollaboratorFocus,
    clearAttendanceCollaboratorFocus,
    peekAttendanceCollaboratorFocus,
    writeAttendanceCollaboratorFocus,
} from "@/modules/dp/attendance/lib/attendance-collaborator-focus";
import {peekAttendanceListPeriod} from "@/modules/dp/attendance/lib/attendance-period-focus";
import {
    currentMonthBounds,
    normalizePeriod,
} from "@/modules/dp/attendance/lib/attendance-period.util";
import {
    attendancerecordToFormDto,
    emptyAttendanceRecordForm,
} from "@/modules/dp/attendance/lib/attendance-record.mapper";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import {CRUD_TAB_FORM, useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useCrudFormDirty} from "@/shared/components/crud/useCrudFormDirty";
import {Button} from "@/shared/components/ui/Button";
import {SkeletonStack} from "@/shared/components/ui/SkeletonStack";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

const PAGE_SIZE = 20;

function todayIso() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function createDraftRow(collaboratorId: string, workDate = ""): AttendanceRecord {
    return {
        id: `draft:${crypto.randomUUID()}`,
        code: 0,
        status: "ACTIVE",
        collaboratorId,
        workDate,
        occurrenceType: "NORMAL_WORK",
        occurrenceOrigin: "MANUAL",
        impactsHourBank: true,
        impactsPayroll: true,
    };
}

function hasDuplicateWorkDate(
    rows: AttendanceRecord[],
    rowId: string,
    workDate: string,
): boolean {
    const dayKey = workDate.slice(0, 10);
    if (!dayKey) return false;
    return rows.some(
        (item) => item.id !== rowId && item.workDate?.slice(0, 10) === dayKey,
    );
}

async function confirmOutsideScheduleLaunch(
    collaboratorId: string,
    workDate: string,
): Promise<boolean> {
    try {
        const scheduleDay = await attendancerecordService.scheduleDay(collaboratorId, workDate);
        if (!scheduleDay.outsideWorkSchedule) return true;
        const scheduleLabel = scheduleDay.workScheduleName
            ? ` da escala "${scheduleDay.workScheduleName}"`
            : " da escala";
        return SystemAlert.warning.confirm({
            title: "Dia fora da escala",
            message:
                `A data informada não faz parte dos dias de trabalho${scheduleLabel} deste colaborador. ` +
                "O registro entrará como hora extra / banco de horas. Deseja continuar?",
            confirmLabel: "Confirmar lançamento",
            cancelLabel: "Cancelar",
        });
    } catch (err: unknown) {
        ExceptionCapture.handle(err, {fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED});
        return false;
    }
}

const EMPTY_REQUESTS_BY_DATE = new Map<string, AttendanceRequest[]>();

export function AttendanceRecordFormClient() {
    const {activeTab} = useCrudScreen();
    const queryClient = useQueryClient();
    const [focus, setFocus] = useState<AttendanceCollaboratorFocus | null>(() =>
        peekAttendanceCollaboratorFocus(),
    );
    const [dateFrom, setDateFrom] = useState(() => {
        const stored = peekAttendanceListPeriod();
        return stored?.from ?? currentMonthBounds().from;
    });
    const [dateTo, setDateTo] = useState(() => {
        const stored = peekAttendanceListPeriod();
        return stored?.to ?? currentMonthBounds().to;
    });
    const period = useMemo(() => normalizePeriod(dateFrom, dateTo), [dateFrom, dateTo]);
    const [dirty, setDirty] = useState(false);
    const [draftRows, setDraftRows] = useState<AttendanceRecord[]>([]);
    const [focusCell, setFocusCell] = useState<{
        rowId: string;
        field: "workDate" | "clockIn" | "breakStart" | "breakEnd" | "clockOut";
    } | null>(null);
    const [savingRowId, setSavingRowId] = useState<string | null>(null);
    const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);
    const [rejectTarget, setRejectTarget] = useState<AttendanceRequest | null>(null);
    const hasCollaborator = Boolean(focus?.collaboratorId);

    useEffect(() => {
        if (activeTab !== CRUD_TAB_FORM) return;
        const storedPeriod = peekAttendanceListPeriod();
        if (storedPeriod) {
            setDateFrom(storedPeriod.from);
            setDateTo(storedPeriod.to);
        }
        const apply = (next: AttendanceCollaboratorFocus | null) => {
            if (!next?.collaboratorId) {
                setFocus(null);
                setDraftRows([]);
                setFocusCell(null);
                return;
            }
            setFocus(next);
            setDraftRows([]);
            setFocusCell(null);
        };
        apply(peekAttendanceCollaboratorFocus());
        const onFocus = (event: Event) => {
            const detail = (event as CustomEvent<AttendanceCollaboratorFocus | null>).detail;
            apply(detail === undefined ? peekAttendanceCollaboratorFocus() : detail);
        };
        window.addEventListener(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, onFocus);
        return () => window.removeEventListener(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, onFocus);
    }, [activeTab]);

    useCrudFormDirty(dirty || draftRows.length > 0);

    const selectCollaborator = (collaboratorId: string) => {
        if (!collaboratorId) {
            clearAttendanceCollaboratorFocus();
            setFocus(null);
            setDraftRows([]);
            setFocusCell(null);
            return;
        }
        const next: AttendanceCollaboratorFocus = {collaboratorId};
        writeAttendanceCollaboratorFocus(next);
        setFocus(next);
        setDraftRows([]);
        setFocusCell(null);
        void (async () => {
            try {
                const {collaboratorService} = await import(
                    "@/modules/rh/person/collaborators/people/services/collaborator.service"
                );
                const collaborator = await collaboratorService.getById(collaboratorId);
                const withName: AttendanceCollaboratorFocus = {
                    collaboratorId,
                    collaboratorName: collaborator.fullName,
                };
                writeAttendanceCollaboratorFocus(withName);
                setFocus(withName);
            } catch {
                // Mantém o id mesmo se o nome não carregar.
            }
        })();
    };

    const historyQuery = useInfiniteQuery({
        queryKey: [
            ...attendancerecordKeys.all,
            "collaborator-history",
            focus?.collaboratorId,
            period.from,
            period.to,
        ],
        enabled: Boolean(focus?.collaboratorId),
        initialPageParam: 0,
        queryFn: ({pageParam}) =>
            attendancerecordService.listCollaboratorHistory(
                focus!.collaboratorId,
                pageParam,
                PAGE_SIZE,
                period.from,
                period.to,
            ),
        getNextPageParam: (lastPage) => {
            if (lastPage.page + 1 >= lastPage.totalPages) return undefined;
            return lastPage.page + 1;
        },
    });

    const requestsQuery = useQuery({
        queryKey: [...attendancerecordKeys.all, "requests", focus?.collaboratorId],
        enabled: Boolean(focus?.collaboratorId),
        queryFn: async () => {
            const rows = await attendancerecordService.listRequests();
            return rows.filter((row) => row.collaboratorId === focus?.collaboratorId);
        },
    });

    const scheduleQuery = useQuery({
        queryKey: [...attendancerecordKeys.all, "collaborator-schedule", focus?.collaboratorId],
        enabled: Boolean(focus?.collaboratorId),
        queryFn: () => attendancerecordService.collaboratorSchedule(focus!.collaboratorId),
        staleTime: 60_000,
    });

    const persistedRows = useMemo(
        () => historyQuery.data?.pages.flatMap((page) => page.content) ?? [],
        [historyQuery.data],
    );

    const rows = useMemo(() => [...draftRows, ...persistedRows], [draftRows, persistedRows]);

    const hasTodayRow = useMemo(() => {
        const today = todayIso();
        return rows.some((row) => row.workDate?.slice(0, 10) === today);
    }, [rows]);

    const requestsByDate = useMemo(() => {
        const map = new Map<string, AttendanceRequest[]>();
        const from = period.from;
        const to = period.to;
        for (const request of requestsQuery.data ?? []) {
            const key = request.workDate?.slice(0, 10) ?? "";
            if (!key) continue;
            if (from && key < from) continue;
            if (to && key > to) continue;
            const list = map.get(key) ?? [];
            list.push(request);
            map.set(key, list);
        }
        return map;
    }, [requestsQuery.data, period.from, period.to]);

    const invalidateHistory = async () => {
        await queryClient.invalidateQueries({
            queryKey: [
                ...attendancerecordKeys.all,
                "collaborator-history",
                focus?.collaboratorId,
                period.from,
                period.to,
            ],
        });
        await queryClient.invalidateQueries({queryKey: attendancerecordKeys.all});
    };

    const saveMutation = useMutation({
        mutationFn: async (payload: { row: AttendanceRecord; patch: Partial<AttendanceRecordCreateDto> }) => {
            const dto: AttendanceRecordCreateDto = {
                ...attendancerecordToFormDto(payload.row),
                ...payload.patch,
            };
            if (isAttendanceDraftId(payload.row.id)) {
                if (!dto.workDate) {
                    throw new Error("Informe a data do ponto antes de salvar.");
                }
                return attendancerecordService.create({
                    ...emptyAttendanceRecordForm(),
                    ...dto,
                    collaboratorId: focus!.collaboratorId,
                    workDate: dto.workDate,
                    occurrenceType: dto.occurrenceType ?? "NORMAL_WORK",
                    occurrenceOrigin: "MANUAL",
                });
            }
            return attendancerecordService.update(payload.row.id, {
                ...dto,
                occurrenceOrigin: "MANUAL",
            });
        },
        onMutate: (payload) => {
            setSavingRowId(payload.row.id);
        },
        onSuccess: async (_data, variables) => {
            if (isAttendanceDraftId(variables.row.id)) {
                setDraftRows((current) => current.filter((row) => row.id !== variables.row.id));
                setFocusCell(null);
            }
            await invalidateHistory();
            toast.success(isAttendanceDraftId(variables.row.id) ? "Ponto lançado" : "Ponto atualizado");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED});
        },
        onSettled: () => setSavingRowId(null),
    });

    const createTodayMutation = useMutation({
        mutationFn: async () => {
            const workDate = todayIso();
            const confirmed = await confirmOutsideScheduleLaunch(focus!.collaboratorId, workDate);
            if (!confirmed) return null;
            const dto: AttendanceRecordCreateDto = {
                ...emptyAttendanceRecordForm(),
                collaboratorId: focus!.collaboratorId,
                workDate,
                occurrenceType: "NORMAL_WORK",
                occurrenceOrigin: "MANUAL",
                impactsHourBank: true,
            };
            return attendancerecordService.create(dto);
        },
        onSuccess: async (data) => {
            if (!data) return;
            await invalidateHistory();
            toast.success("Ponto de hoje lançado");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => attendancerecordService.remove(id),
        onMutate: (id) => setDeletingRowId(id),
        onSuccess: async () => {
            await invalidateHistory();
            toast.success("Registro de ponto excluído");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED});
        },
        onSettled: () => setDeletingRowId(null),
    });

    const launchManualRow = () => {
        if (!focus?.collaboratorId) return;
        if (!hasTodayRow) {
            createTodayMutation.mutate();
            return;
        }
        const draft = createDraftRow(focus.collaboratorId, "");
        setDraftRows((current) => [draft, ...current]);
        setFocusCell({rowId: draft.id, field: "workDate"});
    };

    const handleCommitRow = async (row: AttendanceRecord, patch: Partial<AttendanceRecordCreateDto>) => {
        const nextWorkDate = (patch.workDate ?? row.workDate)?.slice(0, 10) ?? "";
        if (nextWorkDate && hasDuplicateWorkDate(rows, row.id, nextWorkDate)) {
            toast.error(ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_DUPLICATE_WORK_DATE);
            throw new Error(ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_DUPLICATE_WORK_DATE);
        }

        if (isAttendanceDraftId(row.id)) {
            const merged: AttendanceRecord = {
                ...row,
                ...patch,
                workDate: nextWorkDate ?? "",
            };
            if (!nextWorkDate) {
                setDraftRows((current) => current.map((item) => (item.id === row.id ? merged : item)));
                return;
            }
            if (!focus?.collaboratorId) return;
            const confirmed = await confirmOutsideScheduleLaunch(focus.collaboratorId, nextWorkDate);
            if (!confirmed) {
                // Mantém o rascunho editavel para o usuario ajustar a data ou cancelar.
                setDraftRows((current) => current.map((item) => (item.id === row.id ? merged : item)));
                return;
            }
            await saveMutation.mutateAsync({
                row: merged,
                patch: {...patch, workDate: nextWorkDate, impactsHourBank: true},
            });
            return;
        }
        await saveMutation.mutateAsync({row, patch});
    };

    const handleDeleteRow = async (row: AttendanceRecord) => {
        if (isAttendanceDraftId(row.id)) {
            setDraftRows((current) => current.filter((item) => item.id !== row.id));
            if (focusCell?.rowId === row.id) setFocusCell(null);
            return;
        }
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    const reviewMutation = useMutation({
        mutationFn: (payload: {
            id: string;
            action: AttendanceReviewAction;
            reason?: string;
            compensationType?: AttendanceCompensationType;
        }) =>
            attendancerecordService.review(
                payload.id,
                payload.action,
                payload.reason,
                payload.compensationType,
            ),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({queryKey: attendancerecordKeys.all});
            await queryClient.invalidateQueries({queryKey: notificationKeys.summary});
            toast.success(variables.action === "APPROVE" ? "Solicitação aprovada" : "Solicitação reprovada");
            setSelectedRequest(null);
            setRejectTarget(null);
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível revisar a solicitação."});
        },
    });

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-(--gommo-border-subtle) px-4 py-1.5">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <div className="w-full min-w-[14rem] max-w-sm sm:w-72">
                        <CollaboratorPickerField
                            label=""
                            hint=""
                            value={focus?.collaboratorId ?? ""}
                            onValueChange={selectCollaborator}
                        />
                    </div>
                    <AttendancePeriodDateFilters
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                    />
                </div>
                <Button
                    type="button"
                    size="sm"
                    leftIcon={<Plus className="size-3.5" strokeWidth={2.5} />}
                    loading={createTodayMutation.isPending}
                    disabled={!hasCollaborator}
                    onClick={launchManualRow}
                >
                    Lançar ponto
                </Button>
            </header>

            {!hasCollaborator ? (
                <AttendanceEditableGrid
                    rows={[]}
                    requestsByDate={EMPTY_REQUESTS_BY_DATE}
                    emptyMessage="Selecione um colaborador"
                    onCommitRow={async () => undefined}
                    onDeleteRow={() => undefined}
                    onApproveRequest={() => undefined}
                    onRejectRequest={() => undefined}
                    onDetailRequest={() => undefined}
                />
            ) : historyQuery.isLoading ? (
                <SkeletonStack count={8} padded="sm" rowClassName="h-9" />
            ) : historyQuery.isError ? (
                <div className="p-4">
                    <p className="text-sm font-medium text-error">
                        {ExceptionCapture.displayMessage(
                            historyQuery.error,
                            ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED,
                        )}
                    </p>
                </div>
            ) : (
                <>
                    <AttendanceEditableGrid
                        rows={rows}
                        requestsByDate={requestsByDate}
                        collaboratorSchedule={scheduleQuery.data}
                        savingRowId={savingRowId}
                        deletingRowId={deletingRowId}
                        focusCell={focusCell}
                        onDirtyChange={setDirty}
                        onCommitRow={handleCommitRow}
                        onDeleteRow={(row) => void handleDeleteRow(row)}
                        onApproveRequest={(request) => {
                            if (request.requestType === "OUTSIDE_SCHEDULE") {
                                setSelectedRequest(request);
                                return;
                            }
                            reviewMutation.mutate({id: request.id, action: "APPROVE"});
                        }}
                        onRejectRequest={setRejectTarget}
                        onDetailRequest={setSelectedRequest}
                    />
                    {historyQuery.hasNextPage ? (
                        <div className="border-t border-(--gommo-border-subtle) px-4 py-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                loading={historyQuery.isFetchingNextPage}
                                onClick={() => void historyQuery.fetchNextPage()}
                            >
                                Carregar mais
                            </Button>
                        </div>
                    ) : null}
                </>
            )}

            <AttendanceRequestDetailModal
                request={selectedRequest}
                open={Boolean(selectedRequest)}
                reviewing={reviewMutation.isPending}
                onClose={() => setSelectedRequest(null)}
                onApprove={(compensationType) => {
                    if (!selectedRequest) return;
                    reviewMutation.mutate({
                        id: selectedRequest.id,
                        action: "APPROVE",
                        compensationType,
                    });
                }}
                onReject={(reason) => {
                    if (!selectedRequest) return;
                    reviewMutation.mutate({id: selectedRequest.id, action: "REJECT", reason});
                }}
            />

            <AttendanceRequestRejectDialog
                open={Boolean(rejectTarget)}
                loading={reviewMutation.isPending}
                onClose={() => setRejectTarget(null)}
                onConfirm={(reason) => {
                    if (!rejectTarget) return;
                    reviewMutation.mutate({id: rejectTarget.id, action: "REJECT", reason});
                }}
            />
        </div>
    );
}
