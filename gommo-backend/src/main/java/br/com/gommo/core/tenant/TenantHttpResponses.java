package br.com.gommo.core.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.time.OffsetDateTime;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.core.exception.ErrorResponseDto;
import br.com.gommo.core.security.CorrelationIdFilter;

@Component
public class TenantHttpResponses {

    private final ObjectMapper objectMapper;

    public TenantHttpResponses(ObjectProvider<JsonMapper> jsonMapperProvider) {
        this.objectMapper =
                jsonMapperProvider.getIfAvailable(() -> JsonMapper.builder().build());
    }

    public void writeBusinessError(HttpServletRequest request, HttpServletResponse response, BusinessException ex)
            throws IOException {
        response.setStatus(ex.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponseDto body = ErrorResponseDto.builder()
                .code(ex.getCode())
                .message(ex.getMessage())
                .correlationId(CorrelationIdFilter.getCorrelationId(request))
                .timestamp(OffsetDateTime.now())
                .build();
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
