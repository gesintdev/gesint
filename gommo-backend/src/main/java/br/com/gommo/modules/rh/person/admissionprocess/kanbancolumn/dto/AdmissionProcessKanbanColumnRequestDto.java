package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class AdmissionProcessKanbanColumnRequestDto {

    @NotBlank @Size(max = 80) private String columnKey;

    @NotBlank @Size(max = 120) private String name;

    @Size(max = 7)
    @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$", message = "Cor deve estar no formato #RRGGBB")
    private String color;

    @NotNull private Integer displayOrder;
}
