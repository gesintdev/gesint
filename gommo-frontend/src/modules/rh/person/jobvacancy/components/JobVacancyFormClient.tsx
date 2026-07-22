"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { type FormEvent, useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { JobPositionPickerField } from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import type {
    JobBoardKey,
    JobVacancyCreateDto,
    JobVacancySeniority,
} from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { JOB_VACANCY_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancy/exceptions/job-vacancy.messages";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import {
    emptyJobVacancyForm,
    jobVacancyFormToPayload,
    jobVacancyToFormDto,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.mapper";
import {
    JOB_BOARD_OPTIONS,
    JOB_VACANCY_SENIORITY_ITEMS,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import {
    InputCurrency,
    InputDate,
    InputNumber,
    InputSelect,
} from "@/shared/components/ui/input/index";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Dados" },
    { id: "detalhes", label: "Detalhes" },
    { id: "publicacao", label: "Publicação" },
];

type TextAreaProps = {
    label: string;
    value?: string;
    onValueChange: (value: string) => void;
    wrapperClassName?: string;
    placeholder?: string;
    rows?: number;
};

function TextAreaField({ label, value, onValueChange, wrapperClassName, placeholder, rows = 4 }: TextAreaProps) {
    const autoId = useId();
    const id = `job-vacancy-${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}`;

    return (
        <InputFieldChrome label={label} id={id} wrapperClassName={wrapperClassName}>
            <textarea
                id={id}
                rows={rows}
                value={value ?? ""}
                placeholder={placeholder}
                onChange={(event) => onValueChange(event.target.value)}
                className={clsx("gommo-control w-full resize-y px-3 py-2 text-sm", fieldClass())}
            />
        </InputFieldChrome>
    );
}

export function JobVacancyFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<JobVacancyCreateDto>(emptyJobVacancyForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: jobVacancyKeys.detail(editingId ?? ""),
        queryFn: () => jobVacancyService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyJobVacancyForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(jobVacancyToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: JobVacancyCreateDto) => {
            const payload = jobVacancyFormToPayload(dto);
            if (isEditing && editingId) return jobVacancyService.update(editingId, payload);
            return jobVacancyService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobVacancyKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: jobVacancyKeys.detail(editingId) });
            toast.success(isEditing ? "Vaga atualizada" : "Vaga cadastrada");
            setForm(emptyJobVacancyForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_VACANCY_CLIENT_MESSAGES.JOB_VACANCY_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof JobVacancyCreateDto>(field: K, value: JobVacancyCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const toggleBoard = (board: JobBoardKey) => {
        setForm((prev) => {
            const current = prev.targetBoards ?? [];
            const next = current.includes(board)
                ? current.filter((item) => item !== board)
                : [...current, board];
            return { ...prev, targetBoards: next };
        });
    };
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.jobTitle.trim()) {
            setError("Informe o nome do cargo da vaga.");
            return;
        }
        if (!form.positionsCount || form.positionsCount < 1) {
            setError("A quantidade de posições deve ser maior que zero.");
            return;
        }
        saveMutation.mutate(form);
    };
    const pickerValue = form.jobPositionId?.trim() || form.jobTitle || "";

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
                        JOB_VACANCY_CLIENT_MESSAGES.JOB_VACANCY_LOAD_FAILED,
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
            <FormSection id="dados" title="Dados da vaga">
                <JobPositionPickerField
                    allowCustomTitle
                    label="Nome do cargo"
                    value={pickerValue}
                    onValueChange={(selection) => {
                        setForm((prev) => ({
                            ...prev,
                            jobPositionId: selection.jobPositionId,
                            jobTitle: selection.title,
                        }));
                    }}
                    required
                    wrapperClassName="sm:col-span-8"
                />
                <InputNumber
                    label="Posições"
                    value={form.positionsCount ?? null}
                    onValueChange={(v) => update("positionsCount", v ?? 1)}
                    integer
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputSelect
                    label="Senioridade"
                    items={JOB_VACANCY_SENIORITY_ITEMS}
                    value={form.seniorityLevel ?? ""}
                    onValueChange={(v) =>
                        update("seniorityLevel", (v || undefined) as JobVacancySeniority | undefined)
                    }
                    placeholder="Selecione"
                    clearable
                    wrapperClassName="sm:col-span-4"
                />
                <InputCurrency
                    label="Salário"
                    value={form.salary != null ? String(form.salary) : ""}
                    onValueChange={(v) => update("salary", v)}
                    emitAsDecimal
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Previsão de conclusão"
                    value={form.expectedCompletionDate ?? ""}
                    onValueChange={(v) => update("expectedCompletionDate", v)}
                    wrapperClassName="sm:col-span-4"
                />
            </FormSection>

            <FormSection id="detalhes" title="Detalhes">
                <TextAreaField
                    label="Descrição"
                    value={form.description}
                    onValueChange={(v) => update("description", v)}
                    wrapperClassName="sm:col-span-12"
                    placeholder="Resumo da vaga e contexto da contratação"
                />
                <TextAreaField
                    label="Atividades"
                    value={form.activities}
                    onValueChange={(v) => update("activities", v)}
                    wrapperClassName="sm:col-span-12"
                    placeholder="Principais atividades do dia a dia"
                />
                <TextAreaField
                    label="Atribuições"
                    value={form.assignments}
                    onValueChange={(v) => update("assignments", v)}
                    wrapperClassName="sm:col-span-12"
                    placeholder="Responsabilidades e entregas esperadas"
                />
            </FormSection>

            <FormSection id="publicacao" title="Publicação">
                <div className="sm:col-span-12">
                    <p className="mb-3 text-sm text-base-content/60">
                        Selecione os sites onde pretende divulgar a vaga. O envio automático será liberado depois;
                        por enquanto apenas a preferência é salva.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {JOB_BOARD_OPTIONS.map((board) => {
                            const checked = form.targetBoards?.includes(board.key) ?? false;
                            return (
                                <label
                                    key={board.key}
                                    className={clsx(
                                        "flex cursor-pointer flex-col gap-2 rounded-xl border px-4 py-3 transition-colors",
                                        checked
                                            ? "border-primary/40 bg-primary/5"
                                            : "border-base-300 bg-base-100 hover:border-base-content/20",
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm checkbox-primary"
                                                checked={checked}
                                                onChange={() => toggleBoard(board.key)}
                                            />
                                            <span className="text-sm font-semibold text-base-content">
                                                {board.label}
                                            </span>
                                        </div>
                                        <span className="shrink-0 rounded-md bg-base-200 px-2 py-0.5 text-[11px] font-medium text-base-content/55">
                                            Em breve
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-base-content/55">
                                        {board.description}
                                    </p>
                                    <p className="text-[11px] text-base-content/45">{board.accessNote}</p>
                                </label>
                            );
                        })}
                    </div>
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled
                            title="Publicação em sites será liberada em breve"
                        >
                            Publicar nos sites selecionados
                        </Button>
                    </div>
                </div>
            </FormSection>

            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
