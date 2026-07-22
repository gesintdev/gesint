package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import jakarta.validation.constraints.Size;
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
public class JobVacancyApplicationKanbanColumnRequestDto {

    @Size(max = 80)
    private String kanbanColumnKey;
}
