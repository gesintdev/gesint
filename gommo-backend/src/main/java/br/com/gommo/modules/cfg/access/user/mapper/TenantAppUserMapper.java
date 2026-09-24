package br.com.gommo.modules.cfg.access.user.mapper;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.cfg.access.actingprofile.dto.ActingProfileResponseDto;
import br.com.gommo.modules.cfg.access.actingprofile.entity.ActingProfile;
import br.com.gommo.modules.cfg.access.actingprofile.mapper.ActingProfileMapper;
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
    private final ActingProfileMapper actingProfileMapper;

    public TenantAppUserMapper(ProfileMapper profileMapper, ActingProfileMapper actingProfileMapper) {
        this.profileMapper = profileMapper;
        this.actingProfileMapper = actingProfileMapper;
    }

    public AppUserResponseDto toResponse(
            AppUser user,
            Collaborator collaborator,
            Map<UUID, List<Role>> rolesByBranchEntity,
            Map<UUID, List<ActingProfile>> actingProfilesByBranchEntity) {
        Map<UUID, Map<SystemScopeEnum, List<ProfileResponseDto>>> rolesByBranch = new LinkedHashMap<>();
        rolesByBranchEntity.forEach(
                (branchId, roles) -> rolesByBranch.put(branchId, groupRolesBySystem(roles)));

        Map<UUID, Map<SystemScopeEnum, List<ActingProfileResponseDto>>> actingProfilesByBranch =
                new LinkedHashMap<>();
        actingProfilesByBranchEntity.forEach(
                (branchId, profiles) ->
                        actingProfilesByBranch.put(branchId, groupActingProfilesBySystem(profiles)));

        return AppUserResponseDto.builder()
                .id(user.getId())
                .code(user.getCode())
                .status(user.getStatus())
                .collaboratorId(user.getCollaboratorId())
                .collaboratorName(collaborator != null ? collaborator.getFullName() : null)
                .username(user.getUsername())
                .email(user.getEmail())
                .rolesByBranch(rolesByBranch)
                .actingProfilesByBranch(actingProfilesByBranch)
                .lastLogin(user.getLastLogin())
                .firstAccessCompleted(user.isFirstAccessCompleted())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private Map<SystemScopeEnum, List<ProfileResponseDto>> groupRolesBySystem(List<Role> roles) {
        Map<SystemScopeEnum, List<ProfileResponseDto>> rolesBySystem = new EnumMap<>(SystemScopeEnum.class);
        for (SystemScopeEnum system : SystemScopeEnum.values()) {
            rolesBySystem.put(system, new ArrayList<>());
        }
        for (Role role : roles) {
            if (!role.isAssignableProfile() || role.getSystem() == null) {
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
        return rolesBySystem;
    }

    private Map<SystemScopeEnum, List<ActingProfileResponseDto>> groupActingProfilesBySystem(
            List<ActingProfile> profiles) {
        Map<SystemScopeEnum, List<ActingProfileResponseDto>> bySystem = new EnumMap<>(SystemScopeEnum.class);
        for (SystemScopeEnum system : SystemScopeEnum.values()) {
            bySystem.put(system, new ArrayList<>());
        }
        for (ActingProfile profile : profiles) {
            if (profile.getSystem() == null) {
                continue;
            }
            List<ActingProfileResponseDto> systemProfiles = bySystem.get(profile.getSystem());
            if (systemProfiles != null) {
                systemProfiles.add(actingProfileMapper.toResponse(profile));
            }
        }
        for (List<ActingProfileResponseDto> systemProfiles : bySystem.values()) {
            systemProfiles.sort(
                    Comparator.comparing(ActingProfileResponseDto::getName, String.CASE_INSENSITIVE_ORDER));
        }
        return bySystem;
    }
}
