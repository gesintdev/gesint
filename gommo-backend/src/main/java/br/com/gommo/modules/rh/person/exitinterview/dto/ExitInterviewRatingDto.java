package br.com.gommo.modules.rh.person.exitinterview.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ExitInterviewRatingDto {
    @Size(max = 80, message = "Chave da avaliação deve ter no máximo 80 caracteres.") private String key;

    @Size(max = 120, message = "Rótulo da avaliação deve ter no máximo 120 caracteres.") private String label;

    @Min(value = 1, message = "Avaliação da empresa deve ser entre 1 e 5 estrelas.") @Max(value = 5, message = "Avaliação da empresa deve ser entre 1 e 5 estrelas.") private Integer score;
}
