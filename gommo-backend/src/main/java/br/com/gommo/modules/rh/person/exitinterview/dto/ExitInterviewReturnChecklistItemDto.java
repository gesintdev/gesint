package br.com.gommo.modules.rh.person.exitinterview.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

import br.com.gommo.modules.rh.person.exitinterview.entity.ReturnItemStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterviewReturnChecklistItemDto {
    @Size(max = 80) private String key;

    @Size(max = 200) private String description;

    private ReturnItemStatusEnum status;
    private LocalDate returnedAt;
    private String notes;
}
