import type { PerformanceReview, PerformanceReviewCreateDto } from "@/modules/person/performance/dto/performance-review.dto";
import { BaseService } from "@/modules/root/services/base.service";

class PerformanceReviewService extends BaseService<PerformanceReview, PerformanceReviewCreateDto, PerformanceReviewCreateDto> {
    constructor() {
        super("/api/v1/performance-reviews");
    }
}

export const performanceReviewService = new PerformanceReviewService();
