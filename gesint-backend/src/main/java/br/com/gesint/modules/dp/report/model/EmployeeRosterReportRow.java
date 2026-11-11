package br.com.gesint.modules.dp.report.model;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class EmployeeRosterReportRow {
    private final Integer code;
    private final String employeeName;
    private final String department;
    private final String jobPosition;
    private final LocalDate admissionDate;
    private final String status;
}
