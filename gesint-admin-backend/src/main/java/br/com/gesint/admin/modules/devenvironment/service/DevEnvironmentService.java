package br.com.gesint.admin.modules.devenvironment.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gesint.admin.core.entity.StatusEnum;
import br.com.gesint.admin.modules.adminuser.entity.AdminUser;
import br.com.gesint.admin.modules.adminuser.repository.AdminUserRepository;
import br.com.gesint.admin.modules.devenvironment.dto.DevEnvironmentResponseDto;
import br.com.gesint.admin.modules.devenvironment.dto.DevEnvironmentUserUpdateRequestDto;
import br.com.gesint.admin.modules.devenvironment.exception.DevEnvironmentException;

/**
 * Unico ponto de edicao do usuario de desenvolvimento da plataforma (admGesint).
 * Disponivel apenas com {@code gesint-admin.dev-environment.enabled=true}.
 */
@Service
public class DevEnvironmentService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final boolean enabled;
    private final String platformUsername;

    public DevEnvironmentService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            @Value("${gesint-admin.dev-environment.enabled:false}") boolean enabled,
            @Value("${gesint-admin.platform-admin.username:admGesint}") String platformUsername) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.enabled = enabled;
        this.platformUsername = platformUsername;
    }

    public boolean isEnabled() {
        return enabled;
    }

    @Transactional(readOnly = true)
    public DevEnvironmentResponseDto get() {
        assertEnabled();
        AdminUser user = requirePlatformUser();
        return DevEnvironmentResponseDto.builder()
                .enabled(true)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .publicAppUserMirrored(publicAppUserExists(user.getUsername()))
                .build();
    }

    @Transactional
    public DevEnvironmentResponseDto update(DevEnvironmentUserUpdateRequestDto request) {
        assertEnabled();
        AdminUser user = requirePlatformUser();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());

        String passwordHash = null;
        if (StringUtils.hasText(request.getNewPassword())) {
            passwordHash = passwordEncoder.encode(request.getNewPassword().trim());
            user.setPasswordHash(passwordHash);
            user.setAccessTokenHash(null);
            user.setFirstAccessCompleted(true);
        }
        adminUserRepository.save(user);

        if (publicAppUserTableExists()) {
            syncPublicMirror(user, passwordHash);
        }
        return get();
    }

    private void assertEnabled() {
        if (!enabled) {
            throw DevEnvironmentException.disabled();
        }
    }

    private AdminUser requirePlatformUser() {
        return adminUserRepository
                .findActiveByUsername(platformUsername, StatusEnum.DELETED)
                .orElseThrow(DevEnvironmentException::userNotFound);
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

    private boolean publicAppUserExists(String username) {
        if (!publicAppUserTableExists()) {
            return false;
        }
        try {
            Boolean exists = jdbcTemplate.queryForObject(
                    """
                    SELECT EXISTS (
                        SELECT 1 FROM public.app_user
                        WHERE LOWER(username) = LOWER(?) AND status::text <> 'DELETED'
                    )
                    """,
                    Boolean.class,
                    username);
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            return false;
        }
    }

    private void syncPublicMirror(AdminUser user, String passwordHashOrNull) {
        try {
            UUID existingId = jdbcTemplate.query(
                    """
                    SELECT id FROM public.app_user
                    WHERE LOWER(username) = LOWER(?) AND status::text <> 'DELETED'
                    LIMIT 1
                    """,
                    rs -> rs.next() ? (UUID) rs.getObject("id") : null,
                    user.getUsername());
            if (existingId == null) {
                return;
            }
            if (passwordHashOrNull != null) {
                jdbcTemplate.update(
                        """
                        UPDATE public.app_user
                        SET name = ?, email = ?, password_hash = ?, access_token_hash = NULL,
                            first_access_completed = TRUE, status = 'ACTIVE', updated_at = now()
                        WHERE id = ?
                        """,
                        user.getFullName(),
                        user.getEmail(),
                        passwordHashOrNull,
                        existingId);
            } else {
                jdbcTemplate.update(
                        """
                        UPDATE public.app_user
                        SET name = ?, email = ?, status = 'ACTIVE', updated_at = now()
                        WHERE id = ?
                        """,
                        user.getFullName(),
                        user.getEmail(),
                        existingId);
            }
        } catch (DataAccessException ignored) {
            // Espelho e best-effort; Admin permanece fonte canonica.
        }
    }
}
