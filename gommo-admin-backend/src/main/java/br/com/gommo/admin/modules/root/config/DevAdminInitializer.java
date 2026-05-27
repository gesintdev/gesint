package br.com.gommo.admin.modules.root.config;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.adminuser.entity.AdminUser;
import br.com.gommo.admin.modules.adminuser.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Profile({"dev", "test"})
public class DevAdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAdminInitializer.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String devAdminUsername;
    private final String devAdminPassword;

    public DevAdminInitializer(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            @Value("${gommo-admin.dev.admin-username:admin}") String devAdminUsername,
            @Value("${gommo-admin.dev.admin-password:}") String devAdminPassword) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.devAdminUsername = devAdminUsername;
        this.devAdminPassword = devAdminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(devAdminPassword)) {
            log.warn(
                    "gommo-admin.dev.admin-password nao configurado; usuario admin da plataforma nao sera criado.");
            return;
        }

        adminUserRepository
                .findActiveByUsername(devAdminUsername, StatusEnum.DELETED)
                .ifPresentOrElse(
                        user -> log.info("Usuario admin da plataforma ja existe (username={})", user.getUsername()),
                        this::createAdmin);
    }

    private void createAdmin() {
        AdminUser admin = AdminUser.builder()
                .username(devAdminUsername)
                .email("admin@gommo.local")
                .fullName("Administrador da Plataforma")
                .passwordHash(passwordEncoder.encode(devAdminPassword))
                .status(StatusEnum.ACTIVE)
                .build();
        adminUserRepository.save(admin);
        log.info("Usuario admin da plataforma criado (username={})", devAdminUsername);
    }
}
