package br.com.gommo.modules.payroll.mapper;

import br.com.gommo.modules.payroll.dto.PayrollRunRequestDto;
import br.com.gommo.modules.payroll.dto.PayrollRunResponseDto;
import br.com.gommo.modules.payroll.entity.PayrollRun;
import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;
import org.springframework.stereotype.Component;

@Component
public class PayrollRunMapper {

    public PayrollRun toEntity(PayrollRunRequestDto dto) {
        return PayrollRun.builder()
                .companyId(dto.getCompanyId())
                .referenceYear(dto.getReferenceYear())
                .referenceMonth(dto.getReferenceMonth())
                .payrollStatus(dto.getPayrollStatus() != null ? dto.getPayrollStatus() : PayrollStatusEnum.OPEN)
                .openedAt(dto.getOpenedAt())
                .closedAt(dto.getClosedAt())
                .processedAt(dto.getProcessedAt())
                .notes(dto.getNotes())
                .build();
    }

    public void updateEditableFields(PayrollRun entity, PayrollRunRequestDto dto) {
        entity.setCompanyId(dto.getCompanyId());
        entity.setReferenceYear(dto.getReferenceYear());
        entity.setReferenceMonth(dto.getReferenceMonth());
        entity.setNotes(dto.getNotes());
    }

    public void updateEntity(PayrollRun entity, PayrollRunRequestDto dto) {
        updateEditableFields(entity, dto);
    }

    public PayrollRunResponseDto toResponse(PayrollRun entity) {
        return PayrollRunResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .companyId(entity.getCompanyId())
                .referenceYear(entity.getReferenceYear())
                .referenceMonth(entity.getReferenceMonth())
                .payrollStatus(entity.getPayrollStatus())
                .openedAt(entity.getOpenedAt())
                .closedAt(entity.getClosedAt())
                .processedAt(entity.getProcessedAt())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
