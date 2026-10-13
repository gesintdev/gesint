package br.com.gommo.modules.rh.person.experience.dto;

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
public class ExperienceSummaryDto {
    private long inPeriodCount;
    private long pendingDecisionCount;
    private long dueSoonCount;
    private long decidedCount;
}
