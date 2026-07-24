package br.com.gommo.admin.modules.adminuser.entity;

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

import br.com.gommo.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "admin_user")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUser extends AuditEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "access_token_hash", length = 64)
    private String accessTokenHash;

    @Column(name = "first_access_completed", nullable = false)
    @Builder.Default
    private boolean firstAccessCompleted = false;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "last_login")
    private OffsetDateTime lastLogin;
}
