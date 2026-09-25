package br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class JobPositionSalaryTableResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID jobPositionId;
    private final UUID companyId;
    private final String name;
    private final Integer versionNumber;
    private final LocalDate validFrom;
    private final LocalDate validUntil;
    private final List<JobPositionSalaryTableItemResponseDto> items;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
