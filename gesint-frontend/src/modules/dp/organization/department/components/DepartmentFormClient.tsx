"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {type SubmitEvent, useEffect, useId, useState} from "react";
import {toast} from "sonner";

import {departmentKeys} from "@/modules/dp/organization/department/department.query";
import type {DepartmentCreateDto} from "@/modules/dp/organization/department/dto/department.dto";
import {DEPARTMENT_CLIENT_MESSAGES} from "@/modules/dp/organization/department/exceptions/department.messages";
import {departmentToFormDto, emptyDepartmentForm} from "@/modules/dp/organization/department/lib/department.mapper";
import {departmentService} from "@/modules/dp/organization/department/services/department.service";
import {CollaboratorMultiPickerField} from "@/shared/components/crud/CollaboratorMultiPickerField";
import {BranchRecordScopeField} from "@/shared/components/crud/BranchRecordScopeField";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import { CrudFormFooterActions } from "@/shared/components/crud/CrudFormFooterActions";
import {useTrackedCrudFormDirty} from "@/shared/components/crud/useTrackedCrudFormDirty";
import {Button} from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputCurrency, InputPhone, InputString} from "@/shared/components/ui/input/index";
import {fieldClass, InputFieldChrome} from "@/shared/components/ui/input/InputFieldChrome";
import {ExceptionCapture} from "@/shared/exceptions";
import {useBranchScopedDetailQuery} from "@/shared/hooks/useBranchScopedDetailQuery";
import {useActiveBranch} from "@/shared/context/ActiveBranchContext";

const FORM_STEPS: FormStepNavItem[] = [{id: "cadastro", label: "Departamento"}];

type DescriptionTextareaProps = {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    wrapperClassName?: string;
};

function DescriptionTextarea({label, value, onValueChange, wrapperClassName}: DescriptionTextareaProps) {
    const autoId = useId();
    const id = `department-description-${autoId}`;

    return (
        <InputFieldChrome label={label} id={id} wrapperClassName={wrapperClassName}>
            <textarea
                id={id}
                rows={4}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                className={clsx("gesint-control w-full resize-y px-3 py-2 text-sm", fieldClass())}
            />
        </InputFieldChrome>
    );
}

export function DepartmentFormClient() {
    const {editingId, isEditing, goToList, showSavedRecord} = useCrudScreen();
    const {activeBranchId} = useActiveBranch();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<DepartmentCreateDto>(() => emptyDepartmentForm(activeBranchId));
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useBranchScopedDetailQuery(
        departmentKeys.detail(editingId ?? ""),
        () => departmentService.getById(editingId!),
        {enabled: isEditing && Boolean(editingId)},
    );

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyDepartmentForm(activeBranchId));
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(departmentToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data, activeBranchId]);
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: departmentToFormDto,
        getEmptyForm: () => emptyDepartmentForm(activeBranchId),
    });


    const saveMutation = useMutation({
        mutationFn: async (dto: DepartmentCreateDto) => {
            if (isEditing && editingId) return departmentService.update(editingId, dto);
            return departmentService.create(dto);
        },
        onSuccess: async (saved) => {
            const savedEditingId = editingId;
            void showSavedRecord(saved.id, saved);
            toast.success(isEditing ? "Departamento atualizado(a)" : "Departamento cadastrado(a)");
            setForm(emptyDepartmentForm(activeBranchId));
            await queryClient.invalidateQueries({queryKey: departmentKeys.all});
            if (savedEditingId) {
                queryClient.removeQueries({queryKey: departmentKeys.detail(savedEditingId)});
            }
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: DEPARTMENT_CLIENT_MESSAGES.DEPARTMENT_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof DepartmentCreateDto>(field: K, value: DepartmentCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <SkeletonStack count={4} padded />
        );
    }

    if (isEditing && detailQuery.isError && !saveMutation.isPending) {
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
            footer={<CrudFormFooterActions isSubmitting={saveMutation.isPending} />}
        >
            <FormSection id="cadastro" title="Departamento">
                <BranchRecordScopeField
                    companyId={form.companyId}
                    onChange={(companyId) => update("companyId", companyId)}
                />
                <InputString
                    label="Nome"
                    value={form.name ?? ""}
                    onValueChange={(v) => update("name", v)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Centro de custo"
                    value={form.costCenter ?? ""}
                    onValueChange={(v) => update("costCenter", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <DescriptionTextarea
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={(v) => update("description", v)}
                    wrapperClassName="sm:col-span-12"
                />
                <CollaboratorMultiPickerField
                    selectedIds={form.responsibleCollaboratorIds ?? []}
                    onChange={(ids) => update("responsibleCollaboratorIds", ids)}
                    wrapperClassName="sm:col-span-12"
                />
                <InputCurrency
                    label="Orçamento mensal"
                    value={form.monthlyBudget != null ? String(form.monthlyBudget) : ""}
                    onValueChange={(v) => update("monthlyBudget", v)}
                    emitAsDecimal
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Localização"
                    value={form.location ?? ""}
                    onValueChange={(v) => update("location", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputPhone
                    label="Telefone"
                    value={form.phone ?? ""}
                    onValueChange={(v) => update("phone", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputPhone
                    label="Fax"
                    value={form.fax ?? ""}
                    onValueChange={(v) => update("fax", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Ramal"
                    value={form.phoneExtension ?? ""}
                    onValueChange={(v) => update("phoneExtension", v)}
                    wrapperClassName="sm:col-span-6"
                />
                <InputString
                    label="Email"
                    value={form.email ?? ""}
                    onValueChange={(v) => update("email", v)}
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
