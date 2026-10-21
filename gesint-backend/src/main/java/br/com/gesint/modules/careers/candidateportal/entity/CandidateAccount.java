package br.com.gesint.modules.careers.candidateportal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.AuditEntity;

/**
 * Conta do portal do candidato (D8). Isolada de {@code app_user}: sem RBAC de tenant,
 * sem acesso a dados internos. Preparada para extracao futura para sistema dedicado.
 */
@Entity
@Audited
@Table(name = "candidate_account")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateAccount extends AuditEntity {

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(nullable = false, length = 200)
    private String email;

    @NotAudited
    @Column(name = "password_hash", length = 100)
    private String passwordHash;

    @Column(name = "google_sub", length = 128)
    private String googleSub;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
