package br.com.gommo.modules.ctb.payroll.tax.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.ctb.payroll.tax.dto.*;
import br.com.gommo.modules.ctb.payroll.tax.entity.TaxObligation;
import br.com.gommo.modules.ctb.payroll.tax.entity.TaxObligationTypeEnum;

@Component
public class TaxObligationMapper {
    public TaxObligation toEntity(TaxObligationRequestDto dto) {
        return TaxObligation.builder()
                .collaboratorId(dto.getCollaboratorId())
                .obligationType(dto.getObligationType() != null ? dto.getObligationType() : TaxObligationTypeEnum.IRRF)
                .referenceCode(dto.getReferenceCode())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .baseAmount(dto.getBaseAmount())
                .ratePercent(dto.getRatePercent())
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(TaxObligation entity, TaxObligationRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getObligationType() != null) entity.setObligationType(dto.getObligationType());
        entity.setReferenceCode(dto.getReferenceCode());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setBaseAmount(dto.getBaseAmount());
        entity.setRatePercent(dto.getRatePercent());
        entity.setNotes(dto.getNotes());
    }

    public TaxObligationResponseDto toResponse(TaxObligation entity) {
        return TaxObligationResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .obligationType(entity.getObligationType())
                .referenceCode(entity.getReferenceCode())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .baseAmount(entity.getBaseAmount())
                .ratePercent(entity.getRatePercent())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
