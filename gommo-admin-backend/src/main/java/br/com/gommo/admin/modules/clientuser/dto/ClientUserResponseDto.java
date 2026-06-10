package br.com.gommo.admin.modules.clientuser.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.StatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientUserResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID clientId;
    private String clientName;
    private UUID appUserId;
    private String username;
    private String email;
    private String displayName;
    private OffsetDateTime provisionedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
