package br.com.gommo.modules.root.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.security.JwtProperties;
import br.com.gommo.core.security.JwtService;
import br.com.gommo.core.tenant.MultiTenantProperties;
import br.com.gommo.core.tenant.PlatformAdminUserLookup;
import br.com.gommo.core.tenant.TenantAuthValidator;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.core.tenant.TenantResolver;
import br.com.gommo.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gommo.modules.root.dto.LoginRequestDto;
import br.com.gommo.modules.root.dto.RefreshTokenRequestDto;
import br.com.gommo.modules.root.dto.TokenResponseDto;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Permission;
import br.com.gommo.modules.root.entity.RefreshToken;
import br.com.gommo.modules.root.entity.RefreshTokenBlacklist;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.exception.AuthException;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.repository.PermissionRepository;
import br.com.gommo.modules.root.repository.RefreshTokenBlacklistRepository;
import br.com.gommo.modules.root.repository.RefreshTokenRepository;

@Service
public class AuthService implements IAuthService {

    private static final ZoneId SESSION_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final long REFRESH_REPLAY_GRACE_SECONDS = 30;

    private final AppUserRepository appUserRepository;
    private final PermissionRepository permissionRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final EmploymentContractRepository contractRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenBlacklistRepository blacklistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final MultiTenantProperties multiTenantProperties;
    private final TenantAuthValidator tenantAuthValidator;
    private final TenantResolver tenantResolver;
    private final PlatformAdminUserLookup platformAdminUserLookup;

    public AuthService(
            AppUserRepository appUserRepository,
            PermissionRepository permissionRepository,
            CollaboratorRepository collaboratorRepository,
            AdmissionProcessRepository admissionProcessRepository,
            EmploymentContractRepository contractRepository,
            DepartmentRepository departmentRepository,
            JobPositionRepository jobPositionRepository,
            RefreshTokenRepository refreshTokenRepository,
            RefreshTokenBlacklistRepository blacklistRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtProperties jwtProperties,
            MultiTenantProperties multiTenantProperties,
            TenantAuthValidator tenantAuthValidator,
            TenantResolver tenantResolver,
            PlatformAdminUserLookup platformAdminUserLookup) {
        this.appUserRepository = appUserRepository;
        this.permissionRepository = permissionRepository;
        this.collaboratorRepository = collaboratorRepository;
        this.admissionProcessRepository = admissionProcessRepository;
        this.contractRepository = contractRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.blacklistRepository = blacklistRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.multiTenantProperties = multiTenantProperties;
        this.tenantAuthValidator = tenantAuthValidator;
        this.tenantResolver = tenantResolver;
        this.platformAdminUserLookup = platformAdminUserLookup;
    }

    @Override
    @Transactional
    public TokenResponseDto login(LoginRequestDto request) {
        resolveTenantFromCompanyCode(request);

        String login = request.getUsername() != null ? request.getUsername().trim() : "";
        if (!StringUtils.hasText(login)) {
            throw new BadCredentialsException("Invalid credentials");
        }

        AppUser user = appUserRepository
                .findActiveByLogin(login, StatusEnum.DELETED)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        assertLoginAllowed(user.getId(), user.getUsername());

        user.setLastLogin(OffsetDateTime.now());
        appUserRepository.save(user);

        return buildTokenResponse(user);
    }

    @Override
    @Transactional
    public TokenResponseDto refresh(RefreshTokenRequestDto request) {
        String rawRefresh = request.getRefreshToken();
        if (!jwtService.isRefreshToken(rawRefresh)) {
            throw AuthException.invalidRefresh();
        }

        OffsetDateTime now = OffsetDateTime.now();
        String tokenHash = hashToken(rawRefresh);
        RefreshTokenBlacklist blacklisted = blacklistRepository.findByTokenHash(tokenHash).orElse(null);
        boolean replayGrace = isWithinReplayGrace(blacklisted, now);
        if (blacklisted != null && !replayGrace) {
            throw AuthException.revokedRefresh();
        }

        RefreshToken stored = refreshTokenRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(AuthException::invalidRefresh);

        if (stored.isRevoked() && !replayGrace) {
            blacklisted = blacklistRepository.findByTokenHash(tokenHash).orElse(null);
            replayGrace = isWithinReplayGrace(blacklisted, now);
            if (!replayGrace) {
                throw AuthException.revokedRefresh();
            }
        }

        if (stored.getExpiresAt().isBefore(now)) {
            throw AuthException.expiredRefresh();
        }

        UUID userId = jwtService.extractUserId(rawRefresh);
        if (multiTenantProperties.isEnabled()) {
            UUID tokenTenantId = jwtService.extractTenantId(rawRefresh).orElse(null);
            try {
                tenantAuthValidator.assertTokenMatchesCurrentTenant(tokenTenantId, userId);
            } catch (RuntimeException ex) {
                throw AuthException.invalidRefresh();
            }
        }

        AppUser user = appUserRepository
                .findActiveByIdWithRoles(userId, StatusEnum.DELETED)
                .orElseThrow(AuthException::userNotFound);

        assertTenantUserAccess(user.getId());

        if (stored.isRevoked()) {
            return buildTokenResponse(user);
        }

        if (shouldRotateRefreshToken(stored, now)) {
            revokeRefreshToken(stored, tokenHash, now);
            return buildTokenResponse(user);
        }

        return buildTokenResponse(user, rawRefresh);
    }

