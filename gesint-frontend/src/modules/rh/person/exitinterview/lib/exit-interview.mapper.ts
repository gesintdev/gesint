import type {
    ExitInterview,
    ExitInterviewAnswerDto,
    ExitInterviewCreateDto,
    ExitInterviewRatingDto,
    ExitInterviewReturnChecklistItemDto,
} from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";
import {
    DEFAULT_OPEN_ANSWERS,
    DEFAULT_RATINGS,
    DEFAULT_RETURN_CHECKLIST,
} from "@/modules/rh/person/exitinterview/lib/exit-interview.options";

function cloneRatings(values?: ExitInterviewRatingDto[]): ExitInterviewRatingDto[] {
    const current = new Map((values ?? []).map((item) => [item.key, item]));
    return DEFAULT_RATINGS.map((item) => {
        const saved = current.get(item.key);
        return { ...item, ...(saved ?? {}), score: saved?.score ?? item.score ?? 1 };
    });
}

function cloneAnswers(values?: ExitInterviewAnswerDto[]): ExitInterviewAnswerDto[] {
    const current = new Map((values ?? []).map((item) => [item.key, item]));
    return DEFAULT_OPEN_ANSWERS.map((item) => ({ ...item, ...(current.get(item.key) ?? {}) }));
}

function cloneChecklist(values?: ExitInterviewReturnChecklistItemDto[]): ExitInterviewReturnChecklistItemDto[] {
    const current = new Map((values ?? []).map((item) => [item.key, item]));
    return DEFAULT_RETURN_CHECKLIST.map((item) => ({ ...item, ...(current.get(item.key) ?? {}) }));
}

export function exitinterviewToFormDto(entity: ExitInterview): ExitInterviewCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        interviewDate: entity.interviewDate?.slice(0, 10) ?? "",
        departureReason: entity.departureReason ?? "",
        feedback: entity.feedback ?? "",
        wouldRecommend: entity.wouldRecommend,
        interviewStatus: entity.interviewStatus ?? "DRAFT",
        relationshipType: entity.relationshipType ?? "CLT",
        collaboratorName: entity.collaboratorName ?? "",
        registrationNumber: entity.registrationNumber ?? "",
        jobPositionName: entity.jobPositionName ?? "",
        jobPositionId: entity.jobPositionId ?? "",
        departmentName: entity.departmentName ?? "",
        departmentId: entity.departmentId ?? "",
        companyName: entity.companyName ?? "",
        managerName: entity.managerName ?? "",
        admissionOrContractStartDate: entity.admissionOrContractStartDate?.slice(0, 10) ?? "",
        terminationOrContractEndDate: entity.terminationOrContractEndDate?.slice(0, 10) ?? "",
        tenureDays: entity.tenureDays,
        terminationType: entity.terminationType,
        interviewerName: entity.interviewerName ?? "",
        mainReason: entity.mainReason,
        secondaryReasons: entity.secondaryReasons ?? [],
        detailedReason: entity.detailedReason ?? entity.feedback ?? "",
        ratings: cloneRatings(entity.ratings),
        openAnswers: cloneAnswers(entity.openAnswers),
        wouldReturn: entity.wouldReturn,
        companyWouldRehire: entity.companyWouldRehire,
        rehireNotes: entity.rehireNotes ?? "",
        returnChecklist: cloneChecklist(entity.returnChecklist),
        templateKey: entity.templateKey ?? "standard_exit_interview",
        templateVersion: entity.templateVersion ?? 1,
        templatePayload: entity.templatePayload ?? {},
    };
}

export const emptyExitInterviewForm = (): ExitInterviewCreateDto => ({
    collaboratorId: "",
    interviewDate: new Date().toISOString().slice(0, 10),
    departureReason: "",
    feedback: "",
    interviewStatus: "DRAFT",
    relationshipType: "CLT",
    collaboratorName: "",
    registrationNumber: "",
    jobPositionName: "",
    jobPositionId: "",
    departmentName: "",
    departmentId: "",
    companyName: "",
    managerName: "",
    admissionOrContractStartDate: "",
    terminationOrContractEndDate: "",
    interviewerName: "",
    secondaryReasons: [],
    detailedReason: "",
    ratings: cloneRatings(),
    openAnswers: cloneAnswers(),
    rehireNotes: "",
    returnChecklist: cloneChecklist(),
    templateKey: "standard_exit_interview",
    templateVersion: 1,
    templatePayload: {},
});
