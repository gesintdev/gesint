package br.com.gommo.modules.cfg.access.profile.service;

import jakarta.persistence.EntityManager;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.core.audit.trail.AuditActionEnum;
import br.com.gommo.core.audit.trail.AuditTrailEntry;
import br.com.gommo.core.audit.trail.AuditTrailRecorder;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.persistence.EntityCodeIncrementer;
import br.com.gommo.modules.cfg.access.catalog.PermissionModuleCatalog;
import br.com.gommo.modules.cfg.access.entity.RoleTypeEnum;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileRequestDto;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileResponseDto;
import br.com.gommo.modules.cfg.access.profile.exception.ProfileException;
import br.com.gommo.modules.cfg.access.profile.mapper.ProfileMapper;
import br.com.gommo.modules.cfg.access.security.AccessScopePolicy;
import br.com.gommo.modules.root.entity.Permission;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.repository.PermissionRepository;
import br.com.gommo.modules.root.repository.RoleRepository;

@Service
public class ProfileService implements IProfileService {

    private static final Set<RoleTypeEnum> LISTABLE_TYPES = Set.of(RoleTypeEnum.ADMIN, RoleTypeEnum.CUSTOM);

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final ProfileMapper mapper;
    private final EntityManager entityManager;
    private final AccessScopePolicy accessScopePolicy;
    private final AuditTrailRecorder auditTrail;

