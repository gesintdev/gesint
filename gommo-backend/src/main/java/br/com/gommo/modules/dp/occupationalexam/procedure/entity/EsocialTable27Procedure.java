package br.com.gommo.modules.dp.occupationalexam.procedure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gommo.core.entity.AuditEntity;

/**
 * Tabela 27 do eSocial (procedimentos diagnosticos). Seed via migration;
 * nao e enum fixo no Java.
 */
@Entity
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
