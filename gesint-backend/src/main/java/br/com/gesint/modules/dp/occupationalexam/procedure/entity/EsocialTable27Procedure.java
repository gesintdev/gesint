package br.com.gesint.modules.dp.occupationalexam.procedure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gesint.core.entity.AuditEntity;

import org.hibernate.envers.Audited;

/**
 * Tabela 27 do eSocial (procedimentos diagnosticos). Seed via migration;
 * nao e enum fixo no Java.
 */
@Entity
@Audited
@Table(name = "esocial_table27_procedure")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EsocialTable27Procedure extends AuditEntity {

    @Column(name = "procedure_code", nullable = false, unique = true, length = 10)
    private String procedureCode;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false)
    private Boolean active;
}
