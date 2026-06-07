package br.com.gommo.modules.payroll.integration;

import java.time.LocalDate;
import java.util.UUID;

public interface LeaveDataProvider {

    LeaveDataSnapshot loadLeaveData(UUID collaboratorId, LocalDate periodStart, LocalDate periodEnd);
}
