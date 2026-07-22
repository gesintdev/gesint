"use client";

import clsx from "clsx";
import {Check, ChevronDown, ChevronRight, CircleAlert, Eye, Trash2, X} from "lucide-react";
import {
    Fragment,
    type KeyboardEvent,
    type MouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceRequest,
} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {AttendanceSheetTimeInput} from "@/modules/dp/attendance/components/AttendanceSheetTimeInput";
import {attendancerecordToFormDto} from "@/modules/dp/attendance/lib/attendance-record.mapper";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {isoToDateBr, maskDateBr, parseDateBrToIso, parseIsoToDate} from "@/shared/lib/input/date";
import {maskTimeInput, parseTimeInputToValue, timeToDisplay} from "@/shared/lib/input/time";

export type AttendanceEditableField = "workDate" | "clockIn" | "breakStart" | "breakEnd" | "clockOut";

const TIME_FIELDS: AttendanceEditableField[] = ["clockIn", "breakStart", "breakEnd", "clockOut"];

const FIELD_LABEL: Record<AttendanceEditableField, string> = {
    workDate: "Data",
    clockIn: "Entrada",
    breakStart: "Saída",
    breakEnd: "Retorno",
    clockOut: "Fim expediente",
};

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {weekday: "short"});

function formatWorkDateLabel(isoDate: string): string {
    const br = isoToDateBr(isoDate);
    if (!br) return "—";
    const date = parseIsoToDate(isoDate);
    if (!date) return br;
    const weekday = WEEKDAY_FORMATTER.format(date)
        .replace(/\.$/, "")
        .replace(/^\p{L}/u, (char) => char.toUpperCase());
    return `${weekday} ${br}`;
}

export function isAttendanceDraftId(id: string) {
    return id.startsWith("draft:");
}

/** Ponto criado/alterado no backoffice (não veio intacto do mobile). */
export function isAttendanceEdited(row: AttendanceRecord) {
    if (isAttendanceDraftId(row.id)) return false;
    return row.occurrenceOrigin === "MANUAL" || row.occurrenceType === "TIME_ADJUSTMENT";
}

type ActiveCell = {
    rowId: string;
    field: AttendanceEditableField;
};

type RowDraft = {
    rowId: string;
    /** Valores canônicos (ISO date / HH:mm) pendentes de persistência. */
    values: Partial<Record<AttendanceEditableField, string>>;
};

type AttendanceEditableGridProps = {
    rows: AttendanceRecord[];
    requestsByDate: Map<string, AttendanceRequest[]>;
    savingRowId?: string | null;
    deletingRowId?: string | null;
    focusCell?: ActiveCell | null;
    onCommitRow: (row: AttendanceRecord, patch: Partial<AttendanceRecordCreateDto>) => Promise<void>;
    onDeleteRow: (row: AttendanceRecord) => void;
    onApproveRequest: (request: AttendanceRequest) => void;
    onRejectRequest: (request: AttendanceRequest) => void;
    onDetailRequest: (request: AttendanceRequest) => void;
    onDirtyChange?: (dirty: boolean) => void;
};

function rowFieldCanonical(row: AttendanceRecord, field: AttendanceEditableField): string {
    if (field === "workDate") return row.workDate?.slice(0, 10) ?? "";
    return normalizeTime(row[field]);
}

function parseCellInput(field: AttendanceEditableField, raw: string): string | null {
    if (field === "workDate") {
        const masked = maskDateBr(raw);
        if (!masked) return "";
        if (masked.length < 10) return null;
        return parseDateBrToIso(masked);
    }
    return parseTimeInputToValue(raw);
}

function displayForField(field: AttendanceEditableField, canonical: string): string {
    if (field === "workDate") return isoToDateBr(canonical) || "";
    return timeToDisplay(canonical) || canonical;
}

function formatHours(value?: number | null): string {
    if (value == null || Number.isNaN(value)) return "—";
    return value.toFixed(2);
}

function debitHours(row: AttendanceRecord): string {
    if (row.expectedHours == null) return "—";
    const expected = row.expectedHours;
    const worked = row.workedHours ?? 0;
    return formatHours(Math.max(0, expected - worked));
}

