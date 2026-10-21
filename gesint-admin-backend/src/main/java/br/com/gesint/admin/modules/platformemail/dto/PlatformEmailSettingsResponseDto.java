package br.com.gesint.admin.modules.platformemail.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

import br.com.gesint.admin.modules.platformemail.entity.PlatformEmailSecurityEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformEmailSettingsResponseDto {

    private boolean persisted;
    private boolean enabled;
    private String host;
    private Integer port;
    private PlatformEmailSecurityEnum security;
    private String username;
    private boolean passwordConfigured;
    private String fromAddress;
    private String fromName;
    private String replyTo;
    private OffsetDateTime lastTestAt;
    private Boolean lastTestSuccess;
    private String lastTestMessage;
    private OffsetDateTime updatedAt;
}
