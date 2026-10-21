package br.com.gesint.modules.dp.occupationalexam.exam.dto;

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

import br.com.gesint.modules.dp.occupationalexam.complementaryexam.dto.ComplementaryExamRequestDto;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationalExamRegisterResultRequestDto {

    @NotNull private UUID examinerPhysicianId;

    private UUID coordinatorPhysicianId;
    private UUID clinicId;

    @NotNull private LocalDate clinicalExamDate;

    private LocalDate asoIssueDate;

    @NotNull private OccupationalExamResultEnum result;

    private String cid;
    private String clinicalObservations;

    @Builder.Default
    private List<ComplementaryExamRequestDto> complementaryExams = new ArrayList<>();
}
