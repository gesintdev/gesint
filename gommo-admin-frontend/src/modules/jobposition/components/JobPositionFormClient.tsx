"use client";
import { useEffect, useState, type SubmitEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { JobPositionCreateDto } from "@/modules/jobposition/dto/jobposition.dto";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/jobposition/exceptions/jobposition.messages";
import { jobpositionKeys } from "@/modules/jobposition/jobposition.query";
import { emptyJobPositionForm, jobpositionToFormDto } from "@/modules/jobposition/lib/jobposition.mapper";
import { jobpositionService } from "@/modules/jobposition/services/jobposition.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

export function JobPositionFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<JobPositionCreateDto>(emptyJobPositionForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: jobpositionKeys.detail(editingId ?? ""),
        queryFn: () => jobpositionService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyJobPositionForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(jobpositionToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: JobPositionCreateDto) => {
            if (isEditing && editingId) return jobpositionService.update(editingId, dto);
            return jobpositionService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobpositionKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: jobpositionKeys.detail(editingId) });
            toast.success(isEditing ? "Cargo atualizado(a)" : "Cargo cadastrado(a)");
            setForm(emptyJobPositionForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof JobPositionCreateDto>(field: K, value: JobPositionCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="gommo-crud-panel-inset grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="gommo-crud-panel-inset">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        JOBPOSITION_CLIENT_MESSAGES.JOBPOSITION_LOAD_FAILED,
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
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <p className="text-sm font-semibold text-base-content">
                        {isEditing ? "Editar cargo" : "Novo(a) cargo"}
                    </p>
                </div>
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
                <InputString
                    label="Title"
                    value={form.title ?? ""}
                    onValueChange={(v) => update("title", v)}
                    required
                />
                <InputString label="Cbo Code" value={form.cboCode ?? ""} onValueChange={(v) => update("cboCode", v)} />
                <InputString
                    label="Department  I D"
                    value={form.departmentId ?? ""}
                    onValueChange={(v) => update("departmentId", v)}
                />
                {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
            </div>
        </CrudFormShell>
    );
}
