package br.com.gommo.modules.person.exitinterview.dto;

import lombok.*;

import java.time.*;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class ExitInterviewResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final LocalDate interviewDate;
    private final String departureReason;
    private final String feedback;
    private final Boolean wouldRecommend;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
