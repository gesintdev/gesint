package br.com.gesint.modules.gp.report.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TimeStatusReportResponseDto {
    private final TimeStatusMetricEnum metric;
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final int totalMinutes;
    private final List<Row> rows;

    @Getter
    @Builder
    public static class Row {
        /** Chave estavel da linha (colaborador ou colaborador + dia). */
        private final String id;
        private final UUID collaboratorId;
        private final String collaboratorName;
        private final String jobTitle;
        private final String departmentName;
        private final LocalDate date;
        private final LocalTime clockIn;
        private final LocalTime clockOut;
        private final LocalTime scheduledStart;
        /** Minutos da metrica (trabalhado, atraso, intervalo, descanso, hora extra). */
        private final int minutes;
        private final int expectedMinutes;
        /** Quantidade de dias quando a linha resume o periodo. */
        private final int days;
        /** Percentual (absenteismo). */
        private final Double percent;
    }
}
