package br.com.gommo.modules.ctb.payroll.event.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;

@Getter
@Builder
public class PayrollEventResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String eventCode;
    private final String description;
    private final PayrollEventTypeEnum eventType;
    private final Boolean incidesInss;
    private final Boolean incidesFgts;
    private final Boolean incidesIrrf;
    private final String formula;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
