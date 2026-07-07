package br.com.gommo.modules.cfg.access.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileResponseDto;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppUserResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID collaboratorId;
    private String collaboratorName;
    private String name;
    private String username;
    private String email;
    private List<ProfileResponseDto> dpRoles;
    private List<ProfileResponseDto> rhRoles;
    private OffsetDateTime lastLogin;
    private boolean mustChangePwd;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
