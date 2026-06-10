"use client";
import { useEffect, useState, type SubmitEvent } from "react";
import {
    emptyPerformanceReviewForm,
    performanceReviewToFormDto,
} from "@/modules/person/performance/lib/performance-review.mapper";
import { InputString, InputDate, InputSelect } from "@/shared/components/ui/input/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PerformanceReviewCreateDto } from "@/modules/person/performance/dto/performance-review.dto";
import { PERFORMANCE_CLIENT_MESSAGES } from "@/modules/person/performance/exceptions/performance-review.messages";
import { performanceReviewKeys } from "@/modules/person/performance/performance.query";
import { performanceReviewService } from "@/modules/person/performance/services/performance-review.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Avaliação" }];
const RATING_ITEMS = [
    { value: "NEEDS_IMPROVEMENT", label: "Precisa melhorar" },
    { value: "MEETS", label: "Atende expectativas" },
    { value: "EXCEEDS", label: "Supera expectativas" },
    { value: "OUTSTANDING", label: "Excepcional" },
];

export function PerformanceReviewFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<PerformanceReviewCreateDto>(emptyPerformanceReviewForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: performanceReviewKeys.detail(editingId ?? ""),
        queryFn: () => performanceReviewService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyPerformanceReviewForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(performanceReviewToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: PerformanceReviewCreateDto) => {
            if (isEditing && editingId) return performanceReviewService.update(editingId, dto);
            return performanceReviewService.create(dto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: performanceReviewKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: performanceReviewKeys.detail(editingId) });
            toast.success(isEditing ? "Avaliação atualizada" : "Avaliação cadastrada");
            setForm(emptyPerformanceReviewForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: PERFORMANCE_CLIENT_MESSAGES.PERFORMANCE_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof PerformanceReviewCreateDto>(field: K, value: PerformanceReviewCreateDto[K]) => {
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
                        PERFORMANCE_CLIENT_MESSAGES.PERFORMANCE_LOAD_FAILED,
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
            <FormSection id="cadastro" title="Avaliação">
                <div className="sm:col-span-2">
                    <CollaboratorPickerField
                        value={form.collaboratorId}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                    />
                </div>
                <InputDate
                    label="Período — início"
                    value={form.periodStart}
                    onValueChange={(v) => update("periodStart", v)}
                    required
                />
                <InputDate
                    label="Período — fim"
                    value={form.periodEnd}
                    onValueChange={(v) => update("periodEnd", v)}
                    required
                />
                <InputSelect
                    label="Classificação"
                    items={RATING_ITEMS}
                    value={form.rating ?? ""}
                    onValueChange={(v) => update("rating", (v || undefined) as PerformanceReviewCreateDto["rating"])}
                    placeholder="Selecione"
                    clearable
                />
                <InputString
                    label="Avaliador"
                    value={form.reviewerName ?? ""}
                    onValueChange={(v) => update("reviewerName", v)}
                />
                <InputString
                    label="Metas e objetivos"
                    value={form.goalsSummary ?? ""}
                    onValueChange={(v) => update("goalsSummary", v)}
                    wrapperClassName="sm:col-span-2"
                />
                <InputString
                    label="Feedback"
                    value={form.feedback ?? ""}
                    onValueChange={(v) => update("feedback", v)}
                    wrapperClassName="sm:col-span-2"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
