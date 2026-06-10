package br.com.gommo.modules.access.profile.mapper;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.access.profile.dto.ProfileResponseDto;
import br.com.gommo.modules.root.dto.PermissionSummaryDto;
import br.com.gommo.modules.root.entity.Permission;
import br.com.gommo.modules.root.entity.Role;

@Component
public class ProfileMapper {

    public ProfileResponseDto toResponse(Role role) {
        List<PermissionSummaryDto> permissions = role.getPermissions().stream()
                .sorted(Comparator.comparing(Permission::getAuthority))
                .map(this::toPermissionSummary)
                .toList();

        return ProfileResponseDto.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .system(role.getSystem())
                .status(role.getStatus())
                .permissions(permissions)
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }

    public ProfileResponseDto toSummary(Role role) {
        return ProfileResponseDto.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .system(role.getSystem())
                .status(role.getStatus())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }

    private PermissionSummaryDto toPermissionSummary(Permission permission) {
        return PermissionSummaryDto.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .authority(permission.getAuthority())
                .module(permission.getModule())
                .description(permission.getDescription())
                .build();
    }
}
