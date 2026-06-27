package br.com.gommo.modules.rh.person.exitinterview.returnchecklist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ExitInterviewReturnChecklistConfigRequestDto {

    @NotBlank
    @Size(max = 80)
    private String itemKey;

    @NotBlank
    @Size(max = 160)
    private String description;

    @NotNull
    private Integer displayOrder;
}
