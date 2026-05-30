package br.com.gommo.modules.person.performance.dto;
import br.com.gommo.modules.person.performance.entity.PerformanceRatingEnum;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PerformanceReviewRequestDto {
    @NotNull private UUID collaboratorId;
    @NotNull private LocalDate periodStart;
    @NotNull private LocalDate periodEnd;
    private PerformanceRatingEnum rating;
    private String goalsSummary;
    private String feedback;
    private String reviewerName;
}
