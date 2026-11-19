"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Calendar, Check, MapPin} from "lucide-react";
import {useEffect, useState} from "react";
import {toast} from "sonner";

import {agendaKeys} from "@/modules/cfg/settings/agenda/agenda.query";
import type {AgendaEvent} from "@/modules/cfg/settings/agenda/dto/agenda-event.dto";
import {
    defaultEventRange,
    localDatetimeToOffsetIso,
    offsetIsoToLocalDatetime,
} from "@/modules/cfg/settings/agenda/lib/agenda-calendar.util";
import {agendaEventService} from "@/modules/cfg/settings/agenda/services/agenda-event.service";
import {Button} from "@/shared/components/ui/Button";
import {InputDatetime, InputMarkdown, InputString} from "@/shared/components/ui/input/index";
import {Modal} from "@/shared/components/ui/Modal";
import {AppException, ExceptionCapture} from "@/shared/exceptions";

type AgendaEventFormDialogProps = {
    open: boolean;
    event?: AgendaEvent | null;
    initialSlotStart?: Date | null;
    onClose: () => void;
};

type FormState = {
    title: string;
    startsAt: string;
    endsAt: string;
    location: string;
    description: string;
};

function emptyForm(slotStart?: Date | null): FormState {
    const range = defaultEventRange(slotStart ?? undefined);
    return {
        title: "",
        startsAt: range.startsAt,
        endsAt: range.endsAt,
        location: "",
        description: "",
    };
}

function fromEvent(event: AgendaEvent): FormState {
    return {
        title: event.title ?? "",
        startsAt: offsetIsoToLocalDatetime(event.startsAt),
        endsAt: offsetIsoToLocalDatetime(event.endsAt),
        location: event.location ?? "",
        description: event.description ?? "",
    };
}

export function AgendaEventFormDialog({
    open,
    event,
    initialSlotStart,
    onClose,
}: AgendaEventFormDialogProps) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<FormState>(() => emptyForm());
    const [error, setError] = useState<string | null>(null);
    const isEditing = Boolean(event?.id);

    useEffect(() => {
        if (!open) return;
        setForm(event ? fromEvent(event) : emptyForm(initialSlotStart));
        setError(null);
    }, [open, event, initialSlotStart]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const title = form.title.trim();
            if (!title) {
                throw new AppException({
                    code: "AGENDA_EVENT_TITLE_REQUIRED",
                    message: "Informe o título do evento",
                    displayMessage: "Informe o título do evento",
                    source: "client",
                });
            }
            const startsAt = localDatetimeToOffsetIso(form.startsAt);
            const endsAt = localDatetimeToOffsetIso(form.endsAt);
            if (!startsAt || !endsAt) {
                throw new AppException({
                    code: "AGENDA_EVENT_RANGE_INVALID",
                    message: "Informe início e término válidos",
                    displayMessage: "Informe início e término válidos",
                    source: "client",
                });
            }
            if (new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
                throw new AppException({
                    code: "AGENDA_EVENT_RANGE_INVALID",
                    message: "O término deve ser igual ou posterior ao início",
                    displayMessage: "O término deve ser igual ou posterior ao início",
                    source: "client",
                });
            }
            const payload = {
                title,
                startsAt,
                endsAt,
                location: form.location.trim() || undefined,
                description: form.description.trim() || undefined,
            };
            if (isEditing && event) {
                return agendaEventService.update(event.id, payload);
            }
            return agendaEventService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: agendaKeys.all});
            toast.success(isEditing ? "Evento atualizado" : "Evento criado");
            onClose();
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {toast: false, fallbackMessage: "Não foi possível salvar o evento."});
            setError(err instanceof AppException ? err.displayMessage : "Não foi possível salvar o evento.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!event?.id) return;
            await agendaEventService.delete(event.id);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: agendaKeys.all});
            toast.success("Evento excluído");
            onClose();
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {toast: false, fallbackMessage: "Não foi possível excluir o evento."});
            setError(err instanceof AppException ? err.displayMessage : "Não foi possível excluir o evento.");
        },
    });

    const busy = saveMutation.isPending || deleteMutation.isPending;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Editar evento" : "Novo evento"}
            icon={<Calendar className="size-4" strokeWidth={2} />}
            size="lg"
            closeDisabled={busy}
            footer={
                <div className="flex items-center justify-between gap-2">
                    <div>
                        {isEditing ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-error"
                                disabled={busy}
                                onClick={() => deleteMutation.mutate()}
                                loading={deleteMutation.isPending}
                            >
                                Excluir
                            </Button>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            leftIcon={<Check className="size-4" strokeWidth={2} />}
                            onClick={() => {
                                setError(null);
                                saveMutation.mutate();
                            }}
                            loading={saveMutation.isPending}
                            disabled={busy}
                        >
                            Salvar
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="grid gap-3.5">
                <InputString
                    label="Título"
                    value={form.title}
                    onValueChange={(value) => setForm((prev) => ({...prev, title: value}))}
                    required
                    placeholder="Adicionar título"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                    <InputDatetime
                        label="Início"
                        value={form.startsAt}
                        onValueChange={(value) => setForm((prev) => ({...prev, startsAt: value}))}
                        required
                    />
                    <InputDatetime
                        label="Término"
                        value={form.endsAt}
                        onValueChange={(value) => setForm((prev) => ({...prev, endsAt: value}))}
                        required
                    />
                </div>
                <InputString
                    label="Local"
                    value={form.location}
                    onValueChange={(value) => setForm((prev) => ({...prev, location: value}))}
                    placeholder="Sala de reuniões ou link da reunião"
                    leftIcon={<MapPin className="size-4" strokeWidth={2} />}
                />
                <InputMarkdown
                    key={event?.id ?? "new"}
                    label="Descrição"
                    hint="Opcional"
                    value={form.description}
                    onValueChange={(value) => setForm((prev) => ({...prev, description: value}))}
                    placeholder="Adicionar uma descrição"
                    rows={6}
                />
                {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
            </div>
        </Modal>
    );
}
