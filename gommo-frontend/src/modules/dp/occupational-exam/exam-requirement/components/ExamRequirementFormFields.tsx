"use client";

import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo } from "react";

import type { ExamRequirementCreateDto } from "@/modules/dp/occupational-exam/exam-requirement/dto/exam-requirement.dto";
import { addMonthsToIsoDate } from "@/modules/dp/occupational-exam/exam-requirement/lib/exam-requirement.mapper";
import { OCCUPATIONAL_EXAM_TYPE_ITEMS } from "@/modules/dp/occupational-exam/lib/occupational-exam.options";
import { esocialTable27ProcedureService } from "@/modules/dp/occupational-exam/procedure/services/esocial-table27-procedure.service";
import { FormSection } from "@/shared/components/ui/FormSection";
import { MultiSelectDuoList } from "@/shared/components/ui/MultiSelectDuoList";
import { InputDate, InputNumber, InputSelect, InputString } from "@/shared/components/ui/input/index";

const EMPTY_CODES: string[] = [];

type ExamRequirementFormFieldsProps = {
    form: ExamRequirementCreateDto;
    onChange: <K extends keyof ExamRequirementCreateDto>(
        field: K,
        value: ExamRequirementCreateDto[K],
    ) => void;
    versionNumber?: number;
    isEditing?: boolean;
};

export function ExamRequirementFormFields({
    form,
    onChange,
    versionNumber,
    isEditing = false,
}: ExamRequirementFormFieldsProps) {
    const isPeriodic = form.examType === "PERIODICO";
    const selectedCodes = form.complementaryProcedureCodes ?? EMPTY_CODES;

    useEffect(() => {
        if (!isPeriodic) {
            if (form.periodicityMonths != null) onChange("periodicityMonths", undefined);
            return;
        }
        if (!form.validFrom || !form.periodicityMonths || form.periodicityMonths <= 0) {
            if (form.validUntil) onChange("validUntil", "");
            return;
        }
        const next = addMonthsToIsoDate(form.validFrom, form.periodicityMonths);
        if (next && next !== form.validUntil) onChange("validUntil", next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPeriodic, form.validFrom, form.periodicityMonths]);

    const handleCodesChange = useCallback(
        (codes: string[]) => onChange("complementaryProcedureCodes", codes),
        [onChange],
    );

    return (
        <>
            <FormSection
                id="dados"
                title="Requisito da matriz"
                description={
                    isEditing
                        ? `Edicao gera nova versao (atual: v${versionNumber ?? "—"}). A versao anterior e encerrada automaticamente.`
                        : "Define o exame exigido para o cargo e a periodicidade usada no calculo do vencimento."
                }
            >
                <InputString
                    label="Nome da matriz"
                    value={form.name ?? ""}
                    onValueChange={(v) => onChange("name", v)}
                    wrapperClassName="sm:col-span-8"
                />
                <InputSelect
                    label="Tipo de exame"
                    value={form.examType}
                    onValueChange={(v) => onChange("examType", v as ExamRequirementCreateDto["examType"])}
                    items={OCCUPATIONAL_EXAM_TYPE_ITEMS}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                {isPeriodic ? (
                    <InputNumber
                        label="Periodicidade (meses)"
                        value={form.periodicityMonths ?? null}
                        onValueChange={(v) => onChange("periodicityMonths", v ?? undefined)}
                        integer
                        wrapperClassName="sm:col-span-2"
                    />
                ) : null}
                <InputDate
                    label="Vigente de"
                    value={form.validFrom}
                    onValueChange={(v) => onChange("validFrom", v)}
                    required
                    wrapperClassName={isPeriodic ? "sm:col-span-5" : "sm:col-span-4"}
                />
                <InputDate
                    label="Vigente ate"
                    value={form.validUntil ?? ""}
                    onValueChange={(v) => onChange("validUntil", v)}
                    disabled={isPeriodic}
                    wrapperClassName={isPeriodic ? "sm:col-span-5" : "sm:col-span-4"}
                />
                <InputString
                    label="Base de risco (PGR/GHE)"
                    value={form.riskBasis ?? ""}
                    onValueChange={(v) => onChange("riskBasis", v)}
                    wrapperClassName="sm:col-span-12"
                />
            </FormSection>

            <ExamRequirementComplementarySection
                selectedCodes={selectedCodes}
                onCodesChange={handleCodesChange}
            />
        </>
    );
}

const ExamRequirementComplementarySection = memo(function ExamRequirementComplementarySection({
    selectedCodes,
    onCodesChange,
}: {
    selectedCodes: string[];
    onCodesChange: (codes: string[]) => void;
}) {
    const proceduresQuery = useQuery({
        queryKey: ["esocial-table27-procedures"],
        queryFn: () => esocialTable27ProcedureService.getAll(),
        staleTime: 5 * 60_000,
    });

    const procedureItems = useMemo(
        () =>
            (proceduresQuery.data ?? []).map((procedure) => ({
                value: procedure.procedureCode,
                label: procedure.description,
            })),
        [proceduresQuery.data],
    );

    return (
        <FormSection
            id="complementares"
            title="Exames complementares (Tabela 27)"
            description="Selecione os procedimentos complementares previstos para este requisito."
        >
            <MultiSelectDuoList
                items={procedureItems}
                value={selectedCodes}
                onChange={onCodesChange}
                availableTitle="Lista de valores disponiveis"
                selectedTitle="Lista de valores adicionados"
                filterPlaceholder="Filtrar codigo ou descricao..."
                emptyAvailableMessage={
                    proceduresQuery.isLoading
                        ? "Carregando Tabela 27..."
                        : "Nenhum procedimento disponivel."
                }
            />
        </FormSection>
    );
});