    private void resolveTenantFromCompanyCode(LoginRequestDto request) {
        if (!multiTenantProperties.isEnabled() || !StringUtils.hasText(request.getCompanyCode())) {
            return;
        }

        TenantContext tenant = tenantResolver
                .resolveByMobileLoginCode(request.getCompanyCode())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        TenantContextHolder.set(tenant);
    }

    private TokenResponseDto buildTokenResponse(AppUser user) {
        return buildTokenResponse(user, null);
    }

    private TokenResponseDto buildTokenResponse(AppUser user, String reusableRefreshToken) {
        List<String> permissions = resolvePermissions(user);
        UUID tenantId = null;
        String tenantSlug = null;
        if (multiTenantProperties.isEnabled()) {
            TenantContext tenant = TenantContextHolder.require();
            if (!tenant.isPlatformAccess()) {
                tenantId = tenant.clientId();
                tenantSlug = tenant.slug();
            }
        }

        String accessToken =
                jwtService.generateAccessToken(user.getId(), user.getUsername(), permissions, tenantId, tenantSlug);
        String refreshToken = reusableRefreshToken;
        if (refreshToken == null) {
            refreshToken = jwtService.generateRefreshToken(user.getId(), tenantId, tenantSlug);
            persistRefreshToken(user.getId(), refreshToken);
        }

        boolean platformAdmin =
                multiTenantProperties.isEnabled() && platformAdminUserLookup.isPlatformAdmin(user.getUsername());
        CollaboratorOrganizationSnapshot organization = resolveCollaboratorOrganization(user);

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInSeconds(jwtProperties.accessTokenMinutes() * 60)
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .tenantSlug(tenantSlug)
                .collaboratorId(organization.collaboratorId)
                .photoObjectId(organization.photoObjectId)
                .jobPositionId(organization.jobPositionId)
                .jobPositionName(organization.jobPositionName)
                .departmentId(organization.departmentId)
                .departmentName(organization.departmentName)
                .permissions(permissions)
                .platformAdmin(platformAdmin)
                .build();
    }

