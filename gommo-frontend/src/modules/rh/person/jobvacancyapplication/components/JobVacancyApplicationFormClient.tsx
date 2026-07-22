"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import type {
    JobVacancyApplicationCreateDto,
    JobVacancyApplicationStatus,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import { JOB_VACANCY_APPLICATION_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancyapplication/exceptions/job-vacancy-application.messages";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import {
    emptyJobVacancyApplicationForm,
    jobVacancyApplicationFormToPayload,
    jobVacancyApplicationToFormDto,
} from "@/modules/rh/person/jobvacancyapplication/lib/job-vacancy-application.mapper";
import { JOB_VACANCY_APPLICATION_STATUS_ITEMS } from "@/modules/rh/person/jobvacancyapplication/lib/job-vacancy-application.options";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputSelect, InputSelectAutocomplete } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "dados", label: "Dados" }];

export function JobVacancyApplicationFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<JobVacancyApplicationCreateDto>(emptyJobVacancyApplicationForm);
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: jobVacancyApplicationKeys.detail(editingId ?? ""),
        queryFn: () => jobVacancyApplicationService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const vacanciesQuery = useQuery({
        queryKey: jobVacancyKeys.all,
        queryFn: () => jobVacancyService.getAll(),
    });
    const candidatesQuery = useQuery({
        queryKey: candidateKeys.all,
        queryFn: () => candidateService.getAll(),
    });

    const vacancyItems = useMemo(
        () =>
            (vacanciesQuery.data ?? []).map((item) => ({
                value: item.id,
                label: item.jobTitle,
                description: item.code != null ? `#${item.code}` : undefined,
            })),
        [vacanciesQuery.data],
    );
    const candidateItems = useMemo(
        () =>
            (candidatesQuery.data ?? []).map((item) => ({
                value: item.id,
                label: item.fullName,
                description: item.cpf,
            })),
        [candidatesQuery.data],
    );

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyJobVacancyApplicationForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(jobVacancyApplicationToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: JobVacancyApplicationCreateDto) => {
            const payload = jobVacancyApplicationFormToPayload(dto);
            if (isEditing && editingId) return jobVacancyApplicationService.update(editingId, payload);
            return jobVacancyApplicationService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
            await queryClient.invalidateQueries({ queryKey: jobVacancyKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: jobVacancyApplicationKeys.detail(editingId),
                });
            }
            toast.success(isEditing ? "Candidatura atualizada" : "Candidatura cadastrada");
            setForm(emptyJobVacancyApplicationForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOB_VACANCY_APPLICATION_CLIENT_MESSAGES.JOB_VACANCY_APPLICATION_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof JobVacancyApplicationCreateDto>(
        field: K,
        value: JobVacancyApplicationCreateDto[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.jobVacancyId) {
            setError("Informe a vaga.");
            return;
        }
        if (!form.candidateId) {
            setError("Informe o candidato.");
            return;
        }
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
                        JOB_VACANCY_APPLICATION_CLIENT_MESSAGES.JOB_VACANCY_APPLICATION_LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    const selectedVacancyLabel =
        vacancyItems.find((item) => item.value === form.jobVacancyId)?.label ??
        detailQuery.data?.jobVacancyTitle;
    const selectedCandidateLabel =
        candidateItems.find((item) => item.value === form.candidateId)?.label ??
        detailQuery.data?.candidateFullName;

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
            <FormSection id="dados" title="Candidatura">
                <InputSelectAutocomplete
                    label="Vaga"
                    items={vacancyItems}
                    value={form.jobVacancyId}
                    selectedLabel={selectedVacancyLabel}
                    onValueChange={(value) => update("jobVacancyId", value)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelectAutocomplete
                    label="Candidato"
                    items={candidateItems}
                    value={form.candidateId}
                    selectedLabel={selectedCandidateLabel}
                    onValueChange={(value) => update("candidateId", value)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputSelect
                    label="Situação"
                    items={JOB_VACANCY_APPLICATION_STATUS_ITEMS}
                    value={form.applicationStatus ?? "APPLIED"}
                    onValueChange={(v) =>
                        update("applicationStatus", (v || "APPLIED") as JobVacancyApplicationStatus)
                    }
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
