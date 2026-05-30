package br.com.gommo.modules.person.exitinterview.dto;
import br.com.gommo.core.entity.StatusEnum; import java.time.*; import java.util.UUID; import lombok.*;
@Getter @Builder
public class ExitInterviewResponseDto {
    private final UUID id; private final StatusEnum status; private final UUID collaboratorId; private final LocalDate interviewDate;
    private final String departureReason; private final String feedback; private final Boolean wouldRecommend;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}
