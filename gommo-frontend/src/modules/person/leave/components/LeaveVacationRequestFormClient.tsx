"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import type {LeaveRequestCreateDto} from "@/modules/person/leave/dto/leave-request.dto";
import {LEAVE_CLIENT_MESSAGES} from "@/modules/person/leave/exceptions/leave-request.messages";
import {emptyLeaveRequestForm} from "@/modules/person/leave/lib/leave-request.mapper";
import {leaverequestKeys} from "@/modules/person/leave/leave.query";
import {leaverequestService} from "@/modules/person/leave/services/leave-request.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {Button} from "@/shared/components/ui/Button";
import {InputDate} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";

export function LeaveVacationRequestFormClient() {
    const {goToList, isEditing} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<LeaveRequestCreateDto>({
        ...emptyLeaveRequestForm(),
        leaveType: "VACATION",
        approved: false,
    });
    const [error, setError] = useState<string | null>(null);

    const saveMutation = useMutation({
        mutationFn: (dto: LeaveRequestCreateDto) => leaverequestService.create(dto),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: leaverequestKeys.all});
            toast.success("Solicitação de férias enviada");
            setForm({...emptyLeaveRequestForm(), leaveType: "VACATION", approved: false});
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_SAVE_FAILED});
            setError(ex.displayMessage);
        },
    });

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing) {
        return (
            <div className="p-5">
                <p className="text-sm text-base-content/70">
                    No RH você pode apenas enviar novas solicitações. Consulte o histórico na listagem.
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar ao histórico
                </Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        Enviar solicitação
                    </Button>
                </>
            }
        >
            <div className="grid gap-3 p-4 sm:grid-cols-2">
                <p className="text-sm text-base-content/60 sm:col-span-2">
                    Envie uma solicitação de férias para análise do Departamento Pessoal.
                </p>
                <div className="sm:col-span-2">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => setForm((prev) => ({...prev, collaboratorId: v}))}
                        required
                    />
                </div>
                <InputDate
                    label="Data de início"
                    value={form.startDate ?? ""}
                    onValueChange={(v) => setForm((prev) => ({...prev, startDate: v}))}
                    required
                />
                <InputDate
                    label="Data de fim"
                    value={form.endDate ?? ""}
                    onValueChange={(v) => setForm((prev) => ({...prev, endDate: v}))}
                    required
                />
                {error ? <p className="text-sm font-medium text-error sm:col-span-2">{error}</p> : null}
            </div>
        </CrudFormShell>
    );
}
