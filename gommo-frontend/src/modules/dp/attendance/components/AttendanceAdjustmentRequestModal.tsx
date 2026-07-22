"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {toast} from "sonner";

import type {
    AttendancePunchSlotKey,
    AttendanceRecord,
    AttendanceSubmissionPayload,
} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {
    createClientRequestId,
    formatAttendancePunch,
} from "@/modules/dp/attendance/lib/attendance-clock.util";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";
import {Button} from "@/shared/components/ui/Button";
import {InputHour, InputSelect, InputString} from "@/shared/components/ui/input/index";
import {PopoverPortalProvider} from "@/shared/components/ui/input/popover-portal";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";
import {ExceptionCapture} from "@/shared/exceptions";

type PunchSlot = {
    key: AttendancePunchSlotKey;
    title: string;
    emptyHint: string;
};

const PUNCH_SLOTS: PunchSlot[] = [
    {key: "clockIn", title: "Entrada", emptyHint: "Sem entrada"},
    {key: "breakStart", title: "Saída almoço", emptyHint: "Sem saída"},
    {key: "breakEnd", title: "Retorno almoço", emptyHint: "Sem retorno"},
    {key: "clockOut", title: "Fim expediente", emptyHint: "Sem saída"},
];

const REASON_ITEMS: SelectItem[] = [
    {value: "Esquecimento de registro", label: "Esquecimento de registro"},
    {value: "Erro no horário registrado", label: "Erro no horário registrado"},
    {value: "Sem conexão no momento", label: "Sem conexão no momento"},
    {value: "Registro em equipamento incorreto", label: "Registro em equipamento incorreto"},
    {value: "Orientação do gestor", label: "Orientação do gestor"},
    {value: "Outro", label: "Outro"},
];

type PunchValues = Record<AttendancePunchSlotKey, string>;

const EMPTY_PUNCHES: PunchValues = {
    clockIn: "",
    breakStart: "",
    breakEnd: "",
    clockOut: "",
};

export type AttendanceAdjustmentTarget = {
    workDate: string;
    record?: AttendanceRecord | null;
    /** Horários já exibidos no histórico — snapshot no clique. */
    initialPunches: PunchValues;
};

type AttendanceAdjustmentRequestModalProps = {
    open: boolean;
    target: AttendanceAdjustmentTarget | null;
    onClose: () => void;
};

function toDisplayDate(isoDate: string) {
    const [year, month, day] = isoDate.slice(0, 10).split("-");
    if (!year || !month || !day) return isoDate;
    return `${day}/${month}/${year}`;
}

function punchValue(record: AttendanceRecord | null | undefined, key: AttendancePunchSlotKey) {
    const raw = record?.[key];
    const formatted = formatAttendancePunch(raw);
    return formatted === "—" ? "" : formatted;
}

function punchesFromRecord(record?: AttendanceRecord | null): PunchValues {
    return {
        clockIn: punchValue(record, "clockIn"),
        breakStart: punchValue(record, "breakStart"),
        breakEnd: punchValue(record, "breakEnd"),
        clockOut: punchValue(record, "clockOut"),
    };
}

export function buildAdjustmentPunches(record?: AttendanceRecord | null): PunchValues {
    return punchesFromRecord(record);
}

function buildDetails(reason: string, note: string, changedLabels: string[]) {
    const action =
        changedLabels.length === 0
            ? "Ajuste de ponto"
            : changedLabels.length === 1
              ? `Alteração de ${changedLabels[0]}`
              : `Alteração de ${changedLabels.join(", ")}`;
    const lines = [`Ação: ${action}`, `Motivo: ${reason}`];
    const trimmed = note.trim();
    if (trimmed) lines.push(`Observação: ${trimmed}`);
    return lines.join("\n");
}

function collectChangedPunches(values: PunchValues, original: PunchValues) {
    const changed: Partial<Record<AttendancePunchSlotKey, string>> = {};
    const labels: string[] = [];
    for (const slot of PUNCH_SLOTS) {
        const next = values[slot.key].trim();
        const previous = (original[slot.key] ?? "").trim();
        if (next && next !== previous) {
            changed[slot.key] = next;
            labels.push(slot.title);
        }
    }
    return {changed, labels};
}

