import type { ExitInterview, ExitInterviewCreateDto } from "@/modules/person/exitinterview/dto/exit-interview.dto";

export function exitinterviewToFormDto(entity: ExitInterview): ExitInterviewCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        interviewDate: entity.interviewDate?.slice(0, 10) ?? "",
        departureReason: entity.departureReason ?? "",
        feedback: entity.feedback ?? "",
    };
}

export const emptyExitInterviewForm = (): ExitInterviewCreateDto => ({
    collaboratorId: "",
    interviewDate: "",
    departureReason: "",
    feedback: "",
});
