package br.com.gommo.admin.modules.adminuser.mapper;

import br.com.gommo.admin.modules.adminuser.dto.AdminUserRequestDto;
import br.com.gommo.admin.modules.adminuser.dto.AdminUserResponseDto;
import br.com.gommo.admin.modules.adminuser.entity.AdminUser;
import org.springframework.stereotype.Component;

@Component
public class AdminUserMapper {

    public AdminUserResponseDto toResponse(AdminUser entity) {
        return AdminUserResponseDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntity(AdminUser entity, AdminUserRequestDto dto) {
        entity.setUsername(dto.getUsername());
        entity.setEmail(dto.getEmail());
        entity.setFullName(dto.getFullName());
    }
}
