package br.com.gommo.modules.payroll.integration;

import java.util.UUID;

public record LeaveDataSnapshot(UUID collaboratorId, int unpaidLeaveDays) {}
