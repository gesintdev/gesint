package br.com.gesint.modules.cfg.access.actingprofile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.access.actingprofile.entity.DataScopeEnum;
import br.com.gesint.modules.cfg.access.entity.SystemScopeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActingProfileResponseDto {

    private UUID id;
    private Integer code;
    private String name;
    private String description;
    private SystemScopeEnum system;
    private DataScopeEnum dataScope;
    private UUID scopeRef;
    private StatusEnum status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
