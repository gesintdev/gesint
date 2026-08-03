"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { JobPositionPickerField } from "@/modules/dp/organization/jobposition/components/JobPositionPickerField";
import type { ExamRequirementCreateDto } from "@/modules/rh/person/occupational-exam/exam-requirement/dto/exam-requirement.dto";
import { examRequirementKeys } from "@/modules/rh/person/occupational-exam/exam-requirement/exam-requirement.query";
import {
    emptyExamRequirementForm,
    examRequirementToFormDto,
    examRequirementToRequestDto,
} from "@/modules/rh/person/occupational-exam/exam-requirement/lib/exam-requirement.mapper";
import { examRequirementService } from "@/modules/rh/person/occupational-exam/exam-requirement/services/exam-requirement.service";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/rh/person/occupational-exam/exceptions/occupational-exam.messages";
import { OCCUPATIONAL_EXAM_TYPE_ITEMS } from "@/modules/rh/person/occupational-exam/lib/occupational-exam.options";
import { esocialTable27ProcedureService } from "@/modules/rh/person/occupational-exam/procedure/services/esocial-table27-procedure.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCheckbox, InputDate, InputNumber, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Requisito" },
    { id: "complementares", label: "Complementares" },
];

export function ExamRequirementFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ExamRequirementCreateDto>(emptyExamRequirementForm);
    const [error, setError] = useState<string | null>(null);
    const [versionNumber, setVersionNumber] = useState<number | undefined>();

    const detailQuery = useQuery({
        queryKey: examRequirementKeys.detail(editingId ?? ""),
        queryFn: () => examRequirementService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    const proceduresQuery = useQuery({
        queryKey: ["esocial-table27-procedures"],
        queryFn: () => esocialTable27ProcedureService.getAll(),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyExamRequirementForm());
            setVersionNumber(undefined);
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(examRequirementToFormDto(detailQuery.data));
            setVersionNumber(detailQuery.data.versionNumber);
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: ExamRequirementCreateDto) => {
            const payload = examRequirementToRequestDto(dto);
            if (isEditing && editingId) return examRequirementService.update(editingId, payload);
            return examRequirementService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: examRequirementKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({ queryKey: examRequirementKeys.detail(editingId) });
            }
            toast.success(
                isEditing
                    ? "Nova versao da matriz criada"
                    : "Requisito cadastrado na matriz",
            );
            setForm(emptyExamRequirementForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.REQUIREMENT_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof ExamRequirementCreateDto>(field: K, value: ExamRequirementCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const toggleProcedure = (procedureCode: string, checked: boolean) => {
        setForm((prev) => {
            const current = new Set(prev.complementaryProcedureCodes ?? []);
            if (checked) current.add(procedureCode);
            else current.delete(procedureCode);
            return { ...prev, complementaryProcedureCodes: Array.from(current) };
        });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.jobPositionId) {
            setError("Selecione a funcao (cargo).");
            return;
        }
        if (!form.examType) {
            setError("Selecione o tipo de exame.");
            return;
        }
        if (!form.validFrom) {
            setError("Informe a data de inicio da vigencia.");
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
                        OCCUPATIONAL_EXAM_CLIENT_MESSAGES.REQUIREMENT_LOAD_FAILED,
                    )}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    const selectedCodes = new Set(form.complementaryProcedureCodes ?? []);

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
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Criar nova versao" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="dados"
                title="Requisito da matriz"
                description={
                    isEditing
                        ? `Edicao gera nova versao (atual: v${versionNumber ?? "—"}). A versao anterior e encerrada automaticamente.`
                        : "Define o exame exigido por funcao e a periodicidade usada no calculo do vencimento."
                }
            >
                <JobPositionPickerField
                    label="Funcao"
                    value={form.jobPositionId}
                    onValueChange={(id) => update("jobPositionId", id)}
                    required
                    wrapperClassName="sm:col-span-8"
                />
                <InputSelect
                    label="Tipo de exame"
                    value={form.examType}
                    onValueChange={(v) => update("examType", v as ExamRequirementCreateDto["examType"])}
                    items={OCCUPATIONAL_EXAM_TYPE_ITEMS}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputNumber
                    label="Periodicidade (meses)"
                    value={form.periodicityMonths ?? null}
                    onValueChange={(v) => update("periodicityMonths", v ?? undefined)}
                    integer
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Vigente de"
                    value={form.validFrom}
                    onValueChange={(v) => update("validFrom", v)}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Vigente ate"
                    value={form.validUntil ?? ""}
                    onValueChange={(v) => update("validUntil", v)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Base de risco (PGR/GHE)"
                    value={form.riskBasis ?? ""}
                    onValueChange={(v) => update("riskBasis", v)}
                    wrapperClassName="sm:col-span-12"
                />
            </FormSection>

            <FormSection
                id="complementares"
                title="Exames complementares (Tabela 27)"
                description="Procedimentos complementares previstos para este requisito."
            >
                <div className="sm:col-span-12 grid gap-2">
                    {(proceduresQuery.data ?? []).map((procedure) => (
                        <InputCheckbox
                            key={procedure.id}
                            label={`${procedure.procedureCode} — ${procedure.description}`}
                            checked={selectedCodes.has(procedure.procedureCode)}
                            onCheckedChange={(checked) =>
                                toggleProcedure(procedure.procedureCode, Boolean(checked))
                            }
                        />
                    ))}
                    {!proceduresQuery.isLoading && (proceduresQuery.data?.length ?? 0) === 0 ? (
                        <p className="text-sm text-base-content/60">
                            Nenhum procedimento da Tabela 27 cadastrado.
                        </p>
                    ) : null}
                </div>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
