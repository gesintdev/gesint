package br.com.gommo.modules.cfg.access.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.root.dto.PermissionSummaryDto;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDto {

    private UUID id;
    private Integer code;
    private String name;
    private String description;
    private SystemScopeEnum system;
    private StatusEnum status;
    private List<PermissionSummaryDto> permissions;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
