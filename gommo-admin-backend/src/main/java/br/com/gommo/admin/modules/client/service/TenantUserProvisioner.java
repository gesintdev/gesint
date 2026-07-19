package br.com.gommo.admin.modules.client.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;
import br.com.gommo.admin.modules.clientuser.entity.ClientUser;
import br.com.gommo.admin.modules.clientuser.repository.ClientUserRepository;

@Service
public class TenantUserProvisioner {

    private static final UUID ADMIN_ROLE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final JdbcTemplate jdbcTemplate;
    private final ClientUserRepository clientUserRepository;

    public TenantUserProvisioner(JdbcTemplate jdbcTemplate, ClientUserRepository clientUserRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.clientUserRepository = clientUserRepository;
    }

    @Transactional
    public void provisionPendingUsers(UUID clientId, ClientEnvironmentConfig config) {
        if (config.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }
        if (config.getProvisioningStatus() != TenantProvisioningStatusEnum.READY) {
            return;
        }
        if (!StringUtils.hasText(config.getDatabaseSchema())) {
            return;
        }

        List<ClientUser> pending = clientUserRepository.findAllByClientIdAndTenantAppUserIdIsNullAndStatusNot(
                clientId, StatusEnum.DELETED);
        for (ClientUser link : pending) {
            provisionUser(config, link);
        }
    }

    @Transactional
    public UUID provisionUser(ClientEnvironmentConfig config, ClientUser link) {
        if (link.getTenantAppUserId() != null) {
            return link.getTenantAppUserId();
        }
        if (!StringUtils.hasText(link.getUsername())
                || !StringUtils.hasText(link.getEmail())
                || !StringUtils.hasText(link.getPasswordHash())) {
            throw new IllegalStateException("Usuario de cliente incompleto para provisionamento: " + link.getId());
        }

        String schema = TenantSchemaProvisioner.requireSafeSchema(config.getDatabaseSchema());
        UUID userId = UUID.randomUUID();

        Integer nextCode = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(code), 0) + 1 FROM \"" + schema + "\".app_user", Integer.class);

        String displayName = StringUtils.hasText(link.getDisplayName()) ? link.getDisplayName().trim() : link.getUsername();
        jdbcTemplate.update(
                """
                INSERT INTO "%s".app_user (
                    id, status, name, username, email, password_hash, must_change_pwd, code, created_at, updated_at
                ) VALUES (?, 'ACTIVE', ?, ?, ?, ?, true, ?, now(), now())
                """
                        .formatted(schema),
                userId,
                displayName,
                link.getUsername(),
                link.getEmail(),
                link.getPasswordHash(),
                nextCode);

        jdbcTemplate.update(
                "INSERT INTO \"%s\".user_role (user_id, role_id) VALUES (?, ?)".formatted(schema),
                userId,
                ADMIN_ROLE_ID);

        link.setTenantAppUserId(userId);
        link.setProvisionedAt(OffsetDateTime.now());
        clientUserRepository.save(link);
        return userId;
    }

    public void deactivateTenantUser(ClientEnvironmentConfig config, UUID tenantAppUserId) {
        if (tenantAppUserId == null
                || config == null
                || config.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }
        if (!StringUtils.hasText(config.getDatabaseSchema())) {
            return;
        }

        String schema = TenantSchemaProvisioner.requireSafeSchema(config.getDatabaseSchema());
        jdbcTemplate.update(
                """
                UPDATE "%s".app_user
                SET status = 'DELETED', updated_at = now()
                WHERE id = ? AND status <> 'DELETED'
                """
                        .formatted(schema),
                tenantAppUserId);
    }

    public void syncTenantUserCredentials(ClientEnvironmentConfig config, ClientUser link) {
        if (link.getTenantAppUserId() == null
                || config == null
                || config.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }
        if (!StringUtils.hasText(config.getDatabaseSchema())) {
            return;
        }

        String schema = TenantSchemaProvisioner.requireSafeSchema(config.getDatabaseSchema());
        String displayName = StringUtils.hasText(link.getDisplayName()) ? link.getDisplayName().trim() : link.getUsername();
        jdbcTemplate.update(
                """
                UPDATE "%s".app_user
                SET name = ?, username = ?, email = ?, password_hash = ?, updated_at = now()
                WHERE id = ? AND status <> 'DELETED'
                """
                        .formatted(schema),
                displayName,
                link.getUsername(),
                link.getEmail(),
                link.getPasswordHash(),
                link.getTenantAppUserId());
    }
}
