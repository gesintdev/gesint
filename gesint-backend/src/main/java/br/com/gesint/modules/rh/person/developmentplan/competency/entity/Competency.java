package br.com.gesint.modules.rh.person.developmentplan.competency.entity;

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

import br.com.gesint.core.entity.AuditEntity;
import br.com.gesint.modules.rh.person.developmentplan.entity.CompetencyTypeEnum;

import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "competency")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Competency extends AuditEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Pergunta-guia sugerida no scorecard de entrevista (RN-10 / RN-36). */
    @Column(name = "interview_guide_question", columnDefinition = "TEXT")
    private String interviewGuideQuestion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CompetencyTypeEnum type;
}
