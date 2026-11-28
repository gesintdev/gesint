"use client";

import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Plus} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";

import {attendancerecordKeys} from "@/modules/gp/attendance/attendance.query";
import {
    AttendanceEditableGrid,
    attendanceRequestOnlyRow,
    isAttendanceDraftId,
    isAttendanceRequestOnlyId,
    isAttendanceUnsavedId,
} from "@/modules/gp/attendance/components/AttendanceEditableGrid";
import {AttendancePeriodDateFilters} from "@/modules/gp/attendance/components/AttendancePeriodDateFilters";
import {AttendanceRequestDetailModal} from "@/modules/gp/attendance/components/AttendanceRequestDetailModal";
import {AttendanceRequestRejectDialog} from "@/modules/gp/attendance/components/AttendanceRequestRejectDialog";
import {AttendanceWeekNavigator} from "@/modules/gp/attendance/components/AttendanceWeekNavigator";
import type {
    AttendanceCompensationType,
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceRequest,
    AttendanceReviewAction,
} from "@/modules/gp/attendance/dto/attendance-record.dto";
import {ATTENDANCE_CLIENT_MESSAGES} from "@/modules/gp/attendance/exceptions/attendance-record.messages";
import {
    ATTENDANCE_COLLABORATOR_FOCUS_EVENT,
    type AttendanceCollaboratorFocus,
    clearAttendanceCollaboratorFocus,
    peekAttendanceCollaboratorFocus,
    writeAttendanceCollaboratorFocus,
} from "@/modules/gp/attendance/lib/attendance-collaborator-focus";
import {
    currentMonthBounds,
    normalizePeriod,
} from "@/modules/gp/attendance/lib/attendance-period.util";
import {peekAttendanceListPeriod} from "@/modules/gp/attendance/lib/attendance-period-focus";
import {
    attendancerecordToFormDto,
    emptyAttendanceRecordForm,
} from "@/modules/gp/attendance/lib/attendance-record.mapper";
import {
    attendancePeriodWeeks,
    attendanceWeekRowSelector,
    findAttendancePeriodWeek,
} from "@/modules/gp/attendance/lib/attendance-week-sections.util";
import {attendancerecordService} from "@/modules/gp/attendance/services/attendance-record.service";
import {invalidateTimeQueries} from "@/modules/gp/shared/lib/invalidate-time-queries";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import {CRUD_TAB_FORM, useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {useCrudFormDirty} from "@/shared/components/crud/useCrudFormDirty";
import {Button} from "@/shared/components/ui/Button";
import {SkeletonStack} from "@/shared/components/ui/SkeletonStack";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

/** Cobre alguns meses de uma vez: semanas e filtro de data trabalham sobre o período carregado. */
const PAGE_SIZE = 100;

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
        (item) =>
            item.id !== rowId &&
            !isAttendanceRequestOnlyId(item.id) &&
            item.workDate?.slice(0, 10) === dayKey,
    );
}

/** Mais recente primeiro; rascunho sem data fica no topo. */
function compareByWorkDateDesc(a: AttendanceRecord, b: AttendanceRecord): number {
    const left = a.workDate?.slice(0, 10) ?? "";
    const right = b.workDate?.slice(0, 10) ?? "";
    if (!left || !right) return left ? 1 : right ? -1 : 0;
    return right.localeCompare(left);
}

/** Linha de cabeçalho da semana fica logo abaixo do cabeçalho fixo da tabela. */
function scrollToWeekRow(container: HTMLElement | null, weekKey: string) {
    const target = container?.querySelector<HTMLElement>(attendanceWeekRowSelector(weekKey));
    const scroller = target?.closest<HTMLElement>(".attendance-sheet-wrap");
    if (!target || !scroller) return;
    const headHeight = scroller.querySelector("thead")?.getBoundingClientRect().height ?? 0;
    const top =
        target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        headHeight;
    scroller.scrollTo({top: Math.max(0, top), behavior: "smooth"});
}

