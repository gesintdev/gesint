package br.com.gommo.modules.rh.person.exitinterview.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterviewRequestDto {
    @NotNull private UUID collaboratorId;

    @NotNull private LocalDate interviewDate;

    @Size(max = 255) private String departureReason;

    private String feedback;
    private Boolean wouldRecommend;
}
