package br.com.gommo.admin.core.exception;

import java.time.OffsetDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorResponseDto {

    private final String code;
    private final String message;
    private final String correlationId;
    private final OffsetDateTime timestamp;
}
