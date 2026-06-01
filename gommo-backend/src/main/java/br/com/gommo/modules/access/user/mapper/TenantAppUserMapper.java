package br.com.gommo.modules.access.user.mapper;

import br.com.gommo.modules.access.entity.SystemScopeEnum;
import br.com.gommo.modules.access.profile.dto.ProfileResponseDto;
import br.com.gommo.modules.access.profile.mapper.ProfileMapper;
import br.com.gommo.modules.access.user.dto.AppUserResponseDto;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Role;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class TenantAppUserMapper {

    private final ProfileMapper profileMapper;

    public TenantAppUserMapper(ProfileMapper profileMapper) {
        this.profileMapper = profileMapper;
    }

    public AppUserResponseDto toResponse(AppUser user, Collaborator collaborator) {
        List<ProfileResponseDto> dpRoles = new ArrayList<>();
        List<ProfileResponseDto> rhRoles = new ArrayList<>();
        for (Role role : user.getRoles()) {
            if (role.isSystemRole()) {
                continue;
            }
            if (role.getSystem() == SystemScopeEnum.DP) {
                dpRoles.add(profileMapper.toSummary(role));
            } else if (role.getSystem() == SystemScopeEnum.RH) {
                rhRoles.add(profileMapper.toSummary(role));
            }
        }
        dpRoles.sort(Comparator.comparing(ProfileResponseDto::getName, String.CASE_INSENSITIVE_ORDER));
        rhRoles.sort(Comparator.comparing(ProfileResponseDto::getName, String.CASE_INSENSITIVE_ORDER));

        return AppUserResponseDto.builder()
                .id(user.getId())
                .code(user.getCode())
                .status(user.getStatus())
                .collaboratorId(user.getCollaboratorId())
                .collaboratorName(collaborator != null ? collaborator.getFullName() : null)
                .username(user.getUsername())
                .email(user.getEmail())
                .dpRoles(dpRoles)
                .rhRoles(rhRoles)
                .lastLogin(user.getLastLogin())
                .mustChangePwd(user.isMustChangePwd())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
