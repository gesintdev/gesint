package br.com.gommo.modules.rh.person.jobvacancycompetency.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.competency.entity.Competency;
import br.com.gommo.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancycompetency.dto.JobVacancyCompetencyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancycompetency.entity.JobVacancyCompetency;

@Component
public class JobVacancyCompetencyMapper {

    public JobVacancyCompetency toEntity(JobVacancyCompetencyRequestDto dto) {
        return JobVacancyCompetency.builder()
                .status(StatusEnum.ACTIVE)
                .jobVacancyId(dto.getJobVacancyId())
                .competencyId(dto.getCompetencyId())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .build();
    }

    public void updateEntity(JobVacancyCompetency entity, JobVacancyCompetencyRequestDto dto) {
        entity.setJobVacancyId(dto.getJobVacancyId());
        entity.setCompetencyId(dto.getCompetencyId());
        if (dto.getDisplayOrder() != null) {
            entity.setDisplayOrder(dto.getDisplayOrder());
        }
    }

    public JobVacancyCompetencyResponseDto toResponse(JobVacancyCompetency entity, Competency competency) {
        return JobVacancyCompetencyResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .jobVacancyId(entity.getJobVacancyId())
                .companyId(entity.getCompanyId())
                .competencyId(entity.getCompetencyId())
                .competencyName(competency != null ? competency.getName() : null)
                .competencyType(competency != null ? competency.getType() : null)
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
