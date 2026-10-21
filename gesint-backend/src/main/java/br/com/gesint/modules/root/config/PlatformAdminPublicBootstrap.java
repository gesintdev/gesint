package br.com.gesint.modules.root.config;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.root.entity.AppUser;
import br.com.gesint.modules.root.entity.Role;
import br.com.gesint.modules.root.entity.UserRoleAssignment;
import br.com.gesint.modules.root.repository.AppUserRepository;
import br.com.gesint.modules.root.repository.RoleRepository;
import br.com.gesint.modules.root.repository.UserRoleAssignmentRepository;

/**
 * Sync fino do sudo da plataforma em public.app_user para boot/testes sem o admin-backend.
 * A fonte canonica permanece no PlatformAdminBootstrap do admin-backend.
 */
@Component
public class PlatformAdminPublicBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlatformAdminPublicBootstrap.class);
    private static final UUID ADMIN_ROLE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final String LEGACY_ADMIN_USERNAME = "admin";

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final UserRoleAssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String fullName;
    private final String email;
    private final String password;
    private final boolean publicLoginEnabled;

    public PlatformAdminPublicBootstrap(
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            UserRoleAssignmentRepository assignmentRepository,
            PasswordEncoder passwordEncoder,
            @Value("${gesint.platform-admin.username:admGesint}") String username,
            @Value("${gesint.platform-admin.full-name:Administrador Gesint}") String fullName,
            @Value("${gesint.platform-admin.email:flavio.henrique.dev@gmail.com}") String email,
            @Value("${gesint.platform-admin.password:}") String password,
            @Value("${gesint.multi-tenant.public-login-enabled:false}") boolean publicLoginEnabled) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.assignmentRepository = assignmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.publicLoginEnabled = publicLoginEnabled;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!publicLoginEnabled) {
            log.info(
                    "gesint.multi-tenant.public-login-enabled=false; bootstrap de {} em public.app_user ignorado.",
                    username);
            return;
        }
        if (!StringUtils.hasText(password)) {
            log.warn(
                    "gesint.platform-admin.password nao configurado; usuario {} nao sera criado em public.app_user. "
                            + "Defina GESINT_PLATFORM_ADMIN_PASSWORD ou DEV_ADMIN_PASSWORD.",
                    username);
            return;
        }

        Role adminRole = roleRepository.findById(ADMIN_ROLE_ID).orElseThrow();

        appUserRepository
                .findActiveByUsername(username, StatusEnum.DELETED)
                .ifPresentOrElse(user -> syncAdmin(user, adminRole), () -> createAdmin(adminRole));

        deactivateLegacyAdmin();
    }

    private void syncAdmin(AppUser user, Role adminRole) {
        boolean changed = false;

        if (user.getStatus() != StatusEnum.ACTIVE) {
            user.setStatus(StatusEnum.ACTIVE);
            changed = true;
        }

        if (assignAdminRole(user.getId(), adminRole)) {
            log.warn(
                    "Usuario '{}' existia sem role ADMIN; role vinculada. Faca login novamente para atualizar o token.",
                    user.getUsername());
        }

        if (!fullName.equals(user.getName())) {
            user.setName(fullName);
            changed = true;
        }
        if (!email.equalsIgnoreCase(user.getEmail())) {
            user.setEmail(email);
            changed = true;
        }

        if (!StringUtils.hasText(user.getPasswordHash())
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setAccessTokenHash(null);
            user.setFirstAccessCompleted(true);
            changed = true;
            log.warn("Usuario '{}' sincronizado com a senha do bootstrap da plataforma.", user.getUsername());
        }

        if (!user.isFirstAccessCompleted()) {
            user.setFirstAccessCompleted(true);
            changed = true;
        }

        if (changed) {
            appUserRepository.save(user);
        } else {
            log.info("Usuario sudo da plataforma ja existe em public.app_user (username={})", username);
        }
    }

    private void createAdmin(Role adminRole) {
        AppUser admin = AppUser.builder()
                .username(username)
                .name(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .firstAccessCompleted(true)
                .status(StatusEnum.ACTIVE)
                .build();
        AppUser saved = appUserRepository.save(admin);
        assignAdminRole(saved.getId(), adminRole);
        log.info("Usuario sudo da plataforma criado em public.app_user (username={})", username);
    }

    /**
     * O admin da plataforma nao pertence a nenhuma filial: o vinculo nasce com {@code companyId}
     * nulo, que {@code BranchAccessResolver} interpreta como "vale em todas".
     */
    private boolean assignAdminRole(UUID userId, Role adminRole) {
        boolean alreadyAssigned = assignmentRepository.findAllByUserId(userId).stream()
                .anyMatch(assignment -> adminRole.getId().equals(assignment.getRoleId()));
        if (alreadyAssigned) {
            return false;
        }
        assignmentRepository.save(UserRoleAssignment.builder()
                .userId(userId)
                .roleId(adminRole.getId())
                .companyId(null)
                .build());
        return true;
    }

    private void deactivateLegacyAdmin() {
        if (username.equalsIgnoreCase(LEGACY_ADMIN_USERNAME)) {
            return;
        }
        appUserRepository
                .findActiveByUsername(LEGACY_ADMIN_USERNAME, StatusEnum.DELETED)
                .ifPresent(user -> {
                    user.setStatus(StatusEnum.INACTIVE);
                    user.setPasswordHash(null);
                    user.setAccessTokenHash(null);
                    appUserRepository.save(user);
                    log.info("Usuario legado admin desativado em public.app_user");
                });
    }
}
