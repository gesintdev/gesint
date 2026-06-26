"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import type { LeaveRequestCreateDto } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/rh/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { emptyLeaveRequestForm, leaverequestToFormDto } from "@/modules/rh/person/leave/lib/leave-request.mapper";
import { LEAVE_TYPE_ITEMS } from "@/modules/rh/person/leave/lib/leave-types";
import { leaveRequestFormSchema } from "@/modules/rh/person/leave/schemas/leave-request.schema";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate, InputSelect } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

const APPROVAL_ITEMS: SelectItem[] = [
    { value: "true", label: "Aprovado" },
    { value: "false", label: "Pendente" },
];
const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Afastamento" }];

type LeaveFormField = keyof LeaveRequestCreateDto;

export function LeaveRequestFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<LeaveRequestCreateDto>(emptyLeaveRequestForm);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<LeaveFormField, string>>>({});
    const detailQuery = useQuery({
        queryKey: leaverequestKeys.detail(editingId ?? ""),
        queryFn: () => leaverequestService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyLeaveRequestForm());
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
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: leaverequestKeys.detail(editingId) });
            toast.success(isEditing ? "Registro salvo" : "Afastamento cadastrado");
            setForm(emptyLeaveRequestForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends LeaveFormField>(field: K, value: LeaveRequestCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const parsed = leaveRequestFormSchema.safeParse(form);
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
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(detailQuery.error, LEAVE_CLIENT_MESSAGES.LEAVE_LOAD_FAILED)}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    {isEditing && (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    )}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Afastamento">
                {isEditing && detailQuery.data?.approved !== true ? (
                    <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-base-content/75 sm:col-span-12">
                        Solicitação de férias vinda do RH. Revise os dados, marque como aprovado e salve para concluir o
                        cadastro.
                    </p>
                ) : null}
                <div className="sm:col-span-12">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                        error={fieldErrors.collaboratorId}
                    />
                </div>
                <InputSelect
                    label="Tipo de afastamento"
                    items={LEAVE_TYPE_ITEMS}
                    value={form.leaveType ?? ""}
                    onValueChange={(v) => update("leaveType", (v || undefined) as LeaveRequestCreateDto["leaveType"])}
                    placeholder="Selecione"
                    required
                    error={fieldErrors.leaveType}
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Situação"
                    items={APPROVAL_ITEMS}
                    value={form.approved === true ? "true" : form.approved === false ? "false" : ""}
                    onValueChange={(v) => update("approved", v === "true")}
                    placeholder="Selecione"
                    clearable
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Data de início"
                    value={form.startDate ?? ""}
                    onValueChange={(v) => update("startDate", v)}
                    required
                    error={fieldErrors.startDate}
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Data de fim"
                    value={form.endDate ?? ""}
                    onValueChange={(v) => update("endDate", v)}
                    required
                    error={fieldErrors.endDate}
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
