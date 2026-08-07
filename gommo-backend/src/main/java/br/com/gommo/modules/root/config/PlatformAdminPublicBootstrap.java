package br.com.gommo.modules.root.config;

import java.util.HashSet;
import java.util.Set;
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

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.repository.RoleRepository;

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
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String fullName;
    private final String email;
    private final String password;

    public PlatformAdminPublicBootstrap(
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            @Value("${gommo.platform-admin.username:admGommo}") String username,
            @Value("${gommo.platform-admin.full-name:Administrador Gommo}") String fullName,
            @Value("${gommo.platform-admin.email:gommo.admin@gmail.com}") String email,
            @Value("${gommo.platform-admin.password:}") String password) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(password)) {
            log.warn(
                    "gommo.platform-admin.password nao configurado; usuario {} nao sera criado em public.app_user. "
                            + "Defina GOMMO_PLATFORM_ADMIN_PASSWORD ou DEV_ADMIN_PASSWORD.",
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

        Set<Role> roles = new HashSet<>(user.getRoles());
        if (!roles.contains(adminRole)) {
            roles.add(adminRole);
            user.setRoles(roles);
            changed = true;
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
                .roles(Set.of(adminRole))
                .build();
        appUserRepository.save(admin);
        log.info("Usuario sudo da plataforma criado em public.app_user (username={})", username);
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
