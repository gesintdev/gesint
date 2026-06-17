package br.com.gommo.modules.rh.person.leave.dto;

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
public class VacationAbsenceSummaryDto {
    private int unjustifiedAbsences;
    private int justifiedAbsences;
}
