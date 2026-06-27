package br.com.gommo.modules.rh.person.exitinterview.dto;

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
public class ExitInterviewCancelRequestDto {
    @Size(max = 1000)
    private String reason;
}