package br.com.gommo.admin.modules.clientuser.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "client_user")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClientUser extends AuditEntity {

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "tenant_app_user_id")
    private UUID tenantAppUserId;

    @Column(length = 100)
    private String username;

    @Column(length = 200)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "access_token_hash", length = 64)
    private String accessTokenHash;

    @Column(name = "first_access_completed", nullable = false)
    @Builder.Default
    private boolean firstAccessCompleted = false;

    @Column(name = "display_name", length = 200)
    private String displayName;

    @Column(name = "provisioned_at")
    private OffsetDateTime provisionedAt;
}
