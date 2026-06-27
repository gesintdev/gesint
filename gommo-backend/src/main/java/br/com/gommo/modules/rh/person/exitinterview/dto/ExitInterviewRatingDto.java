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
    @Size(max = 80)
    private String key;

    @Size(max = 120)
    private String label;

    @Min(1)
    @Max(5)
    private Integer score;
}