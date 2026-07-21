package br.com.gommo.modules.dp.organization.workschedule.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

import br.com.gommo.modules.dp.organization.workschedule.entity.WeekDayEnum;

@Getter
@Builder
public class WorkScheduleDayResponseDto {
    private final UUID id;
    private final WeekDayEnum dayOfWeek;
    private final String period1Start;
    private final String period1End;
    private final String period2Start;
    private final String period2End;
    /** HH:mm total dos períodos. */
    private final String totalHours;
    /** Intervalo principal (fim do 1º → início do 2º). */
    private final String mainBreak;
}