    public ProfileService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            ProfileMapper mapper,
            EntityManager entityManager,
            AccessScopePolicy accessScopePolicy,
            AuditTrailRecorder auditTrail) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.mapper = mapper;
        this.entityManager = entityManager;
        this.accessScopePolicy = accessScopePolicy;
        this.auditTrail = auditTrail;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('role:read')")
    public List<ProfileResponseDto> findAll(SystemScopeEnum system, boolean includeInactive) {
        List<Role> roles = system == null
                ? roleRepository.findAllProfilesWithPermissions(LISTABLE_TYPES, StatusEnum.DELETED)
                : roleRepository.findAllProfilesWithPermissionsBySystem(system, LISTABLE_TYPES, StatusEnum.DELETED);
        return roles.stream()
                .filter(role -> includeInactive || role.getStatus() == StatusEnum.ACTIVE)
                // Perfis de sistemas nao contratados ficam fora da listagem ate a venda do modulo.
                .filter(role -> accessScopePolicy.isSystemContracted(role.getSystem()))
                .map(mapper::toResponse)
                .toList();
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
        validateSystemContracted(request.getSystem());
        validateUniqueName(request.getName(), request.getSystem(), null);
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
                .roleType(RoleTypeEnum.CUSTOM)
                .permissions(resolvePermissions(request, Set.of()))
                .build();
        Role saved = roleRepository.save(role);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.CREATE, saved));
        recordPermissionChanges(saved, Set.of(), request.getSensitivePermissionJustifications());
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:write')")
    public ProfileResponseDto update(UUID id, ProfileRequestDto request) {
        Role role = findProfile(id);
        if (!role.isEditableProfile()) {
            throw ProfileException.systemRoleImmutable();
        }
        validateSystemContracted(request.getSystem());
        validateUniqueName(request.getName(), request.getSystem(), id);
        Set<Permission> previousPermissions = role.getPermissions() == null
                ? Set.of()
                : Set.copyOf(role.getPermissions());
        Set<UUID> currentPermissionIds =
                previousPermissions.stream().map(Permission::getId).collect(Collectors.toSet());
        role.setName(request.getName().trim());
        role.setDescription(
                StringUtils.hasText(request.getDescription())
                        ? request.getDescription().trim()
                        : null);
        role.setSystem(request.getSystem());
        role.setPermissions(resolvePermissions(request, currentPermissionIds));
        Role saved = roleRepository.save(role);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.UPDATE, saved));
        recordPermissionChanges(saved, previousPermissions, request.getSensitivePermissionJustifications());
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:write')")
    public void activate(UUID id) {
        Role role = findProfile(id);
        if (!role.isEditableProfile()) {
            throw ProfileException.systemRoleImmutable();
        }
        role.setStatus(StatusEnum.ACTIVE);
        roleRepository.save(role);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.ACTIVATE, role));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:write')")
    public void deactivate(UUID id) {
        Role role = findProfile(id);
        if (!role.isEditableProfile()) {
            throw ProfileException.systemRoleImmutable();
        }
        role.setStatus(StatusEnum.INACTIVE);
        roleRepository.save(role);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.DEACTIVATE, role));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('role:delete')")
    public void delete(UUID id) {
        Role role = findProfile(id);
        if (!role.isEditableProfile()) {
            throw ProfileException.systemRoleImmutable();
        }
        role.setStatus(StatusEnum.DELETED);
        roleRepository.save(role);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.DELETE, role));
    }

    /** Um evento por permissao concedida/retirada: o detalhe e a descricao da permissao. */
    private void recordPermissionChanges(
            Role role, Set<Permission> previous, Map<UUID, String> sensitiveJustifications) {
        Set<Permission> current = role.getPermissions() == null ? Set.of() : role.getPermissions();
        Set<UUID> previousIds = previous.stream().map(Permission::getId).collect(Collectors.toSet());
        Set<UUID> currentIds = current.stream().map(Permission::getId).collect(Collectors.toSet());
        Map<UUID, String> reasons =
                sensitiveJustifications == null ? Map.of() : sensitiveJustifications;
        current.stream()
                .filter(permission -> !previousIds.contains(permission.getId()))
                .sorted(Comparator.comparing(Permission::getAuthority))
                .forEach(permission -> {
                    AuditTrailEntry entry = AuditTrailEntry.of(AuditActionEnum.PERMISSION_GRANT, role)
                            .detail(permissionLabel(permission));
                    if (isSensitiveAuthority(permission.getAuthority())) {
                        String reason = reasons.get(permission.getId());
                        if (!StringUtils.hasText(reason)) {
                            throw ProfileException.sensitiveJustificationRequired();
                        }
                        entry.reason(reason.trim());
                    }
                    auditTrail.record(entry);
                });
        previous.stream()
                .filter(permission -> !currentIds.contains(permission.getId()))
                .sorted(Comparator.comparing(Permission::getAuthority))
                .forEach(permission -> auditTrail.record(
                        AuditTrailEntry.of(AuditActionEnum.PERMISSION_REVOKE, role).detail(permissionLabel(permission))));
    }

    private static String permissionLabel(Permission permission) {
        String description = StringUtils.hasText(permission.getDescription())
                ? permission.getDescription()
                : permission.getAuthority();
        return "\"" + description + "\" (" + permission.getAuthority() + ")";
    }

    private static boolean isSensitiveAuthority(String authority) {
        if (authority == null || authority.isBlank()) {
            return false;
        }
        int sep = authority.indexOf(':');
        String action = sep >= 0 ? authority.substring(sep + 1) : authority;
        return "sensitive".equals(action) || "financial".equals(action) || "clinical".equals(action);
    }

    private Role findProfile(UUID id) {
        return roleRepository
                .findByIdWithPermissions(id, StatusEnum.DELETED)
                .filter(Role::isAssignableProfile)
                .orElseThrow(ProfileException::notFound);
    }

    private void validateUniqueName(String name, SystemScopeEnum system, UUID excludeId) {
        roleRepository
                .findByNameIgnoreCaseAndSystemAndStatusNot(name.trim(), system, StatusEnum.DELETED)
                .ifPresent(existing -> {
                    if (excludeId == null || !existing.getId().equals(excludeId)) {
                        throw ProfileException.duplicateName();
                    }
                });
    }

    private void validateSystemContracted(SystemScopeEnum system) {
        if (!accessScopePolicy.isSystemContracted(system)) {
            throw ProfileException.systemNotContracted();
        }
    }

    /**
     * Permissoes ja vinculadas ao perfil sao preservadas mesmo que o usuario logado nao as possua;
     * novas concessoes exigem que o usuario tenha a mesma authority.
     */
    private Set<Permission> resolvePermissions(ProfileRequestDto request, Set<UUID> keptPermissionIds) {
        if (request.getPermissionIds() == null || request.getPermissionIds().isEmpty()) {
            return new HashSet<>();
        }
        Set<UUID> requestedIds = new HashSet<>(request.getPermissionIds());
        Set<String> allowedModules = PermissionModuleCatalog.modulesFor(request.getSystem());
        List<Permission> permissions = permissionRepository.findAllById(requestedIds);
        if (permissions.size() != requestedIds.size()) {
            throw ProfileException.invalidPermissions();
        }
        Set<Permission> resolved = new HashSet<>();
        for (Permission permission : permissions) {
            if (!allowedModules.contains(permission.getModule())) {
                throw ProfileException.invalidPermissions();
            }
            if (!keptPermissionIds.contains(permission.getId())
                    && !accessScopePolicy.hasAuthority(permission.getAuthority())) {
                throw ProfileException.permissionNotGranted();
            }
            resolved.add(permission);
        }
        return resolved;
    }
}
