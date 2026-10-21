package br.com.gesint.admin.modules.assistanterrorlog.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantErrorLogResponseDto {

    private UUID id;
    private UUID clientId;
    private String clientName;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String tenantSchema;
    private String summary;
    private String errorClass;
    private OffsetDateTime createdAt;
}
