package br.com.gesint.modules.rh.person.attendance.dto;

import java.math.BigDecimal;
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
    /** Jornada esperada do dia a partir da escala da admissão (0 em folga). */
    private final BigDecimal expectedHours;
}
