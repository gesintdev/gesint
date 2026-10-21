package br.com.gesint.modules.ctb.payroll.integration;

import java.time.LocalDate;
import java.util.UUID;

public interface AttendanceHoursProvider {

    AttendanceHoursSnapshot loadHours(UUID collaboratorId, LocalDate periodStart, LocalDate periodEnd);
}
