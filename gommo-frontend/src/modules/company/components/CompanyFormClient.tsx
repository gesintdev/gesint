"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {COMPANY_CLIENT_MESSAGES} from "@/modules/company/exceptions/company.messages";
import type {CompanyCreateDto} from "@/modules/company/dto/company.dto";
import {emptyCompanyForm, companyToFormDto} from "@/modules/company/lib/company.mapper";
import {companyKeys} from "@/modules/company/company.query";
import {companyService} from "@/modules/company/services/company.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudFormShell} from "@/shared/components/crud/CrudFormShell";
import {useSyncWorkspaceTabTitle} from "@/shared/workspace/useSyncWorkspaceTabTitle";
import {ExceptionCapture} from "@/shared/exceptions";
import {Button} from "@/shared/components/ui/Button";
import {FormSection} from "@/shared/components/ui/FormSection";
import {type FormStepNavItem} from "@/shared/components/ui/FormStepper";
import {InputString, InputCNPJ} from "@/shared/components/ui/input/index";

const FORM_STEPS: FormStepNavItem[] = [{id: "cadastro", label: "Empresa"}];

export function CompanyFormClient() {
    const {editingId, isEditing, goToList, startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<CompanyCreateDto>(emptyCompanyForm);
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: companyKeys.detail(editingId ?? ""),
        queryFn: () => companyService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyCompanyForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(companyToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: CompanyCreateDto) => {
            const payload = {...dto, cnpj: dto.cnpj.replace(/\D/g, "")};
            if (isEditing && editingId) return companyService.update(editingId, payload);
            return companyService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: companyKeys.all});
            if (editingId) await queryClient.invalidateQueries({queryKey: companyKeys.detail(editingId)});
            toast.success(isEditing ? "Empresa atualizado(a)" : "Empresa cadastrado(a)");
            setForm(emptyCompanyForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {fallbackMessage: COMPANY_CLIENT_MESSAGES.COMPANY_SAVE_FAILED});
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof CompanyCreateDto>(field: K, value: CompanyCreateDto[K]) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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
                <p className="text-sm font-medium text-error">{ExceptionCapture.displayMessage(detailQuery.error, COMPANY_CLIENT_MESSAGES.COMPANY_LOAD_FAILED)}</p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>Voltar</Button>
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
                    <Button type="button" variant="ghost" onClick={goToList}>Cancelar</Button>
                    {isEditing && <Button type="button" variant="outline" onClick={startCreate}>Novo</Button>}
                    <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Empresa">
                <InputString label="Legal Name" value={form.legalName ?? ""}
                             onValueChange={(v) => update("legalName", v)} required/>
                <InputString label="Trade Name" value={form.tradeName ?? ""}
                             onValueChange={(v) => update("tradeName", v)}/>
                <InputCNPJ label="Cnpj" value={form.cnpj} onValueChange={(v) => update("cnpj", v)} required/>
                <InputString label="Email" value={form.email ?? ""} onValueChange={(v) => update("email", v)}/>
                <InputString label="Phone" value={form.phone ?? ""} onValueChange={(v) => update("phone", v)}/>
                <InputString label="City" value={form.city ?? ""} onValueChange={(v) => update("city", v)}/>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