function creditHours(row: AttendanceRecord): string {
    if (row.expectedHours == null) return "—";
    const expected = row.expectedHours;
    const worked = row.workedHours ?? 0;
    return formatHours(Math.max(0, worked - expected));
}

function normalizeTime(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}

function isDateEditable(row: AttendanceRecord) {
    return isAttendanceDraftId(row.id) || !row.workDate;
}

function editableFieldsFor(row: AttendanceRecord): AttendanceEditableField[] {
    return isDateEditable(row) ? ["workDate", ...TIME_FIELDS] : [...TIME_FIELDS];
}

function requestTypeLabel(type: string): string {
    const map: Record<string, string> = {
        TIME_ADJUSTMENT: "Ajuste de ponto",
        DAY_ABSENCE_EXCUSE: "Abono de dia",
        MEDICAL_CERTIFICATE: "Atestado médico",
        LEAVE_ABSENCE: "Afastamento",
        HOUR_BANK: "Banco de horas",
        OTHER: "Outro",
    };
    return map[type] ?? type;
}

export function AttendanceEditableGrid({
                                           rows,
                                           requestsByDate,
                                           savingRowId,
                                           deletingRowId,
                                           focusCell,
                                           onCommitRow,
                                           onDeleteRow,
                                           onApproveRequest,
                                           onRejectRequest,
                                           onDetailRequest,
                                           onDirtyChange,
                                       }: AttendanceEditableGridProps) {
    const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
    const [draftValue, setDraftValue] = useState("");
    const [draftBaseline, setDraftBaseline] = useState("");
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const committingRef = useRef(false);
    const rowDraftRef = useRef<RowDraft | null>(null);
    const [rowDraft, setRowDraft] = useState<RowDraft | null>(null);

    const syncRowDraft = useCallback((next: RowDraft | null) => {
        rowDraftRef.current = next;
        setRowDraft(next);
    }, []);

    const isDirty = Boolean(
        (activeCell && draftValue !== draftBaseline) ||
        (rowDraft &&
            Object.entries(rowDraft.values).some(([field, value]) => {
                const row = rows.find((item) => item.id === rowDraft.rowId);
                if (!row || value == null) return false;
                return value !== rowFieldCanonical(row, field as AttendanceEditableField);
            })),
    );

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    useEffect(() => {
        if (activeCell) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [activeCell]);

    const clearEditing = useCallback(() => {
        syncRowDraft(null);
        setActiveCell(null);
        setDraftValue("");
        setDraftBaseline("");
    }, [syncRowDraft]);

    const beginEdit = useCallback(
        (row: AttendanceRecord, field: AttendanceEditableField) => {
            if (field === "workDate" && !isDateEditable(row)) return;
            let draft = rowDraftRef.current;
            if (!draft || draft.rowId !== row.id) {
                draft = {rowId: row.id, values: {}};
                syncRowDraft(draft);
            }
            const canonical =
                draft.values[field] !== undefined
                    ? (draft.values[field] as string)
                    : rowFieldCanonical(row, field);
            const display = displayForField(field, canonical);
            setActiveCell({rowId: row.id, field});
            setDraftValue(display);
            setDraftBaseline(display);
        },
        [syncRowDraft],
    );

    const lastFocusKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!focusCell) return;
        const key = `${focusCell.rowId}:${focusCell.field}`;
        if (lastFocusKeyRef.current === key) return;
        const row = rows.find((item) => item.id === focusCell.rowId);
        if (!row) return;
        lastFocusKeyRef.current = key;
        beginEdit(row, focusCell.field);
    }, [beginEdit, focusCell, rows]);

    /** Aplica a célula atual no rascunho da linha (sem API). */
    const applyCurrentCellToDraft = useCallback(
        (draftOverride?: string): RowDraft | null => {
            if (!activeCell) return rowDraftRef.current;
            const raw = draftOverride ?? draftValue;
            const parsed = parseCellInput(activeCell.field, raw);
            if (parsed == null) {
                inputRef.current?.focus();
                return null;
            }
            const base =
                rowDraftRef.current?.rowId === activeCell.rowId
                    ? rowDraftRef.current
                    : {rowId: activeCell.rowId, values: {}};
            const next: RowDraft = {
                rowId: base.rowId,
                values: {...base.values, [activeCell.field]: parsed},
            };
            syncRowDraft(next);
            setDraftValue(displayForField(activeCell.field, parsed));
            setDraftBaseline(displayForField(activeCell.field, parsed));
            return next;
        },
        [activeCell, draftValue, syncRowDraft],
    );

    /** Persiste o rascunho da linha no banco. */
    const persistRowDraft = useCallback(
        async (draft: RowDraft | null) => {
            if (!draft || committingRef.current) {
                clearEditing();
                return;
            }
            const row = rows.find((item) => item.id === draft.rowId);
            if (!row) {
                clearEditing();
                return;
            }

            const patch: Partial<AttendanceRecordCreateDto> = {};
            let changed = false;
            for (const field of editableFieldsFor(row)) {
                if (draft.values[field] === undefined) continue;
                const nextValue = draft.values[field] as string;
                const previous = rowFieldCanonical(row, field);
                if (nextValue === previous) continue;
                patch[field] = nextValue || undefined;
                changed = true;
            }

            if (!changed) {
                clearEditing();
                return;
            }

            committingRef.current = true;
            try {
                const form = attendancerecordToFormDto(row);
                await onCommitRow(row, {...form, ...patch});
                clearEditing();
            } finally {
                committingRef.current = false;
            }
        },
        [clearEditing, onCommitRow, rows],
    );

    const cancelActive = useCallback(() => {
        clearEditing();
    }, [clearEditing]);

    const moveToField = useCallback(
        (row: AttendanceRecord, field: AttendanceEditableField) => {
            beginEdit(row, field);
        },
        [beginEdit],
    );

    const moveToNextField = useCallback(
        async (row: AttendanceRecord, field: AttendanceEditableField) => {
            const draft = applyCurrentCellToDraft();
            if (!draft) return;

            const fields = editableFieldsFor(row);
            const index = fields.indexOf(field);
            const nextField = fields[index + 1];
            if (nextField) {
                moveToField(row, nextField);
                return;
            }

            const rowIndex = rows.findIndex((item) => item.id === row.id);
            const nextRow = rows[rowIndex + 1];
            await persistRowDraft(draft);
            if (nextRow) {
                beginEdit(nextRow, editableFieldsFor(nextRow)[0]);
            }
        },
        [applyCurrentCellToDraft, beginEdit, moveToField, persistRowDraft, rows],
    );

    const moveToPreviousField = useCallback(
        async (row: AttendanceRecord, field: AttendanceEditableField) => {
            const draft = applyCurrentCellToDraft();
            if (!draft) return;

            const fields = editableFieldsFor(row);
            const index = fields.indexOf(field);
            const previousField = fields[index - 1];
            if (previousField) {
                moveToField(row, previousField);
                return;
            }

            const rowIndex = rows.findIndex((item) => item.id === row.id);
            const previousRow = rows[rowIndex - 1];
            await persistRowDraft(draft);
            if (previousRow) {
                const previousFields = editableFieldsFor(previousRow);
                beginEdit(previousRow, previousFields[previousFields.length - 1]);
            }
        },
        [applyCurrentCellToDraft, beginEdit, moveToField, persistRowDraft, rows],
    );

    const navigateToCell = useCallback(
        async (target: ActiveCell) => {
            if (!activeCell) {
                const row = rows.find((item) => item.id === target.rowId);
                if (row) beginEdit(row, target.field);
                return;
            }
            const draft = applyCurrentCellToDraft();
            if (!draft) return;

            if (activeCell.rowId === target.rowId) {
                const row = rows.find((item) => item.id === target.rowId);
                if (row) moveToField(row, target.field);
                return;
            }

            await persistRowDraft(draft);
            const row = rows.find((item) => item.id === target.rowId);
            if (row) beginEdit(row, target.field);
        },
        [activeCell, applyCurrentCellToDraft, beginEdit, moveToField, persistRowDraft, rows],
    );

    const onCellKeyDown = async (event: KeyboardEvent<HTMLInputElement>, row: AttendanceRecord) => {
        if (!activeCell) return;
        if (event.key === "Enter") {
            event.preventDefault();
            const draft = applyCurrentCellToDraft();
            if (!draft) return;
            await persistRowDraft(draft);
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            const draft = applyCurrentCellToDraft();
            if (!draft) return;
            await persistRowDraft(draft);
            return;
        }
        if (event.key === "Tab") {
            event.preventDefault();
            if (event.shiftKey) {
                await moveToPreviousField(row, activeCell.field);
            } else {
                await moveToNextField(row, activeCell.field);
            }
        }
    };

    const onGridMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (!activeCell) return;
        const target = event.target as HTMLElement | null;
        if (target?.closest("[data-attendance-editable-cell='true']")) return;
        if (target?.closest("[data-attendance-sheet-time-input='true']")) return;
        if (target?.closest(".gommo-hour-picker-panel")) return;
        const draft = applyCurrentCellToDraft();
        if (draft) void persistRowDraft(draft);
        else cancelActive();
    };

    const requestStatusLabel: Record<string, string> = {
        PENDING: "Pendente",
        APPROVED: "Aprovada",
        REJECTED: "Reprovada",
    };

    return (
        <div className="attendance-sheet-wrap" onMouseDown={onGridMouseDown}>
            <table className="attendance-sheet gommo-table">
                <colgroup>
                    <col style={{width: "9.5rem"}}/>
                    <col style={{width: "7.25rem"}}/>
                    <col style={{width: "7.25rem"}}/>
                    <col style={{width: "7.25rem"}}/>
                    <col style={{width: "8rem"}}/>
                    <col style={{width: "8rem"}}/>
                    <col style={{width: "5.5rem"}}/>
                    <col style={{width: "5.5rem"}}/>
                    <col style={{width: "6.75rem"}}/>
                </colgroup>
                <thead>
                <tr>
                    <th>
                        <span className="gommo-table-col-title">Data</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Entrada</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Saída</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Retorno</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Fim expediente</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Horas trabalhadas</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Débito</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Crédito</span>
                    </th>
                    <th>
                        <span className="gommo-table-col-title">Ações</span>
                    </th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row) => {
                    const dayKey = row.workDate?.slice(0, 10) ?? "";
                    const dayRequests = dayKey ? (requestsByDate.get(dayKey) ?? []) : [];
                    const hasAdjustment = dayRequests.length > 0;
                    const hasPendingAdjustment = dayRequests.some(
                        (item) => item.requestStatus === "PENDING",
                    );
                    const expanded = expandedRowId === row.id;
                    const saving = savingRowId === row.id;
                    const dateEditable = isDateEditable(row);
                    const dateActive = activeCell?.rowId === row.id && activeCell.field === "workDate";

                    return (
                        <Fragment key={row.id}>
                            <tr
                                className={clsx(
                                    hasPendingAdjustment && "attendance-sheet__row--adjustment",
                                    isAttendanceDraftId(row.id) && "attendance-sheet__row--draft",
                                    saving && "attendance-sheet__row--saving",
                                )}
                            >
                                <td
                                    data-attendance-editable-cell={dateEditable ? "true" : undefined}
                                    className={clsx(
                                        "attendance-sheet__cell",
                                        dateEditable && "attendance-sheet__cell--editable",
                                        dateActive && "attendance-sheet__cell--active",
                                    )}
                                    onDoubleClick={() => {
                                        if (!dateEditable) return;
                                        if (activeCell) {
                                            void navigateToCell({rowId: row.id, field: "workDate"});
                                        } else {
                                            beginEdit(row, "workDate");
                                        }
                                    }}
                                    onClick={() => {
                                        if (!dateEditable || !activeCell || dateActive) return;
                                        void navigateToCell({rowId: row.id, field: "workDate"});
                                    }}
                                >
                                    {dateActive ? (
                                        <input
                                            ref={inputRef}
                                            className="attendance-sheet__input"
                                            value={draftValue}
                                            aria-label={FIELD_LABEL.workDate}
                                            onChange={(event) => setDraftValue(maskDateBr(event.target.value))}
                                            onKeyDown={(event) => void onCellKeyDown(event, row)}
                                        />
                                    ) : (
                                        <div className="attendance-sheet__meta">
                                                <span
                                                    className={clsx(
                                                        !(
                                                            (rowDraft?.rowId === row.id &&
                                                                rowDraft.values.workDate) ||
                                                            dayKey
                                                        ) && "attendance-sheet__value--muted",
                                                    )}
                                                >
                                                    {formatWorkDateLabel(
                                                        rowDraft?.rowId === row.id &&
                                                        rowDraft.values.workDate !== undefined
                                                            ? rowDraft.values.workDate
                                                            : dayKey,
                                                    )}
                                                </span>
                                            {isAttendanceEdited(row) ? (
                                                <span
                                                    className="attendance-sheet__edited"
                                                    title="Ponto editado"
                                                    aria-label="Ponto editado"
                                                >
                                                        <CircleAlert className="size-3.5"/>
                                                    </span>
                                            ) : null}
                                            {hasPendingAdjustment ? (
                                                <span className="attendance-sheet__chip attendance-sheet__chip--warn">
                                                        Ajuste
                                                    </span>
                                            ) : null}
                                            {isAttendanceDraftId(row.id) ? (
                                                <span className="attendance-sheet__chip">Novo</span>
                                            ) : null}
                                        </div>
                                    )}
                                </td>
                                {TIME_FIELDS.map((field) => {
                                    const isActive =
                                        activeCell?.rowId === row.id && activeCell.field === field;
                                    const display =
                                        rowDraft?.rowId === row.id && rowDraft.values[field] !== undefined
                                            ? (rowDraft.values[field] as string)
                                            : normalizeTime(row[field]);
                                    return (
                                        <td
                                            key={field}
                                            data-attendance-editable-cell="true"
                                            className={clsx(
                                                "attendance-sheet__cell attendance-sheet__cell--editable",
                                                isActive && "attendance-sheet__cell--active",
                                            )}
                                            onDoubleClick={() => {
                                                if (activeCell) {
                                                    void navigateToCell({rowId: row.id, field});
                                                } else {
                                                    beginEdit(row, field);
                                                }
                                            }}
                                            onClick={() => {
                                                if (activeCell && !isActive) {
                                                    void navigateToCell({rowId: row.id, field});
                                                }
                                            }}
                                        >
                                            {isActive ? (
                                                <AttendanceSheetTimeInput
                                                    ref={inputRef}
                                                    value={draftValue}
                                                    ariaLabel={FIELD_LABEL[field]}
                                                    onValueChange={setDraftValue}
                                                    onKeyDown={(event) => void onCellKeyDown(event, row)}
                                                    onPick={(canonical) => {
                                                        setDraftValue(timeToDisplay(canonical));
                                                        applyCurrentCellToDraft(timeToDisplay(canonical));
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    className={clsx(
                                                        "attendance-sheet__value",
                                                        !display && "attendance-sheet__value--muted",
                                                    )}
                                                >
                                                        {display ? timeToDisplay(display) : "—"}
                                                    </span>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="attendance-sheet__cell">
                                        <span className="attendance-sheet__value attendance-sheet__value--right">
                                            {formatHours(row.workedHours)}
                                        </span>
                                </td>
                                <td className="attendance-sheet__cell">
                                        <span
                                            className="attendance-sheet__value attendance-sheet__value--right text-error/80">
                                            {debitHours(row)}
                                        </span>
                                </td>
                                <td className="attendance-sheet__cell">
                                        <span
                                            className="attendance-sheet__value attendance-sheet__value--right text-success/80">
                                            {creditHours(row)}
                                        </span>
                                </td>
                                <td className="attendance-sheet__cell">
                                    <div className="gommo-table-actions">
                                        {hasAdjustment ? (
                                            <TableActionButton
                                                actionVariant="open"
                                                aria-label={
                                                    expanded
                                                        ? "Ocultar histórico de ajustes"
                                                        : "Ver histórico de ajustes"
                                                }
                                                title={
                                                    expanded
                                                        ? "Ocultar histórico de ajustes"
                                                        : "Ver histórico de ajustes"
                                                }
                                                leftIcon={
                                                    expanded ? (
                                                        <ChevronDown className="size-3.5"/>
                                                    ) : (
                                                        <ChevronRight className="size-3.5"/>
                                                    )
                                                }
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setExpandedRowId(expanded ? null : row.id);
                                                }}
                                            />
                                        ) : null}
                                        <TableActionButton
                                            actionVariant="delete"
                                            aria-label="Excluir ponto"
                                            title="Excluir ponto"
                                            loading={deletingRowId === row.id}
                                            leftIcon={<Trash2 className="size-3.5"/>}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDeleteRow(row);
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            {hasAdjustment ? (
                                <tr
                                    className="attendance-sheet__expand"
                                    data-open={expanded ? "true" : "false"}
                                    aria-hidden={!expanded}
                                >
                                    <td colSpan={9}>
                                        <div className="attendance-sheet__expand-viewport">
                                            <div className="attendance-sheet__expand-inner">
                                                <div className="attendance-sheet__expand-body">
                                                    {dayRequests.map((request) => {
                                                        const statusLabel =
                                                            requestStatusLabel[request.requestStatus] ??
                                                            request.requestStatus;
                                                        const timeSegments = [
                                                            {
                                                                label: "Entrada",
                                                                from: normalizeTime(request.originalClockIn),
                                                                to: normalizeTime(request.clockIn),
                                                            },
                                                            {
                                                                label: "Saída",
                                                                from: normalizeTime(request.originalBreakStart),
                                                                to: normalizeTime(request.breakStart),
                                                            },
                                                            {
                                                                label: "Retorno",
                                                                from: normalizeTime(request.originalBreakEnd),
                                                                to: normalizeTime(request.breakEnd),
                                                            },
                                                            {
                                                                label: "Fim",
                                                                from: normalizeTime(request.originalClockOut),
                                                                to: normalizeTime(request.clockOut),
                                                            },
                                                        ];
                                                        return (
                                                            <div
                                                                key={`${row.id}-${request.id}`}
                                                                className="attendance-sheet__expand-item"
                                                            >
                                                                <div className="attendance-sheet__expand-row">
                                                                    <div className="attendance-sheet__expand-meta">
                                                                            <span
                                                                                className="attendance-sheet__expand-segment attendance-sheet__expand-segment--title">
                                                                                {requestTypeLabel(request.requestType)}
                                                                                <span
                                                                                    className="attendance-sheet__expand-pipe">
                                                                                    |
                                                                                </span>
                                                                                {statusLabel}
                                                                            </span>
                                                                        {timeSegments.map((segment) => (
                                                                            <span
                                                                                key={segment.label}
                                                                                className="attendance-sheet__expand-segment"
                                                                            >
                                                                                    <span
                                                                                        className="attendance-sheet__expand-label">
                                                                                        {segment.label}
                                                                                    </span>{" "}
                                                                                {segment.from || "—"} →{" "}
                                                                                {segment.to || "—"}
                                                                                </span>
                                                                        ))}
                                                                    </div>
                                                                    <div className="gommo-table-actions">
                                                                        {request.requestStatus === "PENDING" ? (
                                                                            <>
                                                                                <TableActionButton
                                                                                    actionVariant="open"
                                                                                    aria-label="Aprovar"
                                                                                    title="Aprovar"
                                                                                    leftIcon={
                                                                                        <Check className="size-3.5"/>
                                                                                    }
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        onApproveRequest(request);
                                                                                    }}
                                                                                />
                                                                                <TableActionButton
                                                                                    actionVariant="delete"
                                                                                    aria-label="Recusar"
                                                                                    title="Recusar"
                                                                                    leftIcon={
                                                                                        <X className="size-3.5"/>
                                                                                    }
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        onRejectRequest(request);
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : null}
                                                                        <TableActionButton
                                                                            actionVariant="edit"
                                                                            aria-label="Detalhar"
                                                                            title="Detalhar"
                                                                            leftIcon={<Eye className="size-3.5"/>}
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                onDetailRequest(request);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {request.notes ? (
                                                                    <p className="attendance-sheet__expand-notes">
                                                                        {request.notes}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                        </Fragment>
                    );
                })}
                </tbody>
            </table>
            {rows.length === 0 ? (
                <p className="attendance-sheet__empty">
                    Nenhum ponto encontrado para este colaborador.
                </p>
            ) : null}
        </div>
    );
}
