"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {X} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
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
import {InputDatetime, InputString} from "@/shared/components/ui/input/index";
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const queryClient = useQueryClient();
    const [mounted, setMounted] = useState(false);
    const [form, setForm] = useState<FormState>(() => emptyForm());
    const [error, setError] = useState<string | null>(null);
    const isEditing = Boolean(event?.id);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            setForm(event ? fromEvent(event) : emptyForm(initialSlotStart));
            setError(null);
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
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

    if (!mounted) return null;

    const busy = saveMutation.isPending || deleteMutation.isPending;

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-lg p-0">
                <div className="flex items-center justify-between border-b border-base-content/10 px-4 py-3">
                    <h3 className="text-base font-semibold">{isEditing ? "Editar evento" : "Novo evento"}</h3>
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/50"
                        onClick={onClose}
                        disabled={busy}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>
                <div className="grid gap-3 px-4 py-4">
                    <InputString
                        label="Título"
                        value={form.title}
                        onValueChange={(value) => setForm((prev) => ({...prev, title: value}))}
                        required
                        placeholder="Adicionar título"
                    />
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
                    <InputString
                        label="Local"
                        value={form.location}
                        onValueChange={(value) => setForm((prev) => ({...prev, location: value}))}
                        placeholder="Adicionar uma sala ou local"
                    />
                    <label className="gommo-field grid gap-1.5">
                        <span className="text-xs font-medium text-base-content/70">Descrição</span>
                        <textarea
                            className="min-h-24 w-full resize-y rounded-lg border border-base-content/15 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary/50"
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({...prev, description: e.target.value}))}
                            placeholder="Adicionar notas"
                        />
                    </label>
                    {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-base-content/10 px-4 py-3">
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
                        <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
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
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    fechar
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
