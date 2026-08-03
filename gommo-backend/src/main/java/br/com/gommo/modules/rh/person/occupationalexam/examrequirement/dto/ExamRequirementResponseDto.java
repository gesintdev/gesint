package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamTypeEnum;

@Getter
@Builder
public class ExamRequirementResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID jobPositionId;
    private final OccupationalExamTypeEnum examType;
    private final List<String> complementaryProcedureCodes;
    private final Integer periodicityMonths;
    private final String riskBasis;
    private final Integer versionNumber;
    private final LocalDate validFrom;
    private final LocalDate validUntil;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
