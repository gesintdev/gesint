package br.com.gommo.modules.person.performance.mapper;
import br.com.gommo.modules.person.performance.dto.*;
import br.com.gommo.modules.person.performance.entity.PerformanceReview;
import org.springframework.stereotype.Component;
@Component public class PerformanceReviewMapper {
    public PerformanceReview toEntity(PerformanceReviewRequestDto dto) {
        return PerformanceReview.builder().collaboratorId(dto.getCollaboratorId())
            .periodStart(dto.getPeriodStart()).periodEnd(dto.getPeriodEnd()).rating(dto.getRating())
            .goalsSummary(dto.getGoalsSummary()).feedback(dto.getFeedback()).reviewerName(dto.getReviewerName()).build();
    }
    public void updateEntity(PerformanceReview entity, PerformanceReviewRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setPeriodStart(dto.getPeriodStart());
        entity.setPeriodEnd(dto.getPeriodEnd());
        entity.setRating(dto.getRating());
        entity.setGoalsSummary(dto.getGoalsSummary());
        entity.setFeedback(dto.getFeedback());
        entity.setReviewerName(dto.getReviewerName());
    }
    public PerformanceReviewResponseDto toResponse(PerformanceReview entity) {
        return PerformanceReviewResponseDto.builder().id(entity.getId()).code(entity.getCode()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).periodStart(entity.getPeriodStart())
            .periodEnd(entity.getPeriodEnd()).rating(entity.getRating()).goalsSummary(entity.getGoalsSummary())
            .feedback(entity.getFeedback()).reviewerName(entity.getReviewerName())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
