package br.com.gesint.modules.rh.person.collaborators.address.entity;

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
 * Catálogo IBGE compartilhado (não é dado de tenant).
 * Schema {@code public} explícito para search_path fail-closed por tenant.
 */
@Entity
@Table(schema = "public", name = "state")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class State extends AuditEntity {

    @Column(name = "ibge_code", nullable = false, unique = true)
    private Integer ibgeCode;

    @Column(nullable = false, length = 2, unique = true)
    private String abbreviation;

    @Column(nullable = false, length = 100)
    private String name;
}
