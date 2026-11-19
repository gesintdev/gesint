"use client";

import {useQuery} from "@tanstack/react-query";
import {Calendar, ChevronLeft, ChevronRight} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

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
import {Modal} from "@/shared/components/ui/Modal";
import {AppException} from "@/shared/exceptions";

type AgendaModalProps = {
    open: boolean;
    onClose: () => void;
};

export function AgendaModal({open, onClose}: AgendaModalProps) {
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
        if (open) {
            const today = startOfDay(new Date());
            setAnchorDate(today);
            setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
            return;
        }
        setFormOpen(false);
        setEditingEvent(null);
        setSlotStart(null);
    }, [open]);

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

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title="Agenda"
                subtitle="Registros pessoais"
                icon={<Calendar className="size-4" strokeWidth={2} />}
                size="full"
                padded={false}
                scroll={false}
                bodyClassName="flex flex-col overflow-hidden"
                footer={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAnchorDate(startOfDay(new Date()))}
                        >
                            Hoje
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            aria-label="Semana anterior"
                            leftIcon={<ChevronLeft className="size-4" />}
                            onClick={() => setAnchorDate((prev) => addDays(startOfWorkWeek(prev), -7))}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            aria-label="Próxima semana"
                            leftIcon={<ChevronRight className="size-4" />}
                            onClick={() => setAnchorDate((prev) => addDays(startOfWorkWeek(prev), 7))}
                        />
                        <p className="text-[13px] font-semibold text-base-content">{workWeekRangeLabel(anchorDate)}</p>
                        <div className="ms-auto flex items-center gap-2">
                            <span className="inline-flex h-9 items-center rounded-lg border border-base-content/10 bg-base-100 px-3 text-xs font-medium text-base-content/70">
                                Semana de trabalho
                            </span>
                            <Button
                                type="button"
                                leftIcon={<Calendar className="size-4" strokeWidth={2} />}
                                onClick={() => openCreate()}
                            >
                                Novo evento
                            </Button>
                        </div>
                    </div>
                }
            >
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
            </Modal>

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
        </>
    );
}
