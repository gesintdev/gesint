package br.com.gommo.admin.modules.adminuser.dto;

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
public class AdminUserResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private String username;
    private String email;
    private String fullName;
    private boolean firstAccessCompleted;
    /** Presente apenas em create/reset-access — token em texto claro para exibir uma vez. */
    private String accessToken;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
