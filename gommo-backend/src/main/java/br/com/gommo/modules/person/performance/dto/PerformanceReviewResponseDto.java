package br.com.gommo.modules.person.performance.dto;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.performance.entity.PerformanceRatingEnum;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Getter @Builder
public class PerformanceReviewResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final PerformanceRatingEnum rating;
    private final String goalsSummary;
    private final String feedback;
    private final String reviewerName;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
