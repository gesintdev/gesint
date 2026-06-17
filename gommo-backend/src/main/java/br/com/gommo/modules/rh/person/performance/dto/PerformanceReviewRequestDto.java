package br.com.gommo.modules.rh.person.performance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.rh.person.performance.entity.PerformanceRatingEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReviewRequestDto {
    @NotNull private UUID collaboratorId;

    @NotNull private LocalDate periodStart;

    @NotNull private LocalDate periodEnd;

    private PerformanceRatingEnum rating;
    private String goalsSummary;
    private String feedback;
    private String reviewerName;
}
