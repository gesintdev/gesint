package br.com.gesint.modules.gp.hourbank.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HourBankResponseDto {
    private final boolean enabled;
    private final LocalDate accrualStart;
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final List<Row> rows;

    @Getter
    @Builder
    public static class Row {
        private final String id;
        private final UUID collaboratorId;
        private final String collaboratorName;
        private final String jobTitle;
        private final UUID photoObjectId;
        private final String workScheduleName;
        /** Saldo acumulado antes do periodo. */
        private final int previousBalanceMinutes;
        private final int periodCreditMinutes;
        private final int periodDebitMinutes;
        /** Credito menos debito no periodo. */
        private final int periodBalanceMinutes;
        /** Saldo acumulado ate o fim do periodo. */
        private final int totalBalanceMinutes;
    }

    @Getter
    @Builder
    public static class StatementLine {
        private final LocalDate date;
        private final String status;
        private final int expectedMinutes;
        private final int workedMinutes;
        private final int hourBankMinutes;
        private final int runningBalanceMinutes;
    }

    @Getter
    @Builder
    public static class Statement {
        private final UUID collaboratorId;
        private final String collaboratorName;
        private final LocalDate accrualStart;
        private final int previousBalanceMinutes;
        private final int totalBalanceMinutes;
        private final List<StatementLine> lines;
    }
}
