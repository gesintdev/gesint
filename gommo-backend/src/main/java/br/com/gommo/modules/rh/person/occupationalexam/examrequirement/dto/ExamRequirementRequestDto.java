package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequirementRequestDto {

    @NotNull private UUID jobPositionId;

    @NotNull private OccupationalExamTypeEnum examType;

    @Builder.Default
    private List<String> complementaryProcedureCodes = new ArrayList<>();

    private Integer periodicityMonths;

    private String riskBasis;

    @NotNull private LocalDate validFrom;

    private LocalDate validUntil;
}
