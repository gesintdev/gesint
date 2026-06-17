package br.com.gommo.modules.rh.person.performance.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.performance.entity.PerformanceRatingEnum;

@Getter
@Builder
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
