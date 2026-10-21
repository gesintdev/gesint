package br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import br.com.gesint.modules.rh.person.developmentplan.entity.CompetencyTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewCompetencyDto {

    private UUID competencyId;
    private String competencyName;
    private CompetencyTypeEnum competencyType;
    /** Definição da competência (RN-10). */
    private String description;
    /** Pergunta-guia sugerida na entrevista. */
    private String interviewGuideQuestion;
    private String source;
}
