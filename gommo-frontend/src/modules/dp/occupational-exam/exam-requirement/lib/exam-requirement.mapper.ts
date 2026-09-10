import type {
    ExamRequirement,
    ExamRequirementCreateDto,
} from "@/modules/dp/occupational-exam/exam-requirement/dto/exam-requirement.dto";

export function emptyExamRequirementForm(jobPositionId = ""): ExamRequirementCreateDto {
    return {
        jobPositionId,
        name: "",
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
        name: entity.name ?? "",
        examType: entity.examType,
        complementaryProcedureCodes: [...(entity.complementaryProcedureCodes ?? [])],
        periodicityMonths: entity.periodicityMonths,
        riskBasis: entity.riskBasis ?? "",
        validFrom: entity.validFrom,
        validUntil: entity.validUntil ?? "",
    };
}

export function examRequirementToRequestDto(form: ExamRequirementCreateDto): ExamRequirementCreateDto {
    const isPeriodic = form.examType === "PERIODICO";
    return {
        jobPositionId: form.jobPositionId,
        name: form.name?.trim() || undefined,
        examType: form.examType,
        complementaryProcedureCodes:
            form.complementaryProcedureCodes && form.complementaryProcedureCodes.length > 0
                ? form.complementaryProcedureCodes
                : undefined,
        periodicityMonths: isPeriodic ? form.periodicityMonths || undefined : undefined,
        riskBasis: form.riskBasis?.trim() || undefined,
        validFrom: form.validFrom,
        validUntil: form.validUntil?.trim() || undefined,
    };
}

/** Soma meses a uma data ISO (yyyy-MM-dd), preservando o dia quando possivel. */
export function addMonthsToIsoDate(isoDate: string, months: number): string {
    if (!isoDate || !Number.isFinite(months)) return "";
    const [yearRaw, monthRaw, dayRaw] = isoDate.split("-").map(Number);
    if (!yearRaw || !monthRaw || !dayRaw) return "";
    const date = new Date(Date.UTC(yearRaw, monthRaw - 1, dayRaw));
    if (Number.isNaN(date.getTime())) return "";
    const day = date.getUTCDate();
    date.setUTCMonth(date.getUTCMonth() + months);
    if (date.getUTCDate() < day) {
        date.setUTCDate(0);
    }
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
