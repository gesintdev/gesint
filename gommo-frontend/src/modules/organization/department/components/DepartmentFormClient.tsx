"use client";
import { useEffect, useId, useState, type SubmitEvent } from "react";
import { emptyDepartmentForm, departmentToFormDto } from "@/modules/organization/department/lib/department.mapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import clsx from "clsx";
import { departmentKeys } from "@/modules/organization/department/department.query";
import type { DepartmentCreateDto } from "@/modules/organization/department/dto/department.dto";
import { DEPARTMENT_CLIENT_MESSAGES } from "@/modules/organization/department/exceptions/department.messages";
import { departmentService } from "@/modules/organization/department/services/department.service";
import { CollaboratorMultiPickerField } from "@/shared/components/crud/CollaboratorMultiPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { InputCurrency, InputPhone, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Departamento" }];

type DescriptionTextareaProps = {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    wrapperClassName?: string;
};

function DescriptionTextarea({ label, value, onValueChange, wrapperClassName }: DescriptionTextareaProps) {
    const autoId = useId();
    const id = `department-description-${autoId}`;

    return (
        <InputFieldChrome label={label} id={id} wrapperClassName={wrapperClassName}>
            <textarea
                id={id}
                rows={4}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                className={clsx("gommo-control w-full resize-y px-3 py-2 text-sm", fieldClass())}
            />
        </InputFieldChrome>
    );
}

export function DepartmentFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<DepartmentCreateDto>(emptyDepartmentForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: departmentKeys.detail(editingId ?? ""),
        queryFn: () => departmentService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyDepartmentForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(departmentToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: DepartmentCreateDto) => {
            if (isEditing && editingId) return departmentService.update(editingId, dto);
            return departmentService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: departmentKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: departmentKeys.detail(editingId) });
            toast.success(isEditing ? "Departamento atualizado(a)" : "Departamento cadastrado(a)");
            setForm(emptyDepartmentForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: DEPARTMENT_CLIENT_MESSAGES.DEPARTMENT_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof DepartmentCreateDto>(field: K, value: DepartmentCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
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
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        DEPARTMENT_CLIENT_MESSAGES.DEPARTMENT_LOAD_FAILED,
                    )}
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
            <FormSection id="cadastro" title="Departamento">
                <InputString label="Nome" value={form.name ?? ""} onValueChange={(v) => update("name", v)} required />
                <InputString
                    label="Centro de custo"
                    value={form.costCenter ?? ""}
                    onValueChange={(v) => update("costCenter", v)}
                />
                <DescriptionTextarea
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={(v) => update("description", v)}
                    wrapperClassName="sm:col-span-2"
                />
                <CollaboratorMultiPickerField
                    selectedIds={form.responsibleCollaboratorIds ?? []}
                    onChange={(ids) => update("responsibleCollaboratorIds", ids)}
                    wrapperClassName="sm:col-span-2"
                />
                <InputCurrency
                    label="Orçamento mensal"
                    value={form.monthlyBudget ?? ""}
                    onValueChange={(v) => update("monthlyBudget", v)}
                    emitAsDecimal
                />
                <InputString
                    label="Localização"
                    value={form.location ?? ""}
                    onValueChange={(v) => update("location", v)}
                />
                <InputPhone label="Telefone" value={form.phone ?? ""} onValueChange={(v) => update("phone", v)} />
                <InputPhone label="Fax" value={form.fax ?? ""} onValueChange={(v) => update("fax", v)} />
                <InputString
                    label="Ramal"
                    value={form.phoneExtension ?? ""}
                    onValueChange={(v) => update("phoneExtension", v)}
                />
                <InputString
                    label="Email"
                    value={form.email ?? ""}
                    onValueChange={(v) => update("email", v)}
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
