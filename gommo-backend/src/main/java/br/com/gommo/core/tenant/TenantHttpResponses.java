package br.com.gommo.core.tenant;

import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.core.exception.ErrorResponseDto;
import br.com.gommo.core.security.CorrelationIdFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.OffsetDateTime;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class TenantHttpResponses {

    private final ObjectMapper objectMapper;

    public TenantHttpResponses(ObjectProvider<ObjectMapper> objectMapperProvider) {
        this.objectMapper = objectMapperProvider.getIfAvailable(ObjectMapper::new);
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
