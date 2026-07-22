"use client";

import {useQuery} from "@tanstack/react-query";
import {ChevronLeft, ChevronRight, Plus, X} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {agendaKeys} from "@/modules/cfg/settings/agenda/agenda.query";
import {AgendaEventFormDialog} from "@/modules/cfg/settings/agenda/components/AgendaEventFormDialog";
import {AgendaSidebar} from "@/modules/cfg/settings/agenda/components/AgendaSidebar";
import {AgendaWeekGrid} from "@/modules/cfg/settings/agenda/components/AgendaWeekGrid";
import type {AgendaEvent} from "@/modules/cfg/settings/agenda/dto/agenda-event.dto";
import {
    addDays,
    startOfDay,
    startOfWorkWeek,
    workWeekQueryBounds,
    workWeekRangeLabel,
} from "@/modules/cfg/settings/agenda/lib/agenda-calendar.util";
import {agendaEventService} from "@/modules/cfg/settings/agenda/services/agenda-event.service";
import {Button} from "@/shared/components/ui/Button";
import {AppException} from "@/shared/exceptions";

type AgendaModalProps = {
    open: boolean;
    onClose: () => void;
};

export function AgendaModal({open, onClose}: AgendaModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
    const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
    const [slotStart, setSlotStart] = useState<Date | null>(null);

    const bounds = useMemo(() => workWeekQueryBounds(anchorDate), [anchorDate]);

    const eventsQuery = useQuery({
        queryKey: agendaKeys.range(bounds.from, bounds.to),
        queryFn: () => agendaEventService.listInRange(bounds.from, bounds.to),
        enabled: open,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            const today = startOfDay(new Date());
            setAnchorDate(today);
            setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
            setFormOpen(false);
            setEditingEvent(null);
            setSlotStart(null);
        }
    }, [open]);

    if (!mounted) return null;

    const openCreate = (slot?: Date) => {
        setEditingEvent(null);
        setSlotStart(slot ?? null);
        setFormOpen(true);
    };

    const openEdit = (event: AgendaEvent) => {
        setSlotStart(null);
        setEditingEvent(event);
        setFormOpen(true);
    };

    return createPortal(
        <>
            <dialog ref={dialogRef} className="modal" onClose={onClose}>
                <div className="modal-box flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden p-0">
                    <div className="flex items-center justify-between gap-3 border-b border-base-content/10 px-4 py-3">
                        <div>
                            <h3 className="text-base font-semibold">Agenda</h3>
                            <p className="text-xs text-base-content/55">Registros pessoais</p>
                        </div>
                        <button
                            type="button"
                            aria-label="Fechar"
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/50"
                            onClick={onClose}
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="flex min-h-0 flex-1">
                        <AgendaSidebar
                            visibleMonth={visibleMonth}
                            selectedDate={anchorDate}
                            anchorDate={anchorDate}
                            onVisibleMonthChange={setVisibleMonth}
                            onSelectDate={(date) => {
                                setAnchorDate(startOfDay(date));
                                setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                            }}
                        />

                        <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex flex-wrap items-center gap-2 border-b border-base-content/10 px-3 py-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAnchorDate(startOfDay(new Date()))}
                                >
                                    Hoje
                                </Button>
                                <button
                                    type="button"
                                    aria-label="Semana anterior"
                                    className="gommo-btn gommo-btn--ghost gommo-btn--icon-only"
                                    onClick={() => setAnchorDate((prev) => addDays(startOfWorkWeek(prev), -7))}
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Próxima semana"
                                    className="gommo-btn gommo-btn--ghost gommo-btn--icon-only"
                                    onClick={() => setAnchorDate((prev) => addDays(startOfWorkWeek(prev), 7))}
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                                <p className="text-sm font-medium">{workWeekRangeLabel(anchorDate)}</p>
                                <div className="ms-auto flex items-center gap-2">
                                    <span className="rounded-md border border-base-content/10 px-2 py-1 text-xs text-base-content/60">
                                        Semana de trabalho
                                    </span>
                                    <Button type="button" size="sm" onClick={() => openCreate()}>
                                        <Plus className="size-4" />
                                        Novo
                                    </Button>
                                </div>
                            </div>

                            {eventsQuery.isError ? (
                                <p className="px-4 py-3 text-sm font-medium text-error">
                                    {eventsQuery.error instanceof AppException
                                        ? eventsQuery.error.displayMessage
                                        : "Não foi possível carregar a agenda."}
                                </p>
                            ) : null}

                            <AgendaWeekGrid
                                anchorDate={anchorDate}
                                events={eventsQuery.data ?? []}
                                onSlotClick={openCreate}
                                onEventClick={openEdit}
                            />
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button type="submit" aria-label="Fechar">
                        fechar
                    </button>
                </form>
            </dialog>

            <AgendaEventFormDialog
                open={formOpen}
                event={editingEvent}
                initialSlotStart={slotStart}
                onClose={() => {
                    setFormOpen(false);
                    setEditingEvent(null);
                    setSlotStart(null);
                }}
            />
        </>,
        document.body,
    );
}
