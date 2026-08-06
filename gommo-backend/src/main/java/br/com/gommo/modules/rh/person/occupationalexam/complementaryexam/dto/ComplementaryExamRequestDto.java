package br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.entity.ComplementaryExamResultEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplementaryExamRequestDto {

    @NotNull private UUID occupationalExamId;

    @NotBlank @Size(max = 10) private String procedureCode;

    private LocalDate performedDate;

    private ComplementaryExamResultEnum result;
}
