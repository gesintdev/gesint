package br.com.gommo.modules.cfg.access.user.service;

import java.security.SecureRandom;
import java.util.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.cfg.access.user.dto.AppUserRequestDto;
import br.com.gommo.modules.cfg.access.user.dto.AppUserResponseDto;
import br.com.gommo.modules.cfg.access.user.exception.TenantAppUserException;
import br.com.gommo.modules.cfg.access.user.mapper.TenantAppUserMapper;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.repository.RoleRepository;
import br.com.gommo.modules.root.security.SystemAdminUsers;

@Service
public class TenantAppUserService implements ITenantAppUserService {

    private static final String TEMP_PASSWORD_ALPHABET =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final int TEMP_PASSWORD_LENGTH = 12;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final TenantAppUserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public TenantAppUserService(
        AppUserRepository appUserRepository,
        RoleRepository roleRepository,
        CollaboratorRepository collaboratorRepository,
        TenantAppUserMapper mapper,
        PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.collaboratorRepository = collaboratorRepository;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('user:read')")
    public List<AppUserResponseDto> findAll() {
        boolean viewerIsSystemAdmin = currentUserIsSystemAdmin();
        return appUserRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
            .filter(user -> viewerIsSystemAdmin || !SystemAdminUsers.isSystemAdmin(user))
            .map(user -> mapper.toResponse(user, resolveCollaborator(user.getCollaboratorId())))
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('user:read')")
    public AppUserResponseDto findById(UUID id) {
        AppUser user = findVisibleUser(id);
        return mapper.toResponse(user, resolveCollaborator(user.getCollaboratorId()));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto create(AppUserRequestDto request) {
        validateCreate(request);
        Collaborator collaborator = resolveActiveCollaborator(request.getCollaboratorId());
        assertCollaboratorNotLinkedToSystemAdmin(collaborator.getId());
        String temporaryPassword = generateTemporaryPassword();
        AppUser user = AppUser.builder()
            .collaboratorId(collaborator.getId())
            .username(request.getUsername().trim())
            .name(Objects.isNull(request.getName()) ? collaborator.getFullName() : request.getName().trim())
            .email(request.getEmail().trim().toLowerCase())
            .passwordHash(passwordEncoder.encode(temporaryPassword))
            .status(StatusEnum.ACTIVE)
            .mustChangePwd(true)
            .roles(resolveAssignedRoles(request))
            .build();
        AppUser saved = appUserRepository.save(user);
        AppUserResponseDto response = mapper.toResponse(saved, collaborator);
        response.setTemporaryPassword(temporaryPassword);
        return response;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto update(UUID id, AppUserRequestDto request) {
        AppUser user = findUser(id);
        assertMutableUser(user);
        validateUpdate(request, id);
        Collaborator collaborator = resolveActiveCollaborator(request.getCollaboratorId());
        assertCollaboratorNotLinkedToSystemAdmin(collaborator.getId());
        user.setCollaboratorId(collaborator.getId());
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setRoles(resolveAssignedRoles(request));
        AppUser saved = appUserRepository.save(user);
        return mapper.toResponse(saved, collaborator);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto resetPassword(UUID id) {
        AppUser user = findUser(id);
        assertMutableUser(user);
        String temporaryPassword = generateTemporaryPassword();
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setMustChangePwd(true);
        AppUser saved = appUserRepository.save(user);
        AppUserResponseDto response = mapper.toResponse(saved, resolveCollaborator(saved.getCollaboratorId()));
        response.setTemporaryPassword(temporaryPassword);
        return response;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:delete')")
    public void delete(UUID id) {
        AppUser user = findUser(id);
        assertMutableUser(user);
        user.setStatus(StatusEnum.DELETED);
        appUserRepository.save(user);
    }

    private AppUser findVisibleUser(UUID id) {
        AppUser user = findUser(id);
        if (SystemAdminUsers.isSystemAdmin(user) && !currentUserIsSystemAdmin()) {
            throw TenantAppUserException.notFound();
        }
        return user;
    }

    private AppUser findUser(UUID id) {
        return appUserRepository
            .findByIdWithRoles(id, StatusEnum.DELETED)
            .orElseThrow(TenantAppUserException::notFound);
    }

    private void assertMutableUser(AppUser user) {
        if (SystemAdminUsers.isSystemAdmin(user)) {
            throw TenantAppUserException.systemAdminImmutable();
        }
    }

    private void assertCollaboratorNotLinkedToSystemAdmin(UUID collaboratorId) {
        List<UUID> adminCollaboratorIds =
            appUserRepository.findCollaboratorIdsLinkedToSystemAdmin(StatusEnum.DELETED);
        if (adminCollaboratorIds.contains(collaboratorId)) {
            throw TenantAppUserException.notFound();
        }
    }

    private boolean currentUserIsSystemAdmin() {
        return SystemAdminUsers.currentUserId()
            .flatMap(id -> appUserRepository.findByIdWithRoles(id, StatusEnum.DELETED))
            .map(SystemAdminUsers::isSystemAdmin)
            .orElse(false);
    }

    private Collaborator resolveActiveCollaborator(UUID collaboratorId) {
        return collaboratorRepository
            .findByIdAndStatusNot(collaboratorId, StatusEnum.DELETED)
            .orElseThrow(TenantAppUserException::notFound);
    }

    private Collaborator resolveCollaborator(UUID collaboratorId) {
        if (collaboratorId == null) {
            return null;
        }
        return collaboratorRepository.findById(collaboratorId).orElse(null);
    }

    private void validateCreate(AppUserRequestDto request) {
        validateUnique(request, null);
        if (appUserRepository.existsByCollaboratorIdAndStatusNot(request.getCollaboratorId(), StatusEnum.DELETED)) {
            throw TenantAppUserException.collaboratorAlreadyLinked();
        }
    }

    private String generateTemporaryPassword() {
        StringBuilder password = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            password.append(TEMP_PASSWORD_ALPHABET.charAt(SECURE_RANDOM.nextInt(TEMP_PASSWORD_ALPHABET.length())));
        }
        return password.toString();
    }

    private void validateUpdate(AppUserRequestDto request, UUID id) {
        validateUnique(request, id);
        if (appUserRepository.existsByCollaboratorIdAndIdNotAndStatusNot(
            request.getCollaboratorId(), id, StatusEnum.DELETED)) {
            throw TenantAppUserException.collaboratorAlreadyLinked();
        }
    }

    private void validateUnique(AppUserRequestDto request, UUID excludeId) {
        if (excludeId == null) {
            if (appUserRepository.existsByUsername(request.getUsername().trim())) {
                throw TenantAppUserException.duplicateUsername();
            }
            if (appUserRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
                throw TenantAppUserException.duplicateEmail();
            }
            return;
        }
        if (appUserRepository.existsByUsernameAndIdNot(request.getUsername().trim(), excludeId)) {
            throw TenantAppUserException.duplicateUsername();
        }
        if (appUserRepository.existsByEmailAndIdNot(request.getEmail().trim().toLowerCase(), excludeId)) {
            throw TenantAppUserException.duplicateEmail();
        }
    }

    private Set<Role> resolveAssignedRoles(AppUserRequestDto request) {
        Set<Role> roles = new HashSet<>();
        Map<SystemScopeEnum, List<UUID>> roleIdsBySystem = request.getRoleIdsBySystem();
        if (roleIdsBySystem == null || roleIdsBySystem.isEmpty()) {
            return roles;
        }
        for (SystemScopeEnum system : SystemScopeEnum.values()) {
            List<UUID> roleIds = roleIdsBySystem.get(system);
            if (roleIds == null) {
                continue;
            }
            for (UUID roleId : roleIds) {
                if (roleId != null) {
                    roles.add(loadAssignableRole(roleId, system));
                }
            }
        }
        return roles;
    }

    private Role loadAssignableRole(UUID roleId, SystemScopeEnum expectedSystem) {
        Role role = roleRepository
            .findByIdWithPermissions(roleId, StatusEnum.DELETED)
            .filter(r -> !r.isSystemRole() && r.getStatus() == StatusEnum.ACTIVE)
            .orElseThrow(TenantAppUserException::invalidRoleForSystem);
        if (role.getSystem() != expectedSystem) {
            throw TenantAppUserException.invalidRoleForSystem();
        }
        return role;
    }
}
