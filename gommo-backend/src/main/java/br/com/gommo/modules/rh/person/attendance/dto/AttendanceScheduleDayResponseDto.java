package br.com.gommo.modules.rh.person.attendance.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendanceScheduleDayResponseDto {
    private final UUID collaboratorId;
    private final boolean outsideWorkSchedule;
    private final UUID workScheduleId;
    private final String workScheduleName;
}