/** Alguma linha da semana (cabeçalho ou dias) está na área visível do grid, abaixo do cabeçalho fixo. */
function isWeekRowVisible(scroller: HTMLElement, weekKey: string): boolean {
    const header = scroller.querySelector<HTMLElement>(attendanceWeekRowSelector(weekKey));
    if (!header) return false;
    const headHeight = scroller.querySelector("thead")?.getBoundingClientRect().height ?? 0;
    const box = scroller.getBoundingClientRect();
    const viewTop = box.top + headHeight;
    // A semana vai do cabeçalho dela até o cabeçalho da próxima (ou o fim da tabela).
    let next: Element | null = header.nextElementSibling;
    while (next && !next.matches("tr[data-attendance-week]")) next = next.nextElementSibling;
    const weekTop = header.getBoundingClientRect().top;
    const weekBottom = next
        ? next.getBoundingClientRect().top
        : (header.closest("tbody")?.getBoundingClientRect().bottom ?? weekTop);
    return weekBottom > viewTop + 4 && weekTop < box.bottom - 4;
}

/** Semana cujo cabeçalho já passou do topo visível do grid. */
function visibleWeekKey(scroller: HTMLElement): string | null {
    const headHeight = scroller.querySelector("thead")?.getBoundingClientRect().height ?? 0;
    const limit = scroller.getBoundingClientRect().top + headHeight + 4;
    let current: string | null = null;
    for (const row of scroller.querySelectorAll<HTMLElement>("tr[data-attendance-week]")) {
        if (row.getBoundingClientRect().top > limit) break;
        current = row.dataset.attendanceWeek ?? null;
    }
    if (current) return current;
    return scroller.querySelector<HTMLElement>("tr[data-attendance-week]")?.dataset.attendanceWeek ?? null;
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
    /** Filtro da coluna Data: um dia do período (ISO); vazio mostra todos. */
    const [dateFilter, setDateFilter] = useState("");
    const [activeWeekKey, setActiveWeekKey] = useState<string | null>(null);
    /** Semana clicada nos atalhos: ganha contorno no grid até o usuário rolar para outra semana. */
    const [highlightedWeekKey, setHighlightedWeekKey] = useState<string | null>(null);
    const gridHostRef = useRef<HTMLDivElement>(null);
    /** Durante a rolagem disparada pelo atalho, a semana marcada não acompanha a rolagem. */
    const weekScrollLockRef = useRef(0);
    const hasCollaborator = Boolean(focus?.collaboratorId);

    const resetGridView = () => {
        setDateFilter("");
        setActiveWeekKey(null);
        setHighlightedWeekKey(null);
    };

    const changeDateFrom = (value: string) => {
        setDateFrom(value);
        resetGridView();
    };

    const changeDateTo = (value: string) => {
        setDateTo(value);
        resetGridView();
    };

    useEffect(() => {
        if (activeTab !== CRUD_TAB_FORM) return;
        const applyStoredPeriod = () => {
            const storedPeriod = peekAttendanceListPeriod();
            if (storedPeriod) {
                setDateFrom(storedPeriod.from);
                setDateTo(storedPeriod.to);
            }
        };
        applyStoredPeriod();
        const apply = (next: AttendanceCollaboratorFocus | null) => {
            setDateFilter("");
            setActiveWeekKey(null);
            setHighlightedWeekKey(null);
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
            // Quem abre o histórico de outra tela (espelho, banco de horas) grava o período antes.
            applyStoredPeriod();
            apply(detail === undefined ? peekAttendanceCollaboratorFocus() : detail);
        };
        window.addEventListener(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, onFocus);
        return () => window.removeEventListener(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, onFocus);
    }, [activeTab]);

    useCrudFormDirty(dirty || draftRows.length > 0);

    const selectCollaborator = (collaboratorId: string) => {
        resetGridView();
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

    const collaboratorId = focus?.collaboratorId;
    /** Dias com solicitação e sem marcação ganham linha própria para o ajuste aparecer no grid. */
    const requestOnlyRows = useMemo(() => {
        if (!collaboratorId) return [];
        const recordedDays = new Set(rows.map((row) => row.workDate?.slice(0, 10) ?? ""));
        return [...requestsByDate.keys()]
            .filter((day) => !recordedDays.has(day))
            .map((day) => attendanceRequestOnlyRow(collaboratorId, day));
    }, [collaboratorId, requestsByDate, rows]);

    const sortedRows = useMemo(
        () => [...rows, ...requestOnlyRows].sort(compareByWorkDateDesc),
        [requestOnlyRows, rows],
    );

    const gridRows = useMemo(() => {
        if (!dateFilter) return sortedRows;
        // Rascunho sem data continua visível para não sumir enquanto é preenchido.
        return sortedRows.filter((row) => {
            const day = row.workDate?.slice(0, 10) ?? "";
            return day === dateFilter || (isAttendanceDraftId(row.id) && !day);
        });
    }, [dateFilter, sortedRows]);

    const weeks = useMemo(() => attendancePeriodWeeks(period.from, period.to), [period.from, period.to]);

    const weeksWithRows = useMemo(() => {
        const keys = new Set<string>();
        for (const row of gridRows) {
            const week = findAttendancePeriodWeek(weeks, row.workDate);
            if (week) keys.add(week.key);
        }
        return keys;
    }, [gridRows, weeks]);

    const highlightedWeekRef = useRef<string | null>(null);
    useEffect(() => {
        highlightedWeekRef.current = highlightedWeekKey;
    }, [highlightedWeekKey]);

    const selectWeek = (weekKey: string) => {
        setActiveWeekKey(weekKey);
        setHighlightedWeekKey(weekKey);
        // Trava até a rolagem suave terminar (`scrollend`), com teto para navegador sem o evento.
        weekScrollLockRef.current = Date.now() + 1200;
        scrollToWeekRow(gridHostRef.current, weekKey);
    };

    // A semana marcada acompanha a rolagem do grid; o contorno sai quando a semana destacada sai de vista.
    const gridReady = hasCollaborator && historyQuery.isSuccess;
    useEffect(() => {
        if (!gridReady) return;
        const scroller = gridHostRef.current?.querySelector<HTMLElement>(".attendance-sheet-wrap");
        if (!scroller) return;
        let frame = 0;
        const sync = () => {
            const highlighted = highlightedWeekRef.current;
            if (highlighted && isWeekRowVisible(scroller, highlighted)) return;
            setHighlightedWeekKey(null);
            setActiveWeekKey(visibleWeekKey(scroller));
        };
        const onScroll = () => {
            if (Date.now() < weekScrollLockRef.current) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(sync);
        };
        const onScrollEnd = () => {
            weekScrollLockRef.current = 0;
        };
        scroller.addEventListener("scroll", onScroll, {passive: true});
        scroller.addEventListener("scrollend", onScrollEnd);
        return () => {
            cancelAnimationFrame(frame);
            scroller.removeEventListener("scroll", onScroll);
            scroller.removeEventListener("scrollend", onScrollEnd);
        };
    }, [gridReady]);

    const invalidateHistory = () => invalidateTimeQueries(queryClient);

    const saveMutation = useMutation({
        mutationFn: async (payload: { row: AttendanceRecord; patch: Partial<AttendanceRecordCreateDto> }) => {
            const dto: AttendanceRecordCreateDto = {
                ...attendancerecordToFormDto(payload.row),
                ...payload.patch,
            };
            if (isAttendanceUnsavedId(payload.row.id)) {
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
            toast.success(isAttendanceUnsavedId(variables.row.id) ? "Ponto lançado" : "Ponto atualizado");
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

        if (isAttendanceUnsavedId(row.id)) {
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
            await invalidateTimeQueries(queryClient);
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
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-(--gesint-border-subtle) px-4 py-1.5">
                <div className="flex min-w-0 flex-[1_1_auto] flex-wrap items-center gap-2">
                    {/* Mais estreito até 2xl: sobra espaço para a faixa de semanas na mesma linha. */}
                    <div className="w-full min-w-[14rem] max-w-sm sm:w-56 2xl:w-72">
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
                        onDateFromChange={changeDateFrom}
                        onDateToChange={changeDateTo}
                        compact
                    />
                    {gridReady ? (
                        <AttendanceWeekNavigator
                            weeks={weeks}
                            availableKeys={weeksWithRows}
                            value={activeWeekKey}
                            onSelect={(week) => selectWeek(week.key)}
                        />
                    ) : null}
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
                <div ref={gridHostRef} className="flex min-h-0 flex-1 flex-col">
                    <AttendanceEditableGrid
                        rows={gridRows}
                        requestsByDate={requestsByDate}
                        weeks={weeks}
                        highlightedWeekKey={highlightedWeekKey}
                        dateFilter={dateFilter}
                        onDateFilterChange={(isoDate) => {
                            setDateFilter(isoDate);
                            setActiveWeekKey(null);
                            setHighlightedWeekKey(null);
                        }}
                        emptyMessage={
                            dateFilter
                                ? "Nenhum ponto nesta data."
                                : "Nenhum ponto encontrado para este colaborador."
                        }
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
                        <div className="border-t border-(--gesint-border-subtle) px-4 py-3">
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
                </div>
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
