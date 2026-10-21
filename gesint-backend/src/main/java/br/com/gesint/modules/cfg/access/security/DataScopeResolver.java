package br.com.gesint.modules.cfg.access.security;

import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gesint.core.audit.CurrentAuditor;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.access.actingprofile.entity.ActingProfile;
import br.com.gesint.modules.cfg.access.actingprofile.entity.DataScopeEnum;
import br.com.gesint.modules.cfg.access.actingprofile.repository.ActingProfileRepository;
import br.com.gesint.modules.root.entity.AppUser;
import br.com.gesint.modules.root.entity.UserActingProfileAssignment;
import br.com.gesint.modules.root.repository.AppUserRepository;
import br.com.gesint.modules.root.repository.UserActingProfileAssignmentRepository;

/**
 * Resolve a abrangência efetiva do usuário autenticado (override no vínculo ou template).
 * Usado para filtrar listagens (ex.: vagas ASSIGNED).
 */
@Component
public class DataScopeResolver {

    private final UserActingProfileAssignmentRepository assignmentRepository;
    private final ActingProfileRepository actingProfileRepository;
    private final AppUserRepository appUserRepository;
    private final AccessScopePolicy accessScopePolicy;

    public DataScopeResolver(
            UserActingProfileAssignmentRepository assignmentRepository,
            ActingProfileRepository actingProfileRepository,
            AppUserRepository appUserRepository,
            AccessScopePolicy accessScopePolicy) {
        this.assignmentRepository = assignmentRepository;
        this.actingProfileRepository = actingProfileRepository;
        this.appUserRepository = appUserRepository;
        this.accessScopePolicy = accessScopePolicy;
    }

    public boolean isUnrestricted() {
        return accessScopePolicy.isUnrestricted();
    }

    public Optional<UUID> currentCollaboratorId() {
        return CurrentAuditor.userId().flatMap(appUserRepository::findById).map(AppUser::getCollaboratorId);
    }

    /** Escopos efetivos das atuações do usuário (override ?? template). */
    public Set<DataScopeEnum> effectiveScopes() {
        if (isUnrestricted()) {
            return EnumSet.of(DataScopeEnum.ALL);
        }
        UUID userId = CurrentAuditor.userId().orElse(null);
        if (userId == null) {
            return Set.of();
        }
        List<UserActingProfileAssignment> assignments = assignmentRepository.findAllByUserId(userId);
        if (assignments.isEmpty()) {
            return Set.of();
        }
        Set<UUID> profileIds = new HashSet<>();
        for (UserActingProfileAssignment assignment : assignments) {
            profileIds.add(assignment.getActingProfileId());
        }
        var profilesById = actingProfileRepository.findAllById(profileIds).stream()
                .filter(profile -> profile.getStatus() != StatusEnum.DELETED)
                .collect(java.util.stream.Collectors.toMap(ActingProfile::getId, p -> p, (a, b) -> a));

        EnumSet<DataScopeEnum> scopes = EnumSet.noneOf(DataScopeEnum.class);
        for (UserActingProfileAssignment assignment : assignments) {
            if (assignment.getDataScope() != null) {
                scopes.add(assignment.getDataScope());
                continue;
            }
            ActingProfile profile = profilesById.get(assignment.getActingProfileId());
            if (profile != null && profile.getDataScope() != null) {
                scopes.add(profile.getDataScope());
            }
        }
        return scopes;
    }

    public boolean hasAllScope() {
        return effectiveScopes().contains(DataScopeEnum.ALL) || isUnrestricted();
    }

    public boolean hasAssignedScopeOnly() {
        Set<DataScopeEnum> scopes = effectiveScopes();
        return !scopes.isEmpty()
                && scopes.contains(DataScopeEnum.ASSIGNED)
                && !scopes.contains(DataScopeEnum.ALL);
    }

    public boolean isAssignedToVacancy(
            UUID recruiterId, UUID managerId, List<UUID> interviewerIds, UUID currentCollaboratorId) {
        if (currentCollaboratorId == null) {
            return false;
        }
        if (Objects.equals(currentCollaboratorId, recruiterId)
                || Objects.equals(currentCollaboratorId, managerId)) {
            return true;
        }
        if (interviewerIds == null || interviewerIds.isEmpty()) {
            return false;
        }
        return interviewerIds.stream().anyMatch(id -> Objects.equals(id, currentCollaboratorId));
    }
}
