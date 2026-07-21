"use client";

import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Plus} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {notificationKeys} from "@/modules/cfg/settings/notification/notification.query";
import {attendancerecordKeys} from "@/modules/dp/attendance/attendance.query";
import {
    AttendanceEditableGrid,
    isAttendanceDraftId,
} from "@/modules/dp/attendance/components/AttendanceEditableGrid";
import {AttendanceRequestDetailModal} from "@/modules/dp/attendance/components/AttendanceRequestDetailModal";
import {AttendanceRequestRejectDialog} from "@/modules/dp/attendance/components/AttendanceRequestRejectDialog";
import type {
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
} from "@/modules/dp/attendance/lib/attendance-collaborator-focus";
import {
    attendancerecordToFormDto,
    emptyAttendanceRecordForm,
} from "@/modules/dp/attendance/lib/attendance-record.mapper";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import {CRUD_TAB_FORM, useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {Button} from "@/shared/components/ui/Button";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";
import {registerTabDirtyGuard} from "@/shared/workspace/dirty-tab-guard";
import {useWorkspaceTabOptional} from "@/shared/workspace/WorkspaceTabContext";

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

export function AttendanceRecordFormClient() {
    const {activeTab, goToList} = useCrudScreen();
    const workspaceTab = useWorkspaceTabOptional();
    const queryClient = useQueryClient();
    const [focus, setFocus] = useState<AttendanceCollaboratorFocus | null>(() =>
        peekAttendanceCollaboratorFocus(),
    );
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

    useEffect(() => {
        if (activeTab !== CRUD_TAB_FORM) return;
        const apply = (next: AttendanceCollaboratorFocus | null) => {
            if (!next?.collaboratorId) return;
            setFocus(next);
            setDraftRows([]);
            setFocusCell(null);
        };
        apply(peekAttendanceCollaboratorFocus());
        const onFocus = (event: Event) => {
            const detail = (event as CustomEvent<AttendanceCollaboratorFocus>).detail;
            apply(detail ?? peekAttendanceCollaboratorFocus());
        };
        window.addEventListener(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, onFocus);
        return () => window.removeEventListener(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, onFocus);
    }, [activeTab]);

    useEffect(() => {
        const tabId = workspaceTab?.tab.id;
        if (!tabId) return;
        return registerTabDirtyGuard(tabId, () => dirty || draftRows.length > 0);
    }, [dirty, draftRows.length, workspaceTab?.tab.id]);

    const historyQuery = useInfiniteQuery({
        queryKey: [...attendancerecordKeys.all, "collaborator-history", focus?.collaboratorId],
        enabled: Boolean(focus?.collaboratorId),
        initialPageParam: 0,
        queryFn: ({pageParam}) =>
            attendancerecordService.listCollaboratorHistory(focus!.collaboratorId, pageParam, PAGE_SIZE),
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
        for (const request of requestsQuery.data ?? []) {
            const key = request.workDate?.slice(0, 10) ?? "";
            if (!key) continue;
            const list = map.get(key) ?? [];
            list.push(request);
            map.set(key, list);
        }
        return map;
    }, [requestsQuery.data]);

    const invalidateHistory = async () => {
        await queryClient.invalidateQueries({
            queryKey: [...attendancerecordKeys.all, "collaborator-history", focus?.collaboratorId],
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
            const dto: AttendanceRecordCreateDto = {
                ...emptyAttendanceRecordForm(),
                collaboratorId: focus!.collaboratorId,
                workDate: todayIso(),
                occurrenceType: "NORMAL_WORK",
                occurrenceOrigin: "MANUAL",
            };
            return attendancerecordService.create(dto);
        },
        onSuccess: async () => {
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
        if (isAttendanceDraftId(row.id)) {
            const nextWorkDate = patch.workDate ?? row.workDate;
            const merged: AttendanceRecord = {
                ...row,
                ...patch,
                workDate: nextWorkDate ?? "",
            };
            if (!nextWorkDate) {
                setDraftRows((current) => current.map((item) => (item.id === row.id ? merged : item)));
                return;
            }
            // Com data preenchida, persiste o lançamento manual.
            await saveMutation.mutateAsync({row: merged, patch: {...patch, workDate: nextWorkDate}});
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
        mutationFn: (payload: { id: string; action: AttendanceReviewAction; reason?: string }) =>
            attendancerecordService.review(payload.id, payload.action, payload.reason),
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

    if (!focus?.collaboratorId) {
        return (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6">
                <div
                    className="w-full max-w-md rounded-xl border border-[var(--gommo-border-subtle)] bg-base-100 px-5 py-6">
                    <h3 className="text-sm font-semibold text-base-content">Selecione um colaborador</h3>
                    <p className="mt-1 text-sm text-base-content/55">
                        Escolha na listagem ou busque abaixo para editar o histórico de pontos.
                    </p>
                    <div className="mt-4">
                        <CollaboratorPickerField
                            value=""
                            onValueChange={(collaboratorId) => {
                                if (!collaboratorId) return;
                                const next = {
                                    collaboratorId,
                                    collaboratorName: undefined as string | undefined,
                                };
                                setFocus(next);
                                window.sessionStorage.setItem(
                                    "gommo-attendance-collaborator-focus",
                                    JSON.stringify(next),
                                );
                                void (async () => {
                                    try {
                                        const {collaboratorService} = await import(
                                            "@/modules/rh/person/collaborators/people/services/collaborator.service"
                                            );
                                        const collaborator = await collaboratorService.getById(collaboratorId);
                                        setFocus({
                                            collaboratorId,
                                            collaboratorName: collaborator.fullName,
                                        });
                                        window.sessionStorage.setItem(
                                            "gommo-attendance-collaborator-focus",
                                            JSON.stringify({
                                                collaboratorId,
                                                collaboratorName: collaborator.fullName,
                                            }),
                                        );
                                    } catch {
                                        // Mantém o id mesmo se o nome não carregar.
                                    }
                                })();
                            }}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={goToList}>
                            Voltar à listagem
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <header
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--gommo-border-subtle)] px-4 py-3">
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-base-content">
                        {focus.collaboratorName ?? "Colaborador"}
                    </h3>
                    <p className="text-xs text-base-content/50">
                        Duplo clique para editar. Tab navega na linha sem salvar; Enter, Esc ou mudar de linha
                        grava no servidor.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        leftIcon={<Plus className="size-3.5" strokeWidth={2.5}/>}
                        loading={createTodayMutation.isPending}
                        onClick={launchManualRow}
                    >
                        Lançar ponto
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            clearAttendanceCollaboratorFocus();
                            setFocus(null);
                            setDraftRows([]);
                            setFocusCell(null);
                            goToList();
                        }}
                    >
                        Trocar colaborador
                    </Button>
                </div>
            </header>

            {historyQuery.isLoading ? (
                <div className="grid gap-2 p-4">
                    {Array.from({length: 8}).map((_, index) => (
                        <div
                            key={index}
                            className="skeleton-shimmer h-9 w-full"
                            style={{animationDelay: `${index * 50}ms`}}
                        />
                    ))}
                </div>
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
                        savingRowId={savingRowId}
                        deletingRowId={deletingRowId}
                        focusCell={focusCell}
                        onDirtyChange={setDirty}
                        onCommitRow={handleCommitRow}
                        onDeleteRow={(row) => void handleDeleteRow(row)}
                        onApproveRequest={(request) =>
                            reviewMutation.mutate({id: request.id, action: "APPROVE"})
                        }
                        onRejectRequest={setRejectTarget}
                        onDetailRequest={setSelectedRequest}
                    />
                    {historyQuery.hasNextPage ? (
                        <div className="border-t border-[var(--gommo-border-subtle)] px-4 py-3">
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
                onApprove={() => {
                    if (!selectedRequest) return;
                    reviewMutation.mutate({id: selectedRequest.id, action: "APPROVE"});
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
