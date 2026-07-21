package br.com.gommo.modules.dp.organization.workschedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.dp.organization.workschedule.entity.WeekDayEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleDayRequestDto {
    private WeekDayEnum dayOfWeek;
    /** HH:mm */
    private String period1Start;
    private String period1End;
    private String period2Start;
    private String period2End;
}
