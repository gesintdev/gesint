package br.com.gesint.modules.dp.occupationalexam.procedure.mapper;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.procedure.dto.EsocialTable27ProcedureRequestDto;
import br.com.gesint.modules.dp.occupationalexam.procedure.dto.EsocialTable27ProcedureResponseDto;
import br.com.gesint.modules.dp.occupationalexam.procedure.entity.EsocialTable27Procedure;

@Component
public class EsocialTable27ProcedureMapper {

    public EsocialTable27Procedure toEntity(EsocialTable27ProcedureRequestDto dto) {
        return EsocialTable27Procedure.builder()
                .status(StatusEnum.ACTIVE)
                .procedureCode(trim(dto.getProcedureCode()))
                .description(trim(dto.getDescription()))
                .active(dto.getActive() != null ? dto.getActive() : Boolean.TRUE)
                .build();
    }

    public void updateEntity(EsocialTable27Procedure entity, EsocialTable27ProcedureRequestDto dto) {
        entity.setProcedureCode(trim(dto.getProcedureCode()));
        entity.setDescription(trim(dto.getDescription()));
        entity.setActive(dto.getActive() != null ? dto.getActive() : Boolean.TRUE);
    }

    public EsocialTable27ProcedureResponseDto toResponse(EsocialTable27Procedure entity) {
        return EsocialTable27ProcedureResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .procedureCode(entity.getProcedureCode())
                .description(entity.getDescription())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
