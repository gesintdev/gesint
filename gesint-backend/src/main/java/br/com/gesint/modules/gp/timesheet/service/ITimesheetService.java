package br.com.gesint.modules.gp.timesheet.service;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gesint.modules.gp.timesheet.dto.TimesheetActionRequestDto;
import br.com.gesint.modules.gp.timesheet.dto.TimesheetResponseDto;

public interface ITimesheetService {
    TimesheetResponseDto list(LocalDate from, LocalDate to);

    TimesheetResponseDto.Detail detail(UUID collaboratorId, LocalDate from, LocalDate to);

    TimesheetResponseDto.CloseResult close(TimesheetActionRequestDto request);

    TimesheetResponseDto.Detail reopen(UUID collaboratorId, TimesheetActionRequestDto request);

    byte[] pdf(UUID collaboratorId, LocalDate from, LocalDate to);

    String filename(UUID collaboratorId, LocalDate from, LocalDate to);

    boolean isClosed(UUID collaboratorId, LocalDate date);
}
