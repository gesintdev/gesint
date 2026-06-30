package br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.entity;

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
@Table(name = "proficiency_level")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProficiencyLevel extends AuditEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "level_order", nullable = false)
    private Integer levelOrder;

    @Column(nullable = false)
    private Integer weight;
}
