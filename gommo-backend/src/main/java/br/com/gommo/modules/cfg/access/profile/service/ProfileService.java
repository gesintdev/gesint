package br.com.gommo.modules.cfg.access.profile.service;

import jakarta.persistence.EntityManager;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.persistence.EntityCodeIncrementer;
import br.com.gommo.modules.cfg.access.catalog.PermissionModuleCatalog;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileRequestDto;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileResponseDto;
import br.com.gommo.modules.cfg.access.profile.exception.ProfileException;
import br.com.gommo.modules.cfg.access.profile.mapper.ProfileMapper;
import br.com.gommo.modules.root.entity.Permission;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.repository.PermissionRepository;
import br.com.gommo.modules.root.repository.RoleRepository;

@Service
public class ProfileService implements IProfileService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final ProfileMapper mapper;
    private final EntityManager entityManager;

    public ProfileService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            ProfileMapper mapper,
            EntityManager entityManager) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.mapper = mapper;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('role:read')")
    public List<ProfileResponseDto> findAll(SystemScopeEnum system, boolean includeInactive) {
        List<Role> roles = system == null
                ? roleRepository.findAllCustomProfilesWithPermissions(StatusEnum.DELETED)
                : roleRepository.findAllCustomProfilesWithPermissionsBySystem(system, StatusEnum.DELETED);
        if (!includeInactive) {
            roles = roles.stream()
                    .filter(role -> role.getStatus() == StatusEnum.ACTIVE)
                    .toList();
        }
        return roles.stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('role:read')")
    public ProfileResponseDto findById(UUID id) {
        return mapper.toResponse(findProfile(id));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:write')")
    public ProfileResponseDto create(ProfileRequestDto request) {
        validateUniqueName(request.getName(), null);
        Role role = Role.builder()
                .code(EntityCodeIncrementer.nextCode(entityManager, Role.class))
                .name(request.getName().trim())
                .description(
                        StringUtils.hasText(request.getDescription())
                                ? request.getDescription().trim()
                                : null)
                .system(request.getSystem())
                .status(StatusEnum.ACTIVE)
                .systemRole(false)
                .permissions(resolvePermissions(request))
                .build();
        return mapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:write')")
    public ProfileResponseDto update(UUID id, ProfileRequestDto request) {
        Role role = findProfile(id);
        if (role.isSystemRole()) {
            throw ProfileException.systemRoleImmutable();
        }
        validateUniqueName(request.getName(), id);
        role.setName(request.getName().trim());
        role.setDescription(
                StringUtils.hasText(request.getDescription())
                        ? request.getDescription().trim()
                        : null);
        role.setSystem(request.getSystem());
        role.setPermissions(resolvePermissions(request));
        return mapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:write')")
    public void activate(UUID id) {
        Role role = findProfile(id);
        role.setStatus(StatusEnum.ACTIVE);
        roleRepository.save(role);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:write')")
    public void deactivate(UUID id) {
        Role role = findProfile(id);
        role.setStatus(StatusEnum.INACTIVE);
        roleRepository.save(role);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:delete')")
    public void delete(UUID id) {
        Role role = findProfile(id);
        if (role.isSystemRole()) {
            throw ProfileException.systemRoleImmutable();
        }
        role.setStatus(StatusEnum.DELETED);
        roleRepository.save(role);
    }

    private Role findProfile(UUID id) {
        return roleRepository
                .findByIdWithPermissions(id, StatusEnum.DELETED)
                .filter(r -> !r.isSystemRole())
                .orElseThrow(ProfileException::notFound);
    }

    private void validateUniqueName(String name, UUID excludeId) {
        roleRepository.findByName(name.trim()).ifPresent(existing -> {
            if (excludeId == null || !existing.getId().equals(excludeId)) {
                throw ProfileException.duplicateName();
            }
        });
    }

    private Set<Permission> resolvePermissions(ProfileRequestDto request) {
        if (request.getPermissionIds() == null || request.getPermissionIds().isEmpty()) {
            return new HashSet<>();
        }
        Set<UUID> requestedIds = new HashSet<>(request.getPermissionIds());
        // Perfil pode agregar permissões de vários sistemas (checkbox por escopo no cadastro).
        Set<String> allowedModules = PermissionModuleCatalog.allModules();
        List<Permission> permissions = permissionRepository.findAllById(requestedIds);
        if (permissions.size() != requestedIds.size()) {
            throw ProfileException.invalidPermissions();
        }
        Set<Permission> resolved = new HashSet<>();
        for (Permission permission : permissions) {
            if (!allowedModules.contains(permission.getModule())) {
                throw ProfileException.invalidPermissions();
            }
            resolved.add(permission);
        }
        return resolved;
    }
}
