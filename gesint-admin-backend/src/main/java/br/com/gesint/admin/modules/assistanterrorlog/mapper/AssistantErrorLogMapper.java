package br.com.gesint.admin.modules.assistanterrorlog.mapper;

import org.springframework.stereotype.Component;

import br.com.gesint.admin.modules.assistanterrorlog.dto.AssistantErrorLogResponseDto;
import br.com.gesint.admin.modules.assistanterrorlog.entity.AssistantErrorLog;

@Component
public class AssistantErrorLogMapper {

    public AssistantErrorLogResponseDto toResponse(AssistantErrorLog entity) {
        if (entity == null) {
            return null;
        }
        return AssistantErrorLogResponseDto.builder()
                .id(entity.getId())
                .clientId(entity.getClientId())
                .clientName(entity.getClientName())
                .userId(entity.getUserId())
                .userName(entity.getUserName())
                .userEmail(entity.getUserEmail())
                .tenantSchema(entity.getTenantSchema())
                .summary(entity.getSummary())
                .errorClass(entity.getErrorClass())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
