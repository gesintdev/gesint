package br.com.gesint.modules.gp.timesheet.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Fechar (lista de colaboradores; vazia = todos) ou reabrir (um colaborador + motivo). */
@Getter
@Setter
public class TimesheetActionRequestDto {
    @NotNull
    private LocalDate from;

    @NotNull
    private LocalDate to;

    private List<UUID> collaboratorIds;

    @Size(max = 1000)
    private String reason;
}
