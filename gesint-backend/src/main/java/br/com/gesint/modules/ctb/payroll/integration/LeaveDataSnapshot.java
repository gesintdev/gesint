package br.com.gesint.modules.ctb.payroll.integration;

import java.util.UUID;

public record LeaveDataSnapshot(UUID collaboratorId, int unpaidLeaveDays) {}
