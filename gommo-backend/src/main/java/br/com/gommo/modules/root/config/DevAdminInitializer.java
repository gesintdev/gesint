package br.com.gommo.modules.root.config;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.entity.Role;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.repository.RoleRepository;

@Component
@Profile({"dev", "test"})
public class DevAdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAdminInitializer.class);
    private static final UUID ADMIN_ROLE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String devAdminUsername;
    private final String devAdminPassword;

    public DevAdminInitializer(
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            @Value("${gommo.dev.admin-username:admin}") String devAdminUsername,
            @Value("${gommo.dev.admin-password:}") String devAdminPassword) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.devAdminUsername = devAdminUsername;
        this.devAdminPassword = devAdminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(devAdminPassword)) {
            log.warn("gommo.dev.admin-password nao configurado; usuario admin de desenvolvimento nao sera criado. "
                    + "Defina DEV_ADMIN_PASSWORD (veja .env.example).");
            return;
        }

        Role adminRole = roleRepository.findById(ADMIN_ROLE_ID).orElseThrow();

        appUserRepository
                .findActiveByUsername(devAdminUsername, StatusEnum.DELETED)
                .ifPresentOrElse(user -> ensureAdminRole(user, adminRole), () -> createAdmin(adminRole));
    }

    private void ensureAdminRole(AppUser user, Role adminRole) {
        Set<Role> roles = new HashSet<>(user.getRoles());
        if (roles.contains(adminRole)) {
            return;
        }
        roles.add(adminRole);
        user.setRoles(roles);
        appUserRepository.save(user);
        log.warn(
                "Usuario '{}' existia sem role ADMIN; role vinculada. Faca login novamente para atualizar o token.",
                user.getUsername());
    }

    private void createAdmin(Role adminRole) {
        AppUser admin = AppUser.builder()
                .username(devAdminUsername)
                .email("admin@gommo.local")
                .passwordHash(passwordEncoder.encode(devAdminPassword))
                .status(StatusEnum.ACTIVE)
                .roles(Set.of(adminRole))
                .build();
        appUserRepository.save(admin);
        log.info("Usuario admin de desenvolvimento criado (username={})", devAdminUsername);
    }
}
