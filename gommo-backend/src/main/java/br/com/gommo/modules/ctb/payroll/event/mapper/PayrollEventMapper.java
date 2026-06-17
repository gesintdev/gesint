package br.com.gommo.modules.ctb.payroll.event.mapper;

import br.com.gommo.modules.ctb.payroll.event.dto.PayrollEventRequestDto;
import br.com.gommo.modules.ctb.payroll.event.dto.PayrollEventResponseDto;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEvent;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;
import org.springframework.stereotype.Component;

@Component
public class PayrollEventMapper {

    public PayrollEvent toEntity(PayrollEventRequestDto dto) {
        return PayrollEvent.builder()
                .eventCode(dto.getEventCode())
                .description(dto.getDescription())
                .eventType(dto.getEventType() != null ? dto.getEventType() : PayrollEventTypeEnum.EARNING)
                .incidesInss(Boolean.TRUE.equals(dto.getIncidesInss()))
                .incidesFgts(Boolean.TRUE.equals(dto.getIncidesFgts()))
                .incidesIrrf(Boolean.TRUE.equals(dto.getIncidesIrrf()))
                .formula(dto.getFormula())
                .build();
    }

    public void updateEntity(PayrollEvent entity, PayrollEventRequestDto dto) {
        entity.setEventCode(dto.getEventCode());
        entity.setDescription(dto.getDescription());
        if (dto.getEventType() != null) {
            entity.setEventType(dto.getEventType());
        }
        if (dto.getIncidesInss() != null) {
            entity.setIncidesInss(dto.getIncidesInss());
        }
        if (dto.getIncidesFgts() != null) {
            entity.setIncidesFgts(dto.getIncidesFgts());
        }
        if (dto.getIncidesIrrf() != null) {
            entity.setIncidesIrrf(dto.getIncidesIrrf());
        }
        entity.setFormula(dto.getFormula());
    }

    public PayrollEventResponseDto toResponse(PayrollEvent entity) {
        return PayrollEventResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .eventCode(entity.getEventCode())
                .description(entity.getDescription())
                .eventType(entity.getEventType())
                .incidesInss(entity.getIncidesInss())
                .incidesFgts(entity.getIncidesFgts())
                .incidesIrrf(entity.getIncidesIrrf())
                .formula(entity.getFormula())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
