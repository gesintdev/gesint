package br.com.gommo.admin.modules.client.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
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
    public void provisionPendingUsers(Client client) {
        if (client.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }
        if (client.getProvisioningStatus() != TenantProvisioningStatusEnum.READY) {
            return;
        }
        if (!StringUtils.hasText(client.getDatabaseSchema())) {
            return;
        }

        List<ClientUser> pending = clientUserRepository.findAllByClientIdAndTenantAppUserIdIsNullAndStatusNot(
                client.getId(), StatusEnum.DELETED);
        for (ClientUser link : pending) {
            provisionUser(client, link);
        }
    }

    @Transactional
    public UUID provisionUser(Client client, ClientUser link) {
        if (link.getTenantAppUserId() != null) {
            return link.getTenantAppUserId();
        }
        if (!StringUtils.hasText(link.getUsername())
                || !StringUtils.hasText(link.getEmail())
                || !StringUtils.hasText(link.getPasswordHash())) {
            throw new IllegalStateException("Usuario de cliente incompleto para provisionamento: " + link.getId());
        }

        String schema = TenantSchemaProvisioner.requireSafeSchema(client.getDatabaseSchema());
        UUID userId = UUID.randomUUID();

        Integer nextCode = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(code), 0) + 1 FROM \"" + schema + "\".app_user", Integer.class);

        jdbcTemplate.update(
                """
                INSERT INTO "%s".app_user (
                    id, status, username, email, password_hash, must_change_pwd, code, created_at, updated_at
                ) VALUES (?, 'ACTIVE', ?, ?, ?, true, ?, now(), now())
                """
                        .formatted(schema),
                userId,
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

    public void deactivateTenantUser(Client client, UUID tenantAppUserId) {
        if (tenantAppUserId == null || client.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }
        if (!StringUtils.hasText(client.getDatabaseSchema())) {
            return;
        }

        String schema = TenantSchemaProvisioner.requireSafeSchema(client.getDatabaseSchema());
        jdbcTemplate.update(
                """
                UPDATE "%s".app_user
                SET status = 'DELETED', updated_at = now()
                WHERE id = ? AND status <> 'DELETED'
                """
                        .formatted(schema),
                tenantAppUserId);
    }

    public void syncTenantUserCredentials(Client client, ClientUser link) {
        if (link.getTenantAppUserId() == null
                || client.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }
        if (!StringUtils.hasText(client.getDatabaseSchema())) {
            return;
        }

        String schema = TenantSchemaProvisioner.requireSafeSchema(client.getDatabaseSchema());
        jdbcTemplate.update(
                """
                UPDATE "%s".app_user
                SET username = ?, email = ?, password_hash = ?, updated_at = now()
                WHERE id = ? AND status <> 'DELETED'
                """
                        .formatted(schema),
                link.getUsername(),
                link.getEmail(),
                link.getPasswordHash(),
                link.getTenantAppUserId());
    }
}
