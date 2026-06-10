package br.com.gommo.core.exception;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class ErrorResponseDto {

    private final String code;
    private final String message;
    private final String correlationId;
    private final OffsetDateTime timestamp;
}
