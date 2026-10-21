package br.com.gesint.modules.root.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import br.com.gesint.core.entity.CodedEntity;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.access.entity.RoleTypeEnum;
import br.com.gesint.modules.cfg.access.entity.SystemScopeEnum;

@Entity
@Audited
@EntityListeners(AuditingEntityListener.class)
@Table(name = "role")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role implements CodedEntity {

    @Id
    private UUID id;

    @Column(nullable = false, updatable = false, unique = true)
    private Integer code;

    @Column(nullable = false, length = 50)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "system_scope_enum")
    @Builder.Default
    private SystemScopeEnum system = SystemScopeEnum.RH;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "status_enum")
    @Builder.Default
    private StatusEnum status = StatusEnum.ACTIVE;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private boolean systemRole = false;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "role_type", nullable = false, columnDefinition = "role_type_enum")
    @Builder.Default
    private RoleTypeEnum roleType = RoleTypeEnum.CUSTOM;

    @CreatedBy
    @Column(name = "created_by")
    private UUID createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedBy
    @Column(name = "updated_by")
    private UUID updatedBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /** Permissao e catalogo seedado (nao auditado); o historico guarda o vinculo em role_permission_aud. */
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "role_permission",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id"))
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();

    /** Perfis que aparecem no cadastro de perfis e podem ser vinculados a usuarios. */
    public boolean isAssignableProfile() {
        return roleType == RoleTypeEnum.ADMIN || roleType == RoleTypeEnum.CUSTOM;
    }

    /** Somente perfis criados pelo cliente podem ser alterados ou excluidos. */
    public boolean isEditableProfile() {
        return roleType == RoleTypeEnum.CUSTOM;
    }

    public boolean isGlobalAdmin() {
        return roleType == RoleTypeEnum.GLOBAL_ADMIN;
    }

    /** Administrador de um unico sistema (acesso total dinamico, sem lista materializada). */
    public boolean isSystemAdmin() {
        return roleType == RoleTypeEnum.ADMIN;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}
