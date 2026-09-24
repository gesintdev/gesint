package br.com.gommo.modules.cfg.access.actingprofile.mapper;

import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gommo.modules.cfg.access.actingprofile.dto.ActingProfileRequestDto;
import br.com.gommo.modules.cfg.access.actingprofile.dto.ActingProfileResponseDto;
import br.com.gommo.modules.cfg.access.actingprofile.entity.ActingProfile;
import br.com.gommo.modules.cfg.access.actingprofile.entity.DataScopeEnum;

@Component
public class ActingProfileMapper {

    public ActingProfile toEntity(ActingProfileRequestDto dto) {
        return ActingProfile.builder()
                .name(trim(dto.getName()))
                .description(trimToNull(dto.getDescription()))
                .system(dto.getSystem())
                .dataScope(dto.getDataScope())
                .scopeRef(resolveScopeRef(dto.getDataScope(), dto.getScopeRef()))
                .build();
    }

    public void updateEntity(ActingProfile entity, ActingProfileRequestDto dto) {
        entity.setName(trim(dto.getName()));
        entity.setDescription(trimToNull(dto.getDescription()));
        entity.setSystem(dto.getSystem());
        entity.setDataScope(dto.getDataScope());
        entity.setScopeRef(resolveScopeRef(dto.getDataScope(), dto.getScopeRef()));
    }

    public ActingProfileResponseDto toResponse(ActingProfile entity) {
        return ActingProfileResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .system(entity.getSystem())
                .dataScope(entity.getDataScope())
                .scopeRef(entity.getScopeRef())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private UUID resolveScopeRef(DataScopeEnum dataScope, UUID scopeRef) {
        if (dataScope != DataScopeEnum.DEPARTMENT) {
            return null;
        }
        return scopeRef;
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
