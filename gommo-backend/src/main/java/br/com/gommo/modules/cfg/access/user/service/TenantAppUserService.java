package br.com.gommo.modules.cfg.access.user.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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

@Service
public class TenantAppUserService implements ITenantAppUserService {

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
        return appUserRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
                .map(user -> mapper.toResponse(user, resolveCollaborator(user.getCollaboratorId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('user:read')")
    public AppUserResponseDto findById(UUID id) {
        AppUser user = findUser(id);
        return mapper.toResponse(user, resolveCollaborator(user.getCollaboratorId()));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto create(AppUserRequestDto request) {
        validateCreate(request);
        Collaborator collaborator = resolveActiveCollaborator(request.getCollaboratorId());
        AppUser user = AppUser.builder()
                .collaboratorId(collaborator.getId())
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(StatusEnum.ACTIVE)
                .mustChangePwd(true)
                .roles(resolveAssignedRoles(request))
                .build();
        AppUser saved = appUserRepository.save(user);
        return mapper.toResponse(saved, collaborator);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto update(UUID id, AppUserRequestDto request) {
        AppUser user = findUser(id);
        validateUpdate(request, id);
        Collaborator collaborator = resolveActiveCollaborator(request.getCollaboratorId());
        user.setCollaboratorId(collaborator.getId());
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        if (StringUtils.hasText(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setMustChangePwd(true);
        }
        user.setRoles(resolveAssignedRoles(request));
        AppUser saved = appUserRepository.save(user);
        return mapper.toResponse(saved, collaborator);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:delete')")
    public void delete(UUID id) {
        AppUser user = findUser(id);
        user.setStatus(StatusEnum.DELETED);
        appUserRepository.save(user);
    }

    private AppUser findUser(UUID id) {
        return appUserRepository
                .findByIdWithRoles(id, StatusEnum.DELETED)
                .orElseThrow(TenantAppUserException::notFound);
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
        if (!StringUtils.hasText(request.getPassword())) {
            throw TenantAppUserException.passwordRequired();
        }
        validateUnique(request, null);
        if (appUserRepository.existsByCollaboratorIdAndStatusNot(request.getCollaboratorId(), StatusEnum.DELETED)) {
            throw TenantAppUserException.collaboratorAlreadyLinked();
        }
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
        if (request.getDpRoleIds() != null) {
            for (UUID roleId : request.getDpRoleIds()) {
                if (roleId != null) {
                    roles.add(loadAssignableRole(roleId, SystemScopeEnum.DP));
                }
            }
        }
        if (request.getRhRoleIds() != null) {
            for (UUID roleId : request.getRhRoleIds()) {
                if (roleId != null) {
                    roles.add(loadAssignableRole(roleId, SystemScopeEnum.RH));
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
