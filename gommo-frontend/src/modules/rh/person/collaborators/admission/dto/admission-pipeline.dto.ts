export type AdmissionStepKey =
    | "PRE_ADMISSAO"
    | "DOCUMENTACAO"
    | "EXAME"
    | "CONTRATO"
    | "REGISTRO"
    | "ESOCIAL"
    | "INTEGRACAO";

export type AdmissionStepStatus = "PENDING" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "SKIPPED";

export type AdmissionPipelineSignal =
    | "PRAZO_VENCIDO"
    | "BLOQUEIO"
    | "AGUARDANDO_PESSOA"
    | "EM_DIA"
    | "PRONTO"
    | "APROVADA";

export type AdmissionPipelineDeadlineKind = "ASO_ADMISSIONAL" | "REGISTRO_CARTEIRA" | "ESOCIAL_S2200";

export type AdmissionPipelineBlockReason = "SEM_ASO_APTO" | "INICIO_ULTRAPASSADO" | "ESOCIAL_REJEITADO";

export class AdmissionPipelineStep {
    stepKey!: AdmissionStepKey;
    stepStatus!: AdmissionStepStatus;
    displayOrder!: number;
    dueDate?: string;
    overdue!: boolean;
    blockedReason?: string;
    skipJustification?: string;
}

export class AdmissionPipelineRow {
    admissionId!: string;
    collaboratorId?: string;
    photoObjectId?: string;
    fullName!: string;
    departmentName?: string;
    expectedStartDate?: string;
    steps!: AdmissionPipelineStep[];
    signal!: AdmissionPipelineSignal;
    manuallyApproved!: boolean;
    daysSinceExpectedStart?: number;
    examScheduledDate?: string;
    nextDueDate?: string;
    nextDueKind?: AdmissionPipelineDeadlineKind;
    documentsReceived!: number;
    documentsRequired!: number;
    urgencyRank!: number;
}

export class AdmissionPipelineKpis {
    inProgress!: number;
    startingWithinFifteenDays!: number;
    blockedFromStarting!: number;
    overdueDeadlines!: number;
    overdueDeadlinePeople!: number;
    dueWithinSevenDays!: number;
    nextDueDate?: string;
    readyForFirstDay!: number;
}

export class AdmissionPipelineDeadline {
    admissionId!: string;
    fullName!: string;
    kind!: AdmissionPipelineDeadlineKind;
    dueDate!: string;
    expectedStartDate?: string;
    daysFromToday!: number;
    overdue!: boolean;
}

export class AdmissionPipelineBlock {
    admissionId!: string;
    fullName!: string;
    reason!: AdmissionPipelineBlockReason;
    expectedStartDate?: string;
    examScheduledDate?: string;
}

export class AdmissionPipelineSummary {
    kpis!: AdmissionPipelineKpis;
    deadlines!: AdmissionPipelineDeadline[];
    blocks!: AdmissionPipelineBlock[];
    totalInPipeline!: number;
}
