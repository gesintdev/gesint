package br.com.gommo.modules.ctb.payroll.payslip.entry.mapper;

import br.com.gommo.modules.ctb.payroll.payslip.entry.dto.PayslipEntryRequestDto;
import br.com.gommo.modules.ctb.payroll.payslip.entry.dto.PayslipEntryResponseDto;
import br.com.gommo.modules.ctb.payroll.payslip.entry.entity.PayslipEntry;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class PayslipEntryMapper {

    public PayslipEntry toEntity(PayslipEntryRequestDto dto) {
        BigDecimal quantity = dto.getQuantity() != null ? dto.getQuantity() : BigDecimal.ONE;
        BigDecimal unitValue = defaultAmount(dto.getUnitValue());
        BigDecimal totalValue = dto.getTotalValue() != null ? dto.getTotalValue() : quantity.multiply(unitValue);
        return PayslipEntry.builder()
                .payslipId(dto.getPayslipId())
                .payrollEventId(dto.getPayrollEventId())
                .quantity(quantity)
                .unitValue(unitValue)
                .totalValue(totalValue)
                .build();
    }

    public void updateEntity(PayslipEntry entity, PayslipEntryRequestDto dto) {
        entity.setPayslipId(dto.getPayslipId());
        entity.setPayrollEventId(dto.getPayrollEventId());
        if (dto.getQuantity() != null) {
            entity.setQuantity(dto.getQuantity());
        }
        if (dto.getUnitValue() != null) {
            entity.setUnitValue(dto.getUnitValue());
        }
        if (dto.getTotalValue() != null) {
            entity.setTotalValue(dto.getTotalValue());
        } else if (dto.getQuantity() != null || dto.getUnitValue() != null) {
            entity.setTotalValue(entity.getQuantity().multiply(entity.getUnitValue()));
        }
    }

    public PayslipEntryResponseDto toResponse(PayslipEntry entity) {
        return PayslipEntryResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .payslipId(entity.getPayslipId())
                .payrollEventId(entity.getPayrollEventId())
                .quantity(entity.getQuantity())
                .unitValue(entity.getUnitValue())
                .totalValue(entity.getTotalValue())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static BigDecimal defaultAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
