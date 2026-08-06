export type OccupationalExamType =
    | "ADMISSIONAL"
    | "PERIODICO"
    | "RETORNO_AO_TRABALHO"
    | "MUDANCA_DE_RISCO_OCUPACIONAL"
    | "DEMISSIONAL";

export type OccupationalExamLifecycleStatus =
    | "PREVISTO"
    | "CONVOCADO"
    | "REALIZADO"
    | "REGISTRADO"
    | "TRANSMITIDO"
    | "ARQUIVADO"
    | "VENCIDO_INADIMPLENTE";

export type OccupationalExamResult = "FIT" | "UNFIT";

export type OccupationalExamSourceTrigger =
    | "MATRIX_SCHEDULE"
    | "ADMISSION"
    | "LEAVE_RETURN"
    | "POSITION_CHANGE"
    | "TERMINATION"
    | "MANUAL";

export type ComplementaryExamResult = "NORMAL" | "ALTERED" | "NOT_PERFORMED";

export class ComplementaryExamDto {
    id?: string;
    code?: number;
    occupationalExamId?: string;
    procedureCode!: string;
    performedDate?: string;
    result?: ComplementaryExamResult | null;
}

export class OccupationalExamClinicalDataDto {
    cid?: string | null;
    clinicalObservations?: string | null;
    complementaryExams?: ComplementaryExamDto[];
}

export class OccupationalExam {
    id!: string;
    code!: number;
    status!: string;
    collaboratorId!: string;
    jobPositionId!: string;
    examType!: OccupationalExamType;
    lifecycleStatus!: OccupationalExamLifecycleStatus;
    clinicId?: string;
    examinerPhysicianId?: string;
    coordinatorPhysicianId?: string;
    scheduledDate?: string;
    clinicalExamDate?: string;
    asoIssueDate?: string;
    dueDate?: string;
    result?: OccupationalExamResult;
    sourceTrigger!: OccupationalExamSourceTrigger;
    relatedLeaveRequestId?: string;
    examRequirementVersionId?: string;
    dismissalWaiverApplied?: boolean;
    dismissalWaiverReason?: string;
    retentionUntil?: string;
    clinicalData?: OccupationalExamClinicalDataDto | null;
    createdAt?: string;
    updatedAt?: string;
}

export class OccupationalExamCreateDto {
    collaboratorId!: string;
    jobPositionId!: string;
    examType!: OccupationalExamType;
    lifecycleStatus?: OccupationalExamLifecycleStatus;
    clinicId?: string;
    examinerPhysicianId?: string;
    coordinatorPhysicianId?: string;
    scheduledDate?: string;
    clinicalExamDate?: string;
    asoIssueDate?: string;
    result?: OccupationalExamResult;
    cid?: string;
    clinicalObservations?: string;
    sourceTrigger?: OccupationalExamSourceTrigger;
    complementaryExams?: ComplementaryExamDto[];
}

export class OccupationalExamScheduleDto {
    scheduledDate!: string;
    clinicId?: string;
}

export class OccupationalExamRegisterResultDto {
    examinerPhysicianId!: string;
    coordinatorPhysicianId?: string;
    clinicId?: string;
    clinicalExamDate!: string;
    asoIssueDate?: string;
    result!: OccupationalExamResult;
    cid?: string;
    clinicalObservations?: string;
    complementaryExams?: ComplementaryExamDto[];
}