export function AttendanceAdjustmentRequestModal({
    open,
    target,
    onClose,
}: AttendanceAdjustmentRequestModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const queryClient = useQueryClient();
    const [mounted, setMounted] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const [draftPunches, setDraftPunches] = useState<PunchValues | null>(null);
    const [formSession, setFormSession] = useState("closed");
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    const workDate = target?.workDate.slice(0, 10) ?? "";
    const record = target?.record ?? null;
    const formSessionKey =
        open && target ? `${target.workDate}:${target.record?.id ?? "new"}` : "closed";

    if (open && target && formSession !== formSessionKey) {
        setFormSession(formSessionKey);
        setDraftPunches({...target.initialPunches});
        setReason("");
        setNote("");
        setError(null);
    }
    if (!open && formSession !== "closed") {
        setFormSession("closed");
        setDraftPunches(null);
    }

    const punches = draftPunches ?? target?.initialPunches ?? EMPTY_PUNCHES;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !mounted) return;
        if (open && !dialog.open) {
            dialog.showModal();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open, mounted]);

    const closeOnlyThisModal = (event?: {stopPropagation?: () => void}) => {
        event?.stopPropagation?.();
        onClose();
    };

    const submitMutation = useMutation({
        mutationFn: (payload: AttendanceSubmissionPayload) => attendancerecordService.submit(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["attendance", "mobile-records"]});
            toast.success("Solicitação de ajuste enviada");
            onClose();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                toast: false,
                fallbackMessage: "Não foi possível enviar a solicitação.",
            });
            setError(ex.displayMessage);
        },
    });

    const updatePunch = (key: AttendancePunchSlotKey, value: string) => {
        setDraftPunches((prev) => ({...(prev ?? target?.initialPunches ?? EMPTY_PUNCHES), [key]: value}));
        if (error) setError(null);
    };

    const handleSubmit = () => {
        if (!workDate) return;
        if (!reason) {
            setError("Selecione o motivo do ajuste.");
            return;
        }

        const original = target?.initialPunches ?? EMPTY_PUNCHES;
        const {changed, labels} = collectChangedPunches(punches, original);
        if (Object.keys(changed).length === 0) {
            setError("Altere ao menos um horário para solicitar o ajuste.");
            return;
        }

        const payload: AttendanceSubmissionPayload = {
            requestType: "TIME_ADJUSTMENT",
            requestDate: workDate,
            details: buildDetails(reason, note, labels),
            source: "MOBILE",
            clientRequestId: createClientRequestId(),
            submittedAt: new Date().toISOString(),
            ...changed,
        };

        if (record?.id) {
            payload.targetRecordId = record.id;
        }

        setError(null);
        submitMutation.mutate(payload);
    };

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={(node) => {
                dialogRef.current = node;
                if (node !== portalRoot) {
                    setPortalRoot(node);
                }
            }}
            className="modal"
            onClose={(event) => {
                event.stopPropagation();
                onClose();
            }}
            onCancel={(event) => {
                event.stopPropagation();
            }}
            onClick={(event) => {
                event.stopPropagation();
                if (event.target === event.currentTarget) closeOnlyThisModal(event);
            }}
        >
            <PopoverPortalProvider container={portalRoot}>
                <div className="modal-box max-w-xl" onClick={(event) => event.stopPropagation()}>
                    <div>
                        <h3 className="text-base font-semibold">Solicitar ajuste de ponto</h3>
                        <p className="mt-1 text-sm text-base-content/65">
                            {workDate
                                ? `Registros do dia · ${toDisplayDate(workDate)}`
                                : "Selecione um dia no histórico."}
                        </p>
                    </div>

                    <div
                        key={formSessionKey}
                        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                        {PUNCH_SLOTS.map((slot) => {
                            const value = punches[slot.key];
                            const original = target?.initialPunches[slot.key] ?? "";
                            const changed = Boolean(value) && value !== original;
                            return (
                                <div
                                    key={slot.key}
                                    className="rounded-xl border border-base-content/10 bg-base-200/25 p-3"
                                >
                                    <InputHour
                                        label={slot.title}
                                        value={value}
                                        onValueChange={(next) => updatePunch(slot.key, next)}
                                        hint={value ? (changed ? "Alterado" : "Registrado") : slot.emptyHint}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 grid gap-3">
                        <InputSelect
                            label="Motivo"
                            items={REASON_ITEMS}
                            value={reason}
                            onValueChange={(value) => {
                                setReason(value);
                                if (error) setError(null);
                            }}
                            placeholder="Selecione o motivo"
                            required
                        />
                        <InputString
                            label="Observação"
                            value={note}
                            onValueChange={setNote}
                            placeholder="Opcional"
                        />
                        {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                    </div>

                    <div className="modal-action">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={(event) => closeOnlyThisModal(event)}
                            disabled={submitMutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleSubmit();
                            }}
                            loading={submitMutation.isPending}
                            disabled={submitMutation.isPending || !workDate}
                        >
                            Enviar solicitação
                        </Button>
                    </div>
                </div>
            </PopoverPortalProvider>
            <button
                type="button"
                className="modal-backdrop"
                aria-label="Fechar"
                onClick={(event) => closeOnlyThisModal(event)}
            />
        </dialog>,
        document.body,
    );
}
