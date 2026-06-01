package br.com.gommo.modules.organization.jobposition.dto;

import br.com.gommo.core.entity.StatusEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPositionResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID departmentId;
    private final String title;
    private final String cboCode;
    private final String description;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
