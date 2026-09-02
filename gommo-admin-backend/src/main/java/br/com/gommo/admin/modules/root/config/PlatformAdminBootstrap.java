package br.com.gommo.admin.modules.root.config;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.adminuser.entity.AdminUser;
import br.com.gommo.admin.modules.adminuser.repository.AdminUserRepository;

/**
 * Bootstrap idempotente do operador sudo da plataforma (admGommo).
 * Garante admin.admin_user e o espelho em public.app_user para login no Client/dev.
 * Nao provisiona admin.client_user nem schemas tenant_*.
 */
@Component
public class PlatformAdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlatformAdminBootstrap.class);

    private static final String LEGACY_ADMIN_USERNAME = "admin";
    private static final UUID ADMIN_ROLE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final String username;
    private final String fullName;
    private final String email;
    private final String password;

    public PlatformAdminBootstrap(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            @Value("${gommo-admin.platform-admin.username:admGommo}") String username,
            @Value("${gommo-admin.platform-admin.full-name:Administrador Gesint}") String fullName,
            @Value("${gommo-admin.platform-admin.email:gommo.admin@gmail.com}") String email,
            @Value("${gommo-admin.platform-admin.password:}") String password) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
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
                    "gommo-admin.platform-admin.password nao configurado; usuario {} nao sera criado. "
                            + "Defina GOMMO_PLATFORM_ADMIN_PASSWORD ou DEV_ADMIN_PASSWORD.",
                    username);
            return;
        }

        String passwordHash = passwordEncoder.encode(password);
        ensureAdminUser(passwordHash);
        ensurePublicAppUser(passwordHash);
        deactivateLegacyAdmin();
    }

    private void ensureAdminUser(String passwordHash) {
        adminUserRepository
                .findActiveByUsername(username, StatusEnum.DELETED)
                .ifPresentOrElse(
                        user -> syncAdminUser(user, passwordHash),
                        () -> createAdminUser(passwordHash));
    }

    private void createAdminUser(String passwordHash) {
        AdminUser admin = AdminUser.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordHash)
                .firstAccessCompleted(true)
                .status(StatusEnum.ACTIVE)
                .build();
        adminUserRepository.save(admin);
        log.info("Usuario sudo da plataforma criado em admin.admin_user (username={})", username);
    }

    private void syncAdminUser(AdminUser user, String passwordHash) {
        boolean changed = false;

        if (user.getStatus() != StatusEnum.ACTIVE) {
            user.setStatus(StatusEnum.ACTIVE);
            changed = true;
        }
        if (!fullName.equals(user.getFullName())) {
            user.setFullName(fullName);
            changed = true;
        }
        if (!email.equalsIgnoreCase(user.getEmail())) {
            user.setEmail(email);
            changed = true;
        }
        if (!StringUtils.hasText(user.getPasswordHash())
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            user.setPasswordHash(passwordHash);
            user.setAccessTokenHash(null);
            changed = true;
        }
        if (!user.isFirstAccessCompleted()) {
            user.setFirstAccessCompleted(true);
            changed = true;
        }

        if (changed) {
            adminUserRepository.save(user);
            log.info("Usuario sudo da plataforma sincronizado em admin.admin_user (username={})", username);
        } else {
            log.info("Usuario sudo da plataforma ja existe em admin.admin_user (username={})", username);
        }
    }

    private void ensurePublicAppUser(String passwordHash) {
        if (!publicAppUserTableExists()) {
            log.warn(
                    "Tabela public.app_user indisponivel; espelho do usuario {} no Client nao foi criado. "
                            + "Suba o gommo-backend (migrations public) e reinicie o admin.",
                    username);
            return;
        }

        try {
            UUID existingId = findPublicAppUserId(username);
            if (existingId == null) {
                createPublicAppUser(passwordHash);
            } else {
                syncPublicAppUser(existingId, passwordHash);
                ensurePublicAdminRole(existingId);
            }
        } catch (DataAccessException ex) {
            log.warn(
                    "Falha ao sincronizar espelho public.app_user para {}: {}",
                    username,
                    ex.getMessage());
        }
    }

    private boolean publicAppUserTableExists() {
        try {
            Boolean exists = jdbcTemplate.queryForObject(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'app_user'
                    )
                    """,
                    Boolean.class);
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            return false;
        }
    }

    private UUID findPublicAppUserId(String targetUsername) {
        return jdbcTemplate.query(
                """
                SELECT id
                FROM public.app_user
                WHERE LOWER(username) = LOWER(?)
                  AND status::text <> 'DELETED'
                LIMIT 1
                """,
                rs -> rs.next() ? (UUID) rs.getObject("id") : null,
                targetUsername);
    }

    private void createPublicAppUser(String passwordHash) {
        Integer nextCode = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(code), 0) + 1 FROM public.app_user", Integer.class);
        UUID userId = UUID.randomUUID();
        jdbcTemplate.update(
                """
                INSERT INTO public.app_user (
                    id, status, name, username, email, password_hash, access_token_hash,
                    first_access_completed, code, created_at, updated_at
                ) VALUES (?, 'ACTIVE', ?, ?, ?, ?, NULL, TRUE, ?, now(), now())
                """,
                userId,
                fullName,
                username,
                email,
                passwordHash,
                nextCode);
        ensurePublicAdminRole(userId);
        log.info("Usuario sudo espelhado em public.app_user (username={})", username);
    }

    private void syncPublicAppUser(UUID userId, String passwordHash) {
        String currentHash = jdbcTemplate.query(
                "SELECT password_hash FROM public.app_user WHERE id = ?",
                rs -> rs.next() ? rs.getString("password_hash") : null,
                userId);
        boolean passwordMatches =
                StringUtils.hasText(currentHash) && passwordEncoder.matches(password, currentHash);

        jdbcTemplate.update(
                """
                UPDATE public.app_user
                SET status = 'ACTIVE',
                    name = ?,
                    email = ?,
                    password_hash = ?,
                    access_token_hash = CASE WHEN ? THEN access_token_hash ELSE NULL END,
                    first_access_completed = TRUE,
                    updated_at = now()
                WHERE id = ?
                """,
                fullName,
                email,
                passwordMatches ? currentHash : passwordHash,
                passwordMatches,
                userId);
        log.info("Usuario sudo sincronizado em public.app_user (username={})", username);
    }

    private void ensurePublicAdminRole(UUID userId) {
        if (userId == null) {
            return;
        }
        Integer linked = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(1)
                FROM public.user_role
                WHERE user_id = ? AND role_id = ?
                """,
                Integer.class,
                userId,
                ADMIN_ROLE_ID);
        if (linked != null && linked > 0) {
            return;
        }
        jdbcTemplate.update(
                "INSERT INTO public.user_role (user_id, role_id) VALUES (?, ?)", userId, ADMIN_ROLE_ID);
    }

    private void deactivateLegacyAdmin() {
        adminUserRepository
                .findActiveByUsername(LEGACY_ADMIN_USERNAME, StatusEnum.DELETED)
                .ifPresent(user -> {
                    if (username.equalsIgnoreCase(LEGACY_ADMIN_USERNAME)) {
                        return;
                    }
                    user.setStatus(StatusEnum.INACTIVE);
                    user.setPasswordHash(null);
                    user.setAccessTokenHash(null);
                    adminUserRepository.save(user);
                    log.info("Usuario legado admin desativado em admin.admin_user");
                });

        if (!publicAppUserTableExists()) {
            return;
        }
        try {
            int updated = jdbcTemplate.update(
                    """
                    UPDATE public.app_user
                    SET status = 'INACTIVE',
                        password_hash = NULL,
                        access_token_hash = NULL,
                        updated_at = now()
                    WHERE LOWER(username) = LOWER(?)
                      AND status::text <> 'DELETED'
                      AND LOWER(username) <> LOWER(?)
                    """,
                    LEGACY_ADMIN_USERNAME,
                    username);
            if (updated > 0) {
                log.info("Usuario legado admin desativado em public.app_user");
            }
        } catch (DataAccessException ex) {
            log.debug("Nao foi possivel desativar admin legado em public.app_user: {}", ex.getMessage());
        }
    }
}
