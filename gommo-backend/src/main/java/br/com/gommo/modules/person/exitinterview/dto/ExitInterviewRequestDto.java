package br.com.gommo.modules.person.exitinterview.dto;
import jakarta.validation.constraints.NotNull; import jakarta.validation.constraints.Size; import java.time.LocalDate; import java.util.UUID; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExitInterviewRequestDto {
    @NotNull private UUID collaboratorId; @NotNull private LocalDate interviewDate;
    @Size(max = 255) private String departureReason; private String feedback; private Boolean wouldRecommend;
}
