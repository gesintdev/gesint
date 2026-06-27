package br.com.gommo.modules.ctb.payroll.integration;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRecord;
import br.com.gommo.modules.rh.person.attendance.repository.AttendanceRecordRepository;

@Component
public class AttendanceHoursProviderImpl implements AttendanceHoursProvider {

    private static final LocalTime NIGHT_START = LocalTime.of(22, 0);
    private static final LocalTime NIGHT_END = LocalTime.of(5, 0);

    private final AttendanceRecordRepository attendanceRecordRepository;

    public AttendanceHoursProviderImpl(AttendanceRecordRepository attendanceRecordRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    @Override
    public AttendanceHoursSnapshot loadHours(UUID collaboratorId, LocalDate periodStart, LocalDate periodEnd) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByCollaboratorAndPeriod(
                collaboratorId, periodStart, periodEnd, StatusEnum.DELETED);

        BigDecimal workedHours = BigDecimal.ZERO;
        BigDecimal nightShiftHours = BigDecimal.ZERO;

        for (AttendanceRecord record : records) {
            if (record.getClockIn() == null || record.getClockOut() == null) {
                continue;
            }
            long workedMinutes =
                    Duration.between(record.getClockIn(), record.getClockOut()).toMinutes();
            int breakMinutes = record.getBreakMinutes() != null ? record.getBreakMinutes() : 0;
            workedMinutes = Math.max(0, workedMinutes - breakMinutes);
            workedHours = workedHours.add(minutesToHours(workedMinutes));
            nightShiftHours = nightShiftHours.add(estimateNightHours(record.getClockIn(), record.getClockOut()));
        }

        return new AttendanceHoursSnapshot(collaboratorId, periodStart, periodEnd, workedHours, nightShiftHours);
    }

    private static BigDecimal minutesToHours(long minutes) {
        return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
    }

    private static BigDecimal estimateNightHours(LocalTime clockIn, LocalTime clockOut) {
        if (!clockIn.isBefore(NIGHT_START) || clockOut.isAfter(NIGHT_END)) {
            return new BigDecimal("2.0000");
        }
        return BigDecimal.ZERO;
    }
}
