package br.com.gommo.modules.cfg.access.user.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.branch.BranchException;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.dp.organization.company.repository.CompanyRepository;
import br.com.gommo.modules.cfg.access.user.dto.AppUserRequestDto;
import br.com.gommo.modules.cfg.access.user.dto.AppUserResponseDto;
import br.com.gommo.modules.cfg.access.user.exception.TenantAppUserException;
import br.com.gommo.modules.cfg.access.user.mapper.TenantAppUserMapper;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.entity.UserRoleAssignment;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.repository.RoleRepository;
import br.com.gommo.modules.root.repository.UserRoleAssignmentRepository;
import br.com.gommo.modules.root.security.AccessTokenSupport;
import br.com.gommo.modules.root.security.SystemAdminUsers;

@Service
public class TenantAppUserService implements ITenantAppUserService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final UserRoleAssignmentRepository assignmentRepository;
    private final CompanyRepository companyRepository;
    private final TenantAppUserMapper mapper;

    public TenantAppUserService(
        AppUserRepository appUserRepository,
        RoleRepository roleRepository,
        CollaboratorRepository collaboratorRepository,
        UserRoleAssignmentRepository assignmentRepository,
        CompanyRepository companyRepository,
        TenantAppUserMapper mapper) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.collaboratorRepository = collaboratorRepository;
        this.assignmentRepository = assignmentRepository;
        this.companyRepository = companyRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('user:read')")
    public List<AppUserResponseDto> findAll() {
        return appUserRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
            .filter(user -> !SystemAdminUsers.isSystemAdmin(user))
            .map(user -> mapper.toResponse(
                user, resolveCollaborator(user.getCollaboratorId()), loadRolesByBranch(user.getId())))
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('user:read')")
    public AppUserResponseDto findById(UUID id) {
        AppUser user = findVisibleUser(id);
        return mapper.toResponse(user, resolveCollaborator(user.getCollaboratorId()), loadRolesByBranch(user.getId()));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto create(AppUserRequestDto request) {
        validateCreate(request);
        Collaborator collaborator = resolveActiveCollaborator(request.getCollaboratorId());
        assertCollaboratorNotLinkedToSystemAdmin(collaborator.getId());
        String plainToken = AccessTokenSupport.generatePlainToken();
        AppUser user = AppUser.builder()
            .collaboratorId(collaborator.getId())
            .username(request.getUsername().trim())
            .name(Objects.isNull(request.getName()) ? collaborator.getFullName() : request.getName().trim())
            .email(request.getEmail().trim().toLowerCase())
            .passwordHash(null)
            .accessTokenHash(AccessTokenSupport.hashToken(plainToken))
            .firstAccessCompleted(false)
            .status(StatusEnum.ACTIVE)
            .build();
        AppUser saved = appUserRepository.save(user);
        replaceAssignments(saved, request);
        AppUserResponseDto response = mapper.toResponse(saved, collaborator, loadRolesByBranch(saved.getId()));
        response.setAccessToken(plainToken);
        return response;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto reactivate(AppUserRequestDto request) {
        AppUser user = findDeletedUserForReactivation(request);
        assertMutableUser(user);
        validateUnique(request, user.getId());
        if (appUserRepository.existsByCollaboratorIdAndIdNotAndStatusNot(
            request.getCollaboratorId(), user.getId(), StatusEnum.DELETED)) {
            throw TenantAppUserException.collaboratorAlreadyLinked();
        }
        Collaborator collaborator = resolveActiveCollaborator(request.getCollaboratorId());
        assertCollaboratorNotLinkedToSystemAdmin(collaborator.getId());
        user.setStatus(StatusEnum.ACTIVE);
        user.setCollaboratorId(collaborator.getId());
        user.setUsername(request.getUsername().trim());
        user.setName(Objects.isNull(request.getName()) ? collaborator.getFullName() : request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        AppUser saved = appUserRepository.save(user);
        replaceAssignments(saved, request);
        return mapper.toResponse(saved, collaborator, loadRolesByBranch(saved.getId()));
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
        AppUser saved = appUserRepository.save(user);
        replaceAssignments(saved, request);
        return mapper.toResponse(saved, collaborator, loadRolesByBranch(saved.getId()));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('user:write')")
    public AppUserResponseDto resetPassword(UUID id) {
        AppUser user = findUser(id);
        assertMutableUser(user);
        String plainToken = AccessTokenSupport.generatePlainToken();
        user.setPasswordHash(null);
        user.setAccessTokenHash(AccessTokenSupport.hashToken(plainToken));
        AppUser saved = appUserRepository.save(user);
        AppUserResponseDto response = mapper.toResponse(
            saved, resolveCollaborator(saved.getCollaboratorId()), loadRolesByBranch(saved.getId()));
        response.setAccessToken(plainToken);
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
        if (SystemAdminUsers.isSystemAdmin(user)) {
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

    private void validateUpdate(AppUserRequestDto request, UUID id) {
        validateUnique(request, id);
        if (appUserRepository.existsByCollaboratorIdAndIdNotAndStatusNot(
            request.getCollaboratorId(), id, StatusEnum.DELETED)) {
            throw TenantAppUserException.collaboratorAlreadyLinked();
        }
    }

    private void validateUnique(AppUserRequestDto request, UUID excludeId) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (excludeId == null) {
            appUserRepository
                .findByUsername(username)
                .ifPresent(existing -> {
                    if (existing.getStatus() == StatusEnum.DELETED) {
                        throw TenantAppUserException.deletedUserExists();
                    }
                    throw TenantAppUserException.duplicateUsername();
                });
            appUserRepository
                .findByEmailIgnoreCase(email)
                .ifPresent(existing -> {
                    if (existing.getStatus() == StatusEnum.DELETED) {
                        throw TenantAppUserException.deletedUserExists();
                    }
                    throw TenantAppUserException.duplicateEmail();
                });
            return;
        }

        if (appUserRepository.existsByUsernameAndIdNot(username, excludeId)) {
            throw TenantAppUserException.duplicateUsername();
        }
        if (appUserRepository.existsByEmailAndIdNot(email, excludeId)) {
            throw TenantAppUserException.duplicateEmail();
        }
    }

    private AppUser findDeletedUserForReactivation(AppUserRequestDto request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();
        return appUserRepository
            .findByUsernameAndStatus(username, StatusEnum.DELETED)
            .or(() -> appUserRepository.findByEmailIgnoreCaseAndStatus(email, StatusEnum.DELETED))
            .orElseThrow(TenantAppUserException::notFound);
    }

    /**
     * Regrava os vinculos do usuario a partir do payload filial -> sistema -> perfis.
     *
     * A substituicao e total, como era antes com {@code setRoles}: o que nao vier no payload
     * deixa de valer.
     */
    private void replaceAssignments(AppUser user, AppUserRequestDto request) {
        assignmentRepository.deleteAllByUserId(user.getId());
        assignmentRepository.flush();

        Map<UUID, Map<SystemScopeEnum, List<UUID>>> roleIdsByBranch = request.getRoleIdsByBranch();
        if (roleIdsByBranch == null || roleIdsByBranch.isEmpty()) {
            return;
        }

        Set<UUID> validBranchIds = new HashSet<>(
                companyRepository.findAllByStatusNotOrderBySortOrderAscLegalNameAsc(StatusEnum.DELETED).stream()
                        .map(company -> company.getId())
                        .toList());

        List<UserRoleAssignment> assignments = new ArrayList<>();
        for (Map.Entry<UUID, Map<SystemScopeEnum, List<UUID>>> branchEntry : roleIdsByBranch.entrySet()) {
            UUID branchId = branchEntry.getKey();
            if (branchId == null || !validBranchIds.contains(branchId)) {
                throw BranchException.notFound();
            }
            Map<SystemScopeEnum, List<UUID>> roleIdsBySystem = branchEntry.getValue();
            if (roleIdsBySystem == null) {
                continue;
            }
            for (SystemScopeEnum system : SystemScopeEnum.values()) {
                List<UUID> roleIds = roleIdsBySystem.get(system);
                if (roleIds == null) {
                    continue;
                }
                for (UUID roleId : roleIds) {
                    if (roleId == null) {
                        continue;
                    }
                    Role role = loadAssignableRole(roleId, system);
                    assignments.add(UserRoleAssignment.builder()
                            .userId(user.getId())
                            .roleId(role.getId())
                            .companyId(branchId)
                            .build());
                }
            }
        }
        assignmentRepository.saveAll(assignments);
    }

    private Map<UUID, List<Role>> loadRolesByBranch(UUID userId) {
        List<UserRoleAssignment> assignments = assignmentRepository.findAllByUserId(userId);
        if (assignments.isEmpty()) {
            return Map.of();
        }
        Set<UUID> roleIds = assignments.stream().map(UserRoleAssignment::getRoleId).collect(Collectors.toSet());
        Map<UUID, Role> rolesById = new HashMap<>();
        roleRepository.findAllById(roleIds).forEach(role -> rolesById.put(role.getId(), role));

        Map<UUID, List<Role>> rolesByBranch = new LinkedHashMap<>();
        for (UserRoleAssignment assignment : assignments) {
            Role role = rolesById.get(assignment.getRoleId());
            if (role == null || assignment.getCompanyId() == null) {
                continue;
            }
            rolesByBranch
                    .computeIfAbsent(assignment.getCompanyId(), key -> new ArrayList<>())
                    .add(role);
        }
        return rolesByBranch;
    }

    private Role loadAssignableRole(UUID roleId, SystemScopeEnum expectedSystem) {
        Role role = roleRepository
            .findByIdWithPermissions(roleId, StatusEnum.DELETED)
            .filter(r -> r.isAssignableProfile() && r.getStatus() == StatusEnum.ACTIVE)
            .orElseThrow(TenantAppUserException::invalidRoleForSystem);
        if (role.getSystem() != expectedSystem) {
            throw TenantAppUserException.invalidRoleForSystem();
        }
        return role;
    }
}
