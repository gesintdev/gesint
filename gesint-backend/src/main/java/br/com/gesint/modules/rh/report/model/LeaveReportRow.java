package br.com.gesint.modules.rh.report.model;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LeaveReportRow {
    private final String employeeName;
    private final String leaveType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final Integer durationDays;
    private final String status;
}
