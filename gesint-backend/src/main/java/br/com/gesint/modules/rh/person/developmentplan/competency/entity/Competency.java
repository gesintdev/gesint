package br.com.gesint.modules.rh.person.developmentplan.competency.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.LinkedHashMap;
import java.util.Map;

import br.com.gesint.core.entity.AuditEntity;
import br.com.gesint.modules.rh.person.developmentplan.entity.CompetencyTypeEnum;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

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

    /** Indicadores observaveis por nivel (chave = "1".."4"). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "level_indicators", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, String> levelIndicators = new LinkedHashMap<>();
}
