import type {
    PerformanceReview,
    PerformanceReviewCreateDto,
} from "@/modules/person/performance/dto/performance-review.dto";

export function performanceReviewToFormDto(entity: PerformanceReview): PerformanceReviewCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        periodStart: entity.periodStart?.slice(0, 10) ?? "",
        periodEnd: entity.periodEnd?.slice(0, 10) ?? "",
        rating: entity.rating,
        goalsSummary: entity.goalsSummary ?? "",
        feedback: entity.feedback ?? "",
        reviewerName: entity.reviewerName ?? "",
    };
}

export const emptyPerformanceReviewForm = (): PerformanceReviewCreateDto => ({
    collaboratorId: "",
    periodStart: "",
    periodEnd: "",
    goalsSummary: "",
    feedback: "",
    reviewerName: "",
});
