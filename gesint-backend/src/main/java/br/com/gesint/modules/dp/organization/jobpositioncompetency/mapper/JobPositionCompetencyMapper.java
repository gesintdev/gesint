package br.com.gesint.modules.dp.organization.jobpositioncompetency.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyRequestDto;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyResponseDto;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetency;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetencyUsageEnum;
import br.com.gesint.modules.rh.person.developmentplan.competency.entity.Competency;

@Component
public class JobPositionCompetencyMapper {

    public JobPositionCompetency toEntity(JobPositionCompetencyRequestDto dto) {
        return JobPositionCompetency.builder()
                .status(StatusEnum.ACTIVE)
                .jobPositionId(dto.getJobPositionId())
                .competencyId(dto.getCompetencyId())
                .expectedLevel(dto.getExpectedLevel())
                .usedIn(copyUsages(dto.getUsedIn()))
                .versionNumber(1)
                .validFrom(dto.getValidFrom())
                .validUntil(dto.getValidUntil())
                .build();
    }

    public void updateEntity(JobPositionCompetency entity, JobPositionCompetencyRequestDto dto) {
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setCompetencyId(dto.getCompetencyId());
        entity.setExpectedLevel(dto.getExpectedLevel());
        entity.setUsedIn(copyUsages(dto.getUsedIn()));
        entity.setValidFrom(dto.getValidFrom());
        entity.setValidUntil(dto.getValidUntil());
    }

    public JobPositionCompetencyResponseDto toResponse(JobPositionCompetency entity, Competency competency) {
        return JobPositionCompetencyResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .jobPositionId(entity.getJobPositionId())
                .companyId(entity.getCompanyId())
                .competencyId(entity.getCompetencyId())
                .competencyName(competency != null ? competency.getName() : null)
                .competencyType(competency != null ? competency.getType() : null)
                .expectedLevel(entity.getExpectedLevel())
                .usedIn(copyUsages(entity.getUsedIn()))
                .versionNumber(entity.getVersionNumber())
                .validFrom(entity.getValidFrom())
                .validUntil(entity.getValidUntil())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static List<JobPositionCompetencyUsageEnum> copyUsages(List<JobPositionCompetencyUsageEnum> source) {
        if (source == null || source.isEmpty()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(source);
    }
}
