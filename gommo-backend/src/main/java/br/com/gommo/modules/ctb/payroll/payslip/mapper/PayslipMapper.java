package br.com.gommo.modules.ctb.payroll.payslip.mapper;

import br.com.gommo.modules.ctb.payroll.payslip.dto.PayslipRequestDto;
import br.com.gommo.modules.ctb.payroll.payslip.dto.PayslipResponseDto;
import br.com.gommo.modules.ctb.payroll.payslip.entity.Payslip;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class PayslipMapper {

    public Payslip toEntity(PayslipRequestDto dto) {
        return Payslip.builder()
                .payrollRunId(dto.getPayrollRunId())
                .collaboratorId(dto.getCollaboratorId())
                .baseSalary(dto.getBaseSalary())
                .grossAmount(defaultAmount(dto.getGrossAmount()))
                .deductionsAmount(defaultAmount(dto.getDeductionsAmount()))
                .netAmount(defaultAmount(dto.getNetAmount()))
                .generatedAt(dto.getGeneratedAt())
                .build();
    }

    public void updateEntity(Payslip entity, PayslipRequestDto dto) {
        entity.setPayrollRunId(dto.getPayrollRunId());
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getBaseSalary() != null) {
            entity.setBaseSalary(dto.getBaseSalary());
        }
        if (dto.getGrossAmount() != null) {
            entity.setGrossAmount(dto.getGrossAmount());
        }
        if (dto.getDeductionsAmount() != null) {
            entity.setDeductionsAmount(dto.getDeductionsAmount());
        }
        if (dto.getNetAmount() != null) {
            entity.setNetAmount(dto.getNetAmount());
        }
        entity.setGeneratedAt(dto.getGeneratedAt());
    }

    public PayslipResponseDto toResponse(Payslip entity) {
        return PayslipResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .payrollRunId(entity.getPayrollRunId())
                .collaboratorId(entity.getCollaboratorId())
                .baseSalary(entity.getBaseSalary())
                .grossAmount(entity.getGrossAmount())
                .deductionsAmount(entity.getDeductionsAmount())
                .netAmount(entity.getNetAmount())
                .generatedAt(entity.getGeneratedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static BigDecimal defaultAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
