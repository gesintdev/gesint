import type { OccupationalExamType } from "@/modules/rh/person/occupational-exam/dto/occupational-exam.dto";

export class ExamRequirement {
    id!: string;
    code!: number;
    status!: string;
    jobPositionId!: string;
    examType!: OccupationalExamType;
    complementaryProcedureCodes?: string[];
    periodicityMonths?: number;
    riskBasis?: string;
    versionNumber!: number;
    validFrom!: string;
    validUntil?: string;
}

export class ExamRequirementCreateDto {
    jobPositionId!: string;
    examType!: OccupationalExamType;
    complementaryProcedureCodes?: string[];
    periodicityMonths?: number;
    riskBasis?: string;
    validFrom!: string;
    validUntil?: string;
}
