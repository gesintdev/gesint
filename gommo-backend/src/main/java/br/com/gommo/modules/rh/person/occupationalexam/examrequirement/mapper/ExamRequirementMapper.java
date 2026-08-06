package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto.ExamRequirementRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto.ExamRequirementResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.entity.ExamRequirement;

@Component
public class ExamRequirementMapper {

    public ExamRequirement toEntity(ExamRequirementRequestDto dto) {
        return ExamRequirement.builder()
                .status(StatusEnum.ACTIVE)
                .jobPositionId(dto.getJobPositionId())
                .examType(dto.getExamType())
                .complementaryProcedureCodes(copyCodes(dto.getComplementaryProcedureCodes()))
                .periodicityMonths(dto.getPeriodicityMonths())
                .riskBasis(blankToNull(dto.getRiskBasis()))
                .versionNumber(1)
                .validFrom(dto.getValidFrom())
                .validUntil(dto.getValidUntil())
                .build();
    }

    public void updateEntity(ExamRequirement entity, ExamRequirementRequestDto dto) {
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setExamType(dto.getExamType());
        entity.setComplementaryProcedureCodes(copyCodes(dto.getComplementaryProcedureCodes()));
        entity.setPeriodicityMonths(dto.getPeriodicityMonths());
        entity.setRiskBasis(blankToNull(dto.getRiskBasis()));
        entity.setValidFrom(dto.getValidFrom());
        entity.setValidUntil(dto.getValidUntil());
    }

    public ExamRequirementResponseDto toResponse(ExamRequirement entity) {
        return ExamRequirementResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .jobPositionId(entity.getJobPositionId())
                .examType(entity.getExamType())
                .complementaryProcedureCodes(copyCodes(entity.getComplementaryProcedureCodes()))
                .periodicityMonths(entity.getPeriodicityMonths())
                .riskBasis(entity.getRiskBasis())
                .versionNumber(entity.getVersionNumber())
                .validFrom(entity.getValidFrom())
                .validUntil(entity.getValidUntil())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static List<String> copyCodes(List<String> source) {
        if (source == null || source.isEmpty()) {
            return new ArrayList<>();
        }
        return source.stream()
                .filter(code -> code != null && !code.isBlank())
                .map(String::trim)
                .toList();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
