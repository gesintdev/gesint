package br.com.gommo.modules.dp.occupationalexam.physician.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.occupationalexam.physician.entity.OccupationalPhysicianRoleEnum;

@Getter
@Builder
public class OccupationalPhysicianResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String fullName;
    private final String crm;
    private final String crmState;
    private final OccupationalPhysicianRoleEnum role;
    private final List<UUID> clinicIds;
    private final String phone;
    private final String email;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
