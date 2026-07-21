package br.com.gommo.modules.dp.organization.workschedule.dto;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class WorkScheduleResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String name;
    private final String description;
    @Builder.Default
    private final List<WorkScheduleDayResponseDto> days = new ArrayList<>();
    /** Soma semanal HH:mm. */
    private final String weeklyTotalHours;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
