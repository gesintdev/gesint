package br.com.gesint.modules.dp.organization.cbo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gesint.core.entity.AuditEntity;

/**
 * Catálogo CBO compartilhado (não é dado de tenant).
 * Schema {@code public} explícito para search_path fail-closed por tenant.
 */
@Entity
@Table(schema = "public", name = "cbo_occupation")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CboOccupation extends AuditEntity {

    @Column(name = "cbo_code", nullable = false, unique = true, length = 6)
    private String cboCode;

    @Column(nullable = false, length = 255)
    private String name;
}
