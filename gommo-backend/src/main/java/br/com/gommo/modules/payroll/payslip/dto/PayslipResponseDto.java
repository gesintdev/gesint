package br.com.gommo.modules.payroll.payslip.dto;
import br.com.gommo.core.entity.StatusEnum; import java.math.BigDecimal; import java.time.OffsetDateTime; import java.util.UUID; import lombok.*;
@Getter @Builder
public class PayslipResponseDto {
    private final UUID id; private final Integer code; private final StatusEnum status; private final UUID payrollRunId; private final UUID collaboratorId;
    private final BigDecimal grossAmount; private final BigDecimal deductionsAmount; private final BigDecimal netAmount;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}
