"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState, type FormEvent} from "react";
import {toast} from "sonner";
import {CONTRACT_CLIENT_MESSAGES} from "@/modules/person/contract/exceptions/employment-contract.messages";
import type {EmploymentContractCreateDto} from "@/modules/person/contract/dto/employment-contract.dto";
import {
    emptyEmploymentContractForm,
    employmentcontractToFormDto
} from "@/modules/person/contract/lib/employment-contract.mapper";
import {employmentcontractKeys} from "@/modules/person/contract/contract.query";
import {employmentcontractService} from "@/modules/person/contract/services/employment-contract.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {EntityCodeField} from "@/shared/components/crud/EntityCodeField";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";
import {ExceptionCapture} from "@/shared/exceptions";
import {Button} from "@/shared/components/ui/Button";
import {InputDate, InputCurrency, InputSelect} from "@/shared/components/ui/input/index";

const CONTRACT_TYPE_ITEMS = [
    {value: "CLT", label: "CLT"},
    {value: "PJ", label: "Prestador de Serviço"},
    {value: "INTERMITTENT", label: "Intermitente"},
    {value: "APPRENTICE", label: "Aprendiz"},
    {value: "INTERN", label: "Estágio"},
];

export function EmploymentContractFormClient() {
    const {editingId, isEditing, goToList, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<EmploymentContractCreateDto>(emptyEmploymentContractForm);
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: employmentcontractKeys.detail(editingId ?? ""),
        queryFn: () => employmentcontractService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyEmploymentContractForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(employmentcontractToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: EmploymentContractCreateDto) => {
            const payload = {
                ...dto,
                baseSalary: dto.baseSalary ? Number(dto.baseSalary) : undefined,
            };
            if (isEditing && editingId) return employmentcontractService.update(editingId, payload as EmploymentContractCreateDto);
            return employmentcontractService.create(payload as EmploymentContractCreateDto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: employmentcontractKeys.all});
            if (editingId) await queryClient.invalidateQueries({queryKey: employmentcontractKeys.detail(editingId)});
            toast.success(isEditing ? "Contrato atualizado" : "Contrato cadastrado");
            setForm(emptyEmploymentContractForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: CONTRACT_CLIENT_MESSAGES.CONTRACT_SAVE_FAILED});
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof EmploymentContractCreateDto>(field: K, value: EmploymentContractCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return <div className="grid gap-2 p-5">{Array.from({length: 4}).map((_, i) => <div key={i}
                                                                                           className="skeleton-shimmer h-10 w-full"/>)}</div>;
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, CONTRACT_CLIENT_MESSAGES.CONTRACT_LOAD_FAILED)}</p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>Voltar</Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>Cancelar</Button>
                    {isEditing && <Button type="button" variant="outline" onClick={startCreate}>Novo</Button>}
                    <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button>
                </>
            }
        >
            <div className="grid gap-3 p-4 sm:grid-cols-2">
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined}/>
                <div className="sm:col-span-2">
                    <CollaboratorPickerField value={form.collaboratorId ?? ""}
                                             onValueChange={(v) => update("collaboratorId", v)} required/>
                </div>
                <InputSelect
                    label="Tipo de contrato"
                    items={CONTRACT_TYPE_ITEMS}
                    value={form.contractType ?? ""}
                    onValueChange={(v) => update("contractType", (v || undefined) as EmploymentContractCreateDto["contractType"])}
                    placeholder="Selecione"
                    clearable
                />
                <InputCurrency label="Salário base" value={form.baseSalary ?? ""}
                               onValueChange={(v) => update("baseSalary", v)} emitAsDecimal/>
                <InputDate label="Data de início" value={form.startDate ?? ""}
                           onValueChange={(v) => update("startDate", v)} required/>
                <InputDate label="Data de fim" value={form.endDate ?? ""} onValueChange={(v) => update("endDate", v)}/>
                {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
            </div>
        </CrudFormShell>
    );
}
