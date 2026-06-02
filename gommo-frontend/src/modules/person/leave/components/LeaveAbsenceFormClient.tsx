"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import type {LeaveRequestCreateDto} from "@/modules/person/leave/dto/leave-request.dto";
import {LEAVE_CLIENT_MESSAGES} from "@/modules/person/leave/exceptions/leave-request.messages";
import {emptyLeaveRequestForm, leaverequestToFormDto} from "@/modules/person/leave/lib/leave-request.mapper";
import {leaverequestKeys} from "@/modules/person/leave/leave.query";
import {leaveAbsenceFormSchema} from "@/modules/person/leave/schemas/leave-absence.schema";
import {leaverequestService} from "@/modules/person/leave/services/leave-request.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {EntityCodeField} from "@/shared/components/crud/EntityCodeField";
import {Button} from "@/shared/components/ui/Button";
import {InputDate, InputSelect, InputString} from "@/shared/components/ui/input/index";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";
import {ExceptionCapture} from "@/shared/exceptions";
import {mapZodFieldErrors} from "@/shared/lib/zod-field-errors";

const ABSENCE_TYPE_ITEMS: SelectItem[] = [
    {value: "MEDICAL", label: "Afastamento médico"},
    {value: "MATERNITY", label: "Maternidade"},
    {value: "PATERNITY", label: "Paternidade"},
    {value: "UNPAID", label: "Não remunerado"},
    {value: "OTHER", label: "Outro"},
];

const APPROVAL_ITEMS: SelectItem[] = [
    {value: "true", label: "Aprovado"},
    {value: "false", label: "Pendente"},
];

type LeaveFormField = keyof LeaveRequestCreateDto | "notes";

export function LeaveAbsenceFormClient() {
    const {editingId, isEditing, goToList, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<LeaveRequestCreateDto & { notes?: string }>(emptyLeaveRequestForm);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeaveFormField, string>>>({});

    const detailQuery = useQuery({
        queryKey: leaverequestKeys.detail(editingId ?? ""),
        queryFn: () => leaverequestService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm({...emptyLeaveRequestForm(), leaveType: "MEDICAL"});
            setError(null);
            setFieldErrors({});
            return;
        }
        if (detailQuery.data) {
            setForm(leaverequestToFormDto(detailQuery.data));
            setError(null);
            setFieldErrors({});
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: LeaveRequestCreateDto) => {
            if (isEditing && editingId) return leaverequestService.update(editingId, dto);
            return leaverequestService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: leaverequestKeys.all});
            if (editingId) await queryClient.invalidateQueries({queryKey: leaverequestKeys.detail(editingId)});
            toast.success(isEditing ? "Afastamento salvo" : "Afastamento cadastrado");
            setForm({...emptyLeaveRequestForm(), leaveType: "MEDICAL"});
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_SAVE_FAILED});
            setError(ex.displayMessage);
        },
    });

    const update = <K extends LeaveFormField>(field: K, value: (LeaveRequestCreateDto & { notes?: string })[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = {...prev};
            delete next[field];
            return next;
        });
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const parsed = leaveAbsenceFormSchema.safeParse(form);
        if (!parsed.success) {
            setFieldErrors(mapZodFieldErrors<LeaveFormField>(parsed.error));
            setError("Verifique os campos destacados.");
            return;
        }
        setFieldErrors({});
        saveMutation.mutate(parsed.data);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full"/>
                ))}
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
                    {isEditing ? (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    ) : null}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <div className="grid gap-3 p-4 sm:grid-cols-2">
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined}/>
                <div className="sm:col-span-2">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                        error={fieldErrors.collaboratorId}
                    />
                </div>
                <InputSelect
                    label="Tipo de afastamento"
                    items={ABSENCE_TYPE_ITEMS}
                    value={form.leaveType ?? ""}
                    onValueChange={(v) => update("leaveType", (v || undefined) as LeaveRequestCreateDto["leaveType"])}
                    placeholder="Selecione"
                    required
                    error={fieldErrors.leaveType}
                />
                <InputSelect
                    label="Situação"
                    items={APPROVAL_ITEMS}
                    value={form.approved === true ? "true" : form.approved === false ? "false" : ""}
                    onValueChange={(v) => update("approved", v === "true")}
                    placeholder="Selecione"
                    clearable
                />
                <InputDate
                    label="Data de início"
                    value={form.startDate ?? ""}
                    onValueChange={(v) => update("startDate", v)}
                    required
                    error={fieldErrors.startDate}
                />
                <InputDate
                    label="Data de fim"
                    value={form.endDate ?? ""}
                    onValueChange={(v) => update("endDate", v)}
                    required
                    error={fieldErrors.endDate}
                />
                <div className="sm:col-span-2">
                    <InputString
                        label="Observações"
                        value={form.notes ?? ""}
                        onValueChange={(v) => update("notes", v)}
                    />
                </div>
                {error ? <p className="text-sm font-medium text-error sm:col-span-2">{error}</p> : null}
            </div>
        </CrudFormShell>
    );
}
