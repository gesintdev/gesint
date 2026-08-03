import type {
    ExamRequirement,
    ExamRequirementCreateDto,
} from "@/modules/rh/person/occupational-exam/exam-requirement/dto/exam-requirement.dto";

export function emptyExamRequirementForm(): ExamRequirementCreateDto {
    return {
        jobPositionId: "",
        examType: "PERIODICO",
        complementaryProcedureCodes: [],
        periodicityMonths: undefined,
        riskBasis: "",
        validFrom: "",
        validUntil: "",
    };
}

export function examRequirementToFormDto(entity: ExamRequirement): ExamRequirementCreateDto {
    return {
        jobPositionId: entity.jobPositionId,
        examType: entity.examType,
        complementaryProcedureCodes: [...(entity.complementaryProcedureCodes ?? [])],
        periodicityMonths: entity.periodicityMonths,
        riskBasis: entity.riskBasis ?? "",
        validFrom: entity.validFrom,
        validUntil: entity.validUntil ?? "",
    };
}

export function examRequirementToRequestDto(form: ExamRequirementCreateDto): ExamRequirementCreateDto {
    return {
        jobPositionId: form.jobPositionId,
        examType: form.examType,
        complementaryProcedureCodes:
            form.complementaryProcedureCodes && form.complementaryProcedureCodes.length > 0
                ? form.complementaryProcedureCodes
                : undefined,
        periodicityMonths: form.periodicityMonths || undefined,
        riskBasis: form.riskBasis?.trim() || undefined,
        validFrom: form.validFrom,
        validUntil: form.validUntil?.trim() || undefined,
    };
}
