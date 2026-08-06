package br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto.ComplementaryExamRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto.ComplementaryExamResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.entity.ComplementaryExam;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.entity.ComplementaryExamResultEnum;

@Component
public class ComplementaryExamMapper {

    public ComplementaryExam toEntity(ComplementaryExamRequestDto dto) {
        return ComplementaryExam.builder()
                .status(StatusEnum.ACTIVE)
                .occupationalExamId(dto.getOccupationalExamId())
                .procedureCode(trim(dto.getProcedureCode()))
                .performedDate(dto.getPerformedDate())
                .result(dto.getResult() != null ? dto.getResult() : ComplementaryExamResultEnum.NOT_PERFORMED)
                .build();
    }

    public void updateEntity(ComplementaryExam entity, ComplementaryExamRequestDto dto) {
        entity.setOccupationalExamId(dto.getOccupationalExamId());
        entity.setProcedureCode(trim(dto.getProcedureCode()));
        entity.setPerformedDate(dto.getPerformedDate());
        if (dto.getResult() != null) {
            entity.setResult(dto.getResult());
        }
    }

    public ComplementaryExamResponseDto toResponse(ComplementaryExam entity, boolean includeClinicalResult) {
        return ComplementaryExamResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .occupationalExamId(entity.getOccupationalExamId())
                .procedureCode(entity.getProcedureCode())
                .performedDate(entity.getPerformedDate())
                .result(includeClinicalResult ? entity.getResult() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ComplementaryExamResponseDto toResponse(ComplementaryExam entity) {
        return toResponse(entity, false);
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
