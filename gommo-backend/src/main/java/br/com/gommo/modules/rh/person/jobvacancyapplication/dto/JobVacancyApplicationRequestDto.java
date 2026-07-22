package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationRequestDto {
    @NotNull
    private UUID jobVacancyId;

    @NotNull
    private UUID candidateId;

    private JobVacancyApplicationStatusEnum applicationStatus;

    private OffsetDateTime appliedAt;

    @Size(max = 80)
    private String kanbanColumnKey;
}
