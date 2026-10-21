package br.com.gesint.modules.dp.occupationalexam.exam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationalExamScheduleRequestDto {

    @NotNull private LocalDate scheduledDate;

    private UUID clinicId;
}
