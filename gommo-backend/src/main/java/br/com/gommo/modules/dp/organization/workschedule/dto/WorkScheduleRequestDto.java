package br.com.gommo.modules.dp.organization.workschedule.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleRequestDto {
    private String name;
    private String description;
    @Builder.Default
    private List<WorkScheduleDayRequestDto> days = new ArrayList<>();
}
