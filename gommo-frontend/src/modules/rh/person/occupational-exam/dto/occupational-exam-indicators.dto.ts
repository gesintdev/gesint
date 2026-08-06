import type { OccupationalExam } from "@/modules/rh/person/occupational-exam/dto/occupational-exam.dto";

export class OccupationalExamIndicators {
    complianceRatePercent?: number | null;
    activeCollaboratorsWithPosition!: number;
    compliantCollaborators!: number;
    matrixCoveragePercent?: number | null;
    activeJobPositions!: number;
    jobPositionsWithMatrix!: number;
    overdueCount!: number;
    dueIn30Count!: number;
    dueIn60Count!: number;
    dueIn90Count!: number;
    overdueExams!: OccupationalExam[];
    dueIn30Exams!: OccupationalExam[];
    dismissalPendingCount!: number;
    dismissalPendingExams!: OccupationalExam[];
    phase3PendingIndicators!: string[];
}
