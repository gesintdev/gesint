export type PerformanceRating = "NEEDS_IMPROVEMENT" | "MEETS" | "EXCEEDS" | "OUTSTANDING";

export class PerformanceReview {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    periodStart!: string;
    periodEnd!: string;
    rating?: PerformanceRating;
    goalsSummary?: string;
    feedback?: string;
    reviewerName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PerformanceReviewCreateDto {
    collaboratorId!: string;
    periodStart!: string;
    periodEnd!: string;
    rating?: PerformanceRating;
    goalsSummary?: string;
    feedback?: string;
    reviewerName?: string;
}
