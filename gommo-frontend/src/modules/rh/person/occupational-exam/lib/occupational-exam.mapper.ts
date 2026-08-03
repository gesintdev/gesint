import type {
    OccupationalExam,
    OccupationalExamCreateDto,
} from "@/modules/rh/person/occupational-exam/dto/occupational-exam.dto";

export function emptyOccupationalExamForm(): OccupationalExamCreateDto {
    return {
        collaboratorId: "",
        jobPositionId: "",
        examType: "PERIODICO",
        lifecycleStatus: "PREVISTO",
        sourceTrigger: "MANUAL",
        complementaryExams: [],
    };
}

export function occupationalExamToFormDto(entity: OccupationalExam): OccupationalExamCreateDto {
    return {
        collaboratorId: entity.collaboratorId,
        jobPositionId: entity.jobPositionId,
        examType: entity.examType,
        lifecycleStatus: entity.lifecycleStatus,
        clinicId: entity.clinicId,
        examinerPhysicianId: entity.examinerPhysicianId,
        coordinatorPhysicianId: entity.coordinatorPhysicianId,
        scheduledDate: entity.scheduledDate,
        clinicalExamDate: entity.clinicalExamDate,
        asoIssueDate: entity.asoIssueDate,
        result: entity.result,
        cid: entity.clinicalData?.cid ?? undefined,
        clinicalObservations: entity.clinicalData?.clinicalObservations ?? undefined,
        sourceTrigger: entity.sourceTrigger,
        complementaryExams: entity.clinicalData?.complementaryExams ?? [],
    };
}
