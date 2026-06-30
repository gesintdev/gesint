"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { type DevelopmentPlanDomainConfig } from "@/modules/cfg/settings/developmentplan/config/development-plan-domain.config";
import { DevelopmentPlanDomainRecord, DevelopmentPlanDomainService, type DomainFieldConfig } from "@/modules/cfg/settings/developmentplan/services/development-plan-domain.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputNumber, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

export function DevelopmentPlanDomainFormClient({ config }: { config: DevelopmentPlanDomainConfig }) {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const service = useMemo(() => new DevelopmentPlanDomainService(config.endpoint), [config.endpoint]);
    const queryKey = ["development-plan-domain", config.id] as const;
    const detailKey = ["development-plan-domain", config.id, editingId ?? ""] as const;
    const steps: FormStepNavItem[] = [{ id: "cadastro", label: config.title }];
    const [form, setForm] = useState<Record<string, unknown>>(() => emptyForm(config.fields));
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: detailKey,
        queryFn: () => service.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyForm(config.fields));
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(toForm(detailQuery.data, config.fields));
            setError(null);
        }
    }, [isEditing, detailQuery.data, config.fields]);

    const saveMutation = useMutation({
        mutationFn: async (dto: Record<string, unknown>) => {
            if (isEditing && editingId) return service.update(editingId, dto);
            return service.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey });
            toast.success(isEditing ? "Registro atualizado" : "Registro cadastrado");
            setForm(emptyForm(config.fields));
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível salvar o registro." });
            setError(ex.displayMessage);
        },
    });

    const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));
    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{ steps, entityCode: isEditing ? detailQuery.data?.code : undefined, resetKey: editingId ?? "new" }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>Cancelar</Button>
                    {isEditing ? <Button type="button" variant="outline" onClick={startCreate}>Novo</Button> : null}
                    <Button type="submit" loading={saveMutation.isPending}>{isEditing ? "Salvar" : "Cadastrar"}</Button>
                </>
            }
        >
            <FormSection id="cadastro" title={config.title}>
                {config.fields.map((field) => renderField(field, form[field.name], update))}
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}

function emptyForm(fields: DomainFieldConfig[]) {
    return Object.fromEntries(fields.map((field) => [field.name, field.type === "checkbox" ? false : ""]));
}

function toForm(record: DevelopmentPlanDomainRecord, fields: DomainFieldConfig[]) {
    const source = record as unknown as Record<string, unknown>;
    return Object.fromEntries(fields.map((field) => [field.name, source[field.name] ?? (field.type === "checkbox" ? false : "")]));
}

function renderField(field: DomainFieldConfig, value: unknown, update: (_field: string, _value: unknown) => void) {
    const wrapperClassName = field.type === "checkbox" ? "sm:col-span-4" : "sm:col-span-6";
    if (field.type === "number") {
        return <InputNumber key={field.name} label={field.label} value={typeof value === "number" ? value : null} onValueChange={(v) => update(field.name, v ?? undefined)} integer required={field.required} wrapperClassName={wrapperClassName} />;
    }
    if (field.type === "select") {
        return <InputSelect key={field.name} label={field.label} items={field.options ?? []} value={String(value ?? "")} onValueChange={(v) => update(field.name, v || undefined)} required={field.required} placeholder="Selecione" wrapperClassName={wrapperClassName} />;
    }
    if (field.type === "checkbox") {
        return (
            <label key={field.name} className="flex items-center gap-2 pt-7 text-sm sm:col-span-4">
                <input type="checkbox" className="checkbox checkbox-sm" checked={Boolean(value)} onChange={(event) => update(field.name, event.target.checked)} />
                {field.label}
            </label>
        );
    }
    return <InputString key={field.name} label={field.label} value={String(value ?? "")} onValueChange={(v) => update(field.name, v)} required={field.required} wrapperClassName={field.name.toLowerCase().includes("description") ? "sm:col-span-12" : wrapperClassName} />;
}