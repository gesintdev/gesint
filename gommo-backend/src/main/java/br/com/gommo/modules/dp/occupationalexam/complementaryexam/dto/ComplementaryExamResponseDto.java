package br.com.gommo.modules.dp.occupationalexam.complementaryexam.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.occupationalexam.complementaryexam.entity.ComplementaryExamResultEnum;

@Getter
@Builder
public class ComplementaryExamResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID occupationalExamId;
    private final String procedureCode;
    private final LocalDate performedDate;
    /** Preenchido apenas quando o usuario possui occupationalexam:clinical. */
    private final ComplementaryExamResultEnum result;

    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
