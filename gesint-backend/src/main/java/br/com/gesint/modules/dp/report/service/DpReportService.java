package br.com.gesint.modules.dp.report.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import br.com.gesint.core.report.GeneratedReport;
import br.com.gesint.core.report.ReportExporter;
import br.com.gesint.modules.dp.report.definition.EmployeeRosterReportDefinition;

@Service
public class DpReportService implements IDpReportService {

    private final ReportExporter reportExporter;
    private final EmployeeRosterReportDefinition employeeRoster;

    public DpReportService(ReportExporter reportExporter, EmployeeRosterReportDefinition employeeRoster) {
        this.reportExporter = reportExporter;
        this.employeeRoster = employeeRoster;
    }

    @Override
    @PreAuthorize("hasAuthority('collaborator:export')")
    public GeneratedReport generateEmployeeRoster() {
        return reportExporter.export(employeeRoster, null);
    }
}
