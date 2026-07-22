package br.com.gommo.modules.cfg.access.user.mapper;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileResponseDto;
import br.com.gommo.modules.cfg.access.profile.mapper.ProfileMapper;
import br.com.gommo.modules.cfg.access.user.dto.AppUserResponseDto;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Role;

@Component
public class TenantAppUserMapper {

    private final ProfileMapper profileMapper;

    public TenantAppUserMapper(ProfileMapper profileMapper) {
        this.profileMapper = profileMapper;
    }

    public AppUserResponseDto toResponse(AppUser user, Collaborator collaborator) {
        Map<SystemScopeEnum, List<ProfileResponseDto>> rolesBySystem = new EnumMap<>(SystemScopeEnum.class);
        for (SystemScopeEnum system : SystemScopeEnum.values()) {
            rolesBySystem.put(system, new ArrayList<>());
        }
        for (Role role : user.getRoles()) {
            if (role.isSystemRole() || role.getSystem() == null) {
                continue;
            }
            List<ProfileResponseDto> systemRoles = rolesBySystem.get(role.getSystem());
            if (systemRoles != null) {
                systemRoles.add(profileMapper.toSummary(role));
            }
        }
        for (List<ProfileResponseDto> systemRoles : rolesBySystem.values()) {
            systemRoles.sort(Comparator.comparing(ProfileResponseDto::getName, String.CASE_INSENSITIVE_ORDER));
        }

        return AppUserResponseDto.builder()
                .id(user.getId())
                .code(user.getCode())
                .status(user.getStatus())
                .collaboratorId(user.getCollaboratorId())
                .collaboratorName(collaborator != null ? collaborator.getFullName() : null)
                .username(user.getUsername())
                .email(user.getEmail())
                .rolesBySystem(rolesBySystem)
                .lastLogin(user.getLastLogin())
                .mustChangePwd(user.isMustChangePwd())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
