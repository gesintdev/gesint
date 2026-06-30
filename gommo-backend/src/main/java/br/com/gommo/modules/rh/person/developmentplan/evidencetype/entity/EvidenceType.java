package br.com.gommo.modules.rh.person.developmentplan.evidencetype.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "evidence_type")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceType extends AuditEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "requires_file", nullable = false)
    private Boolean requiresFile;

    @Column(name = "allows_link", nullable = false)
    private Boolean allowsLink;
}
