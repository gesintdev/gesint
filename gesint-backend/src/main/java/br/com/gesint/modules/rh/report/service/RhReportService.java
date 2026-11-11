package br.com.gesint.modules.rh.report.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import br.com.gesint.core.report.GeneratedReport;
import br.com.gesint.core.report.ReportExporter;
import br.com.gesint.modules.rh.report.definition.AdmissionReportDefinition;
import br.com.gesint.modules.rh.report.definition.LeaveReportDefinition;
import br.com.gesint.modules.rh.report.dto.PeriodReportFilterDto;

@Service
public class RhReportService implements IRhReportService {

    private final ReportExporter reportExporter;
    private final AdmissionReportDefinition admissions;
    private final LeaveReportDefinition leaves;

    public RhReportService(
            ReportExporter reportExporter,
            AdmissionReportDefinition admissions,
            LeaveReportDefinition leaves) {
        this.reportExporter = reportExporter;
        this.admissions = admissions;
        this.leaves = leaves;
    }

    @Override
    @PreAuthorize("hasAuthority('admission:export')")
    public GeneratedReport generateAdmissions(PeriodReportFilterDto filter) {
        return reportExporter.export(admissions, filter);
    }

    @Override
    @PreAuthorize("hasAuthority('leave:export')")
    public GeneratedReport generateLeaves(PeriodReportFilterDto filter) {
        return reportExporter.export(leaves, filter);
    }
}
