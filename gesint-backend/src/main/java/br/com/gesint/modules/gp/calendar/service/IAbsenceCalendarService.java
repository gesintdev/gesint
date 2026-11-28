package br.com.gesint.modules.gp.calendar.service;

import java.time.LocalDate;

import br.com.gesint.modules.gp.calendar.dto.AbsenceCalendarResponseDto;

public interface IAbsenceCalendarService {
    AbsenceCalendarResponseDto calendar(LocalDate from, LocalDate to);
}