    private void assertLoginAllowed(UUID userId, String username) {
        if (!multiTenantProperties.isEnabled()) {
            return;
        }
        try {
            tenantAuthValidator.assertLoginAllowed(userId, username);
        } catch (RuntimeException ex) {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    private void assertTenantUserAccess(UUID userId) {
        if (!multiTenantProperties.isEnabled()) {
            return;
        }
        try {
            tenantAuthValidator.assertUserBelongsToCurrentTenant(userId);
        } catch (RuntimeException ex) {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    private List<String> resolvePermissions(AppUser user) {
        boolean isAdmin = user.getRoles().stream()
                .filter(role -> role.getStatus() == StatusEnum.ACTIVE)
                .anyMatch(role -> role.isSystemRole() && "ADMIN".equalsIgnoreCase(role.getName()));
        if (isAdmin) {
            return permissionRepository.findAll().stream()
                    .map(Permission::getAuthority)
                    .distinct()
                    .sorted()
                    .toList();
        }

        List<String> permissions = user.getRoles().stream()
                .filter(role -> role.getStatus() == StatusEnum.ACTIVE)
                .map(Role::getPermissions)
                .flatMap(java.util.Set::stream)
                .map(Permission::getAuthority)
                .distinct()
                .toList();

        if (user.getCollaboratorId() == null) {
            return permissions;
        }

        List<String> mobilePermissions = new ArrayList<>(permissions);
        mobilePermissions.add("attendance:write");
        mobilePermissions.add("storage:write");
        mobilePermissions.add("notification:read");
        mobilePermissions.add("notification:write");
        return mobilePermissions.stream().distinct().toList();
    }

    private CollaboratorOrganizationSnapshot resolveCollaboratorOrganization(AppUser user) {
        if (user.getCollaboratorId() == null) {
            return CollaboratorOrganizationSnapshot.empty();
        }

        CollaboratorOrganizationSnapshot snapshot = new CollaboratorOrganizationSnapshot();
        collaboratorRepository
                .findByIdAndStatusNot(user.getCollaboratorId(), StatusEnum.DELETED)
                .ifPresentOrElse(
                        collaborator -> {
                            snapshot.collaboratorId = collaborator.getId();
                            snapshot.photoObjectId = collaborator.getPhotoObjectId();
                        },
                        () -> snapshot.collaboratorId = null);
        if (snapshot.collaboratorId == null) {
            return snapshot;
        }

        contractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
                        snapshot.collaboratorId, StatusEnum.DELETED)
                .ifPresent(contract -> applyContract(snapshot, contract));
        latestCompletedAdmission(snapshot.collaboratorId)
                .ifPresent(admission -> applyAdmissionFallback(snapshot, admission));
        resolveOrganizationNames(snapshot);
        return snapshot;
    }

    private void applyContract(CollaboratorOrganizationSnapshot snapshot, EmploymentContract contract) {
        if (contract.getJobPositionId() != null) {
            snapshot.jobPositionId = contract.getJobPositionId();
        }
    }

    private Optional<AdmissionProcess> latestCompletedAdmission(UUID collaboratorId) {
        return admissionProcessRepository
                .findByCollaboratorIdAndAdmissionStatusAndStatusNot(
                        collaboratorId, AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED)
                .stream()
                .max(Comparator.comparing((AdmissionProcess admission) -> {
                            java.time.LocalDate date = admission.getContractStartDate() != null
                                    ? admission.getContractStartDate()
                                    : admission.getExpectedStartDate();
                            return date == null ? java.time.LocalDate.MIN : date;
                        })
                        .thenComparing(admission ->
                                admission.getCreatedAt() == null ? OffsetDateTime.MIN : admission.getCreatedAt()));
    }

    private void applyAdmissionFallback(CollaboratorOrganizationSnapshot snapshot, AdmissionProcess admission) {
        if (snapshot.jobPositionId != null) {
            return;
        }
        snapshot.jobPositionId = admission.getJobPositionId();
        if (snapshot.departmentId == null) {
            snapshot.departmentId = admission.getDepartmentId();
        }
    }

    private void resolveOrganizationNames(CollaboratorOrganizationSnapshot snapshot) {
        if (snapshot.jobPositionId != null) {
            jobPositionRepository
                    .findByIdAndStatusNot(snapshot.jobPositionId, StatusEnum.DELETED)
                    .ifPresent(jobPosition -> applyJobPosition(snapshot, jobPosition));
        }
        if (snapshot.departmentId != null) {
            departmentRepository
                    .findByIdAndStatusNot(snapshot.departmentId, StatusEnum.DELETED)
                    .ifPresent(department -> snapshot.departmentName = department.getName());
        }
    }

    private void applyJobPosition(CollaboratorOrganizationSnapshot snapshot, JobPosition jobPosition) {
        snapshot.jobPositionName = jobPosition.getTitle();
        if (snapshot.departmentId == null) {
            snapshot.departmentId = jobPosition.getDepartmentId();
        }
    }

    private static final class CollaboratorOrganizationSnapshot {
        private UUID collaboratorId;
        private UUID photoObjectId;
        private UUID jobPositionId;
        private String jobPositionName;
        private UUID departmentId;
        private String departmentName;

        private static CollaboratorOrganizationSnapshot empty() {
            return new CollaboratorOrganizationSnapshot();
        }
    }

    private void persistRefreshToken(UUID userId, String rawToken) {
        OffsetDateTime now = OffsetDateTime.now();
        refreshTokenRepository.save(RefreshToken.builder()
                .userId(userId)
                .tokenHash(hashToken(rawToken))
                .expiresAt(nextSessionBoundary())
                .revoked(false)
                .createdAt(now)
                .build());
    }

    private boolean shouldRotateRefreshToken(RefreshToken refreshToken, OffsetDateTime now) {
        OffsetDateTime rotationAt = refreshToken.getCreatedAt().plusMinutes(jwtProperties.refreshTokenRotationMinutes());
        return !now.isBefore(rotationAt);
    }

    private boolean isWithinReplayGrace(RefreshTokenBlacklist blacklisted, OffsetDateTime now) {
        if (blacklisted == null) {
            return false;
        }
        return !now.isAfter(blacklisted.getRevokedAt().plusSeconds(REFRESH_REPLAY_GRACE_SECONDS));
    }

    private void revokeRefreshToken(RefreshToken stored, String tokenHash, OffsetDateTime now) {
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        blacklistRepository.save(RefreshTokenBlacklist.builder()
                .tokenHash(tokenHash)
                .revokedAt(now)
                .build());
    }

    private OffsetDateTime nextSessionBoundary() {
        return ZonedDateTime.now(SESSION_ZONE)
                .toLocalDate()
                .plusDays(1)
                .atStartOfDay(SESSION_ZONE)
                .toOffsetDateTime();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
