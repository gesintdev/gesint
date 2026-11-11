package br.com.gesint.modules.rh.report.model;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdmissionReportRow {
    private final String employeeName;
    private final LocalDate admissionDate;
    private final String department;
    private final String jobPosition;
    private final String contractType;
    private final String status;
}
