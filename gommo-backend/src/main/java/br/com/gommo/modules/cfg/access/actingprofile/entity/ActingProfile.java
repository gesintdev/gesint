package br.com.gommo.modules.cfg.access.actingprofile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

@Entity
@Table(name = "acting_profile")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ActingProfile extends AuditEntity {

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "system_scope_enum")
    private SystemScopeEnum system;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "data_scope", nullable = false, columnDefinition = "data_scope_enum")
    private DataScopeEnum dataScope;

    /** Referencia opcional (ex.: departamento quando data_scope = DEPARTMENT). */
    @Column(name = "scope_ref")
    private UUID scopeRef;
}
