package br.com.gommo.modules.rh.person.developmentplan.actiontemplate.entity;

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

import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentActionTypeEnum;

@Entity
@Table(name = "development_action_template")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentActionTemplate extends AuditEntity {

    @Column(name = "competency_id", nullable = false)
    private UUID competencyId;

    @Column(name = "competency_name", length = 200)
    private String competencyName;

    @Column(name = "min_gap", nullable = false)
    private Integer minGap;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "suggested_description", columnDefinition = "TEXT")
    private String suggestedDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 32)
    private DevelopmentActionTypeEnum actionType;

    @Column(name = "suggested_deadline_days")
    private Integer suggestedDeadlineDays;

    @Column(name = "evidence_required", nullable = false)
    private Boolean evidenceRequired;
}
