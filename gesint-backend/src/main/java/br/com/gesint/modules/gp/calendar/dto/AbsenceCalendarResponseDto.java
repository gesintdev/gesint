package br.com.gesint.modules.gp.calendar.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

/** Agenda de ausencias: ferias, afastamentos e feriados no intervalo. */
@Getter
@Builder
public class AbsenceCalendarResponseDto {
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final List<Event> events;
    private final List<LocalDate> holidays;

    @Getter
    @Builder
    public static class Event {
        private final String id;
        private final UUID collaboratorId;
        private final String collaboratorName;
        /** VACATION ou o tipo do afastamento (LeaveTypeEnum). */
        private final String type;
        /** VACATION, LEAVE ou ABSENCE (falta injustificada). */
        private final String category;
        private final LocalDate startDate;
        private final LocalDate endDate;
    }
}
