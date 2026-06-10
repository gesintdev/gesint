package br.com.gommo.modules.organization.department.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class DepartmentResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID companyId;
    private final UUID parentId;
    private final String name;
    private final String costCenter;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
