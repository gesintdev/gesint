package br.com.gesint.modules.ctb.payroll.integration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AttendanceHoursSnapshot(
        UUID collaboratorId,
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal workedHours,
        BigDecimal nightShiftHours) {}
