package br.com.gommo.modules.rh.person.attendance.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class AttendanceMobileContextResponseDto {
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final String contractType;
    private final String workloadSchedule;
    private final BigDecimal dailyWorkloadHours;
    private final boolean requirePhoto;
    private final boolean requireLocation;
    private final AttendanceRecordResponseDto todayRecord;
}
