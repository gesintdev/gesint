package br.com.gommo.modules.payroll.payslip.mapper;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.payroll.payslip.dto.*;
import br.com.gommo.modules.payroll.payslip.entity.Payslip;

@Component
public class PayslipMapper {
    public Payslip toEntity(PayslipRequestDto dto) {
        return Payslip.builder()
                .payrollRunId(dto.getPayrollRunId())
                .collaboratorId(dto.getCollaboratorId())
                .grossAmount(dto.getGrossAmount() != null ? dto.getGrossAmount() : BigDecimal.ZERO)
                .deductionsAmount(dto.getDeductionsAmount() != null ? dto.getDeductionsAmount() : BigDecimal.ZERO)
                .netAmount(dto.getNetAmount() != null ? dto.getNetAmount() : BigDecimal.ZERO)
                .build();
    }

    public void updateEntity(Payslip entity, PayslipRequestDto dto) {
        entity.setPayrollRunId(dto.getPayrollRunId());
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getGrossAmount() != null) entity.setGrossAmount(dto.getGrossAmount());
        if (dto.getDeductionsAmount() != null) entity.setDeductionsAmount(dto.getDeductionsAmount());
        if (dto.getNetAmount() != null) entity.setNetAmount(dto.getNetAmount());
    }

    public PayslipResponseDto toResponse(Payslip entity) {
        return PayslipResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .payrollRunId(entity.getPayrollRunId())
                .collaboratorId(entity.getCollaboratorId())
                .grossAmount(entity.getGrossAmount())
                .deductionsAmount(entity.getDeductionsAmount())
                .netAmount(entity.getNetAmount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
