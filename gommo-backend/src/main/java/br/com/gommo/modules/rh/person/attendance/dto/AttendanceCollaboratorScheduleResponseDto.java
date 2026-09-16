package br.com.gommo.modules.rh.person.attendance.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.dp.organization.workschedule.entity.WeekDayEnum;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendanceCollaboratorScheduleResponseDto {
    private final UUID collaboratorId;
    private final UUID workScheduleId;
    private final String workScheduleName;
    /** Fallback textual da admissão quando não há escala (ex.: "44h"). */
    private final String workloadSchedule;
    /** Jornada diária de fallback (carga textual ÷ 5 ou valor fixo). */
    private final BigDecimal fallbackDailyHours;
    @Builder.Default
    private final List<DayHours> days = new ArrayList<>();

    @Getter
    @Builder
    public static class DayHours {
        private final WeekDayEnum dayOfWeek;
        private final BigDecimal expectedHours;
    }
}
