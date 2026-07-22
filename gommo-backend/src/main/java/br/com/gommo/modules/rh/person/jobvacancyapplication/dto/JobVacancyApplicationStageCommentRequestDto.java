package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import jakarta.validation.constraints.NotBlank;
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
public class JobVacancyApplicationStageCommentRequestDto {

    @NotBlank
    @Size(max = 80)
    private String columnKey;

    /** Texto do comentario. Em branco remove o comentario da etapa. */
    @Size(max = 4000)
    private String text;
}
