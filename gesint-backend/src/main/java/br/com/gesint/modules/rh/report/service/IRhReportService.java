package br.com.gesint.modules.rh.report.service;

import br.com.gesint.core.report.GeneratedReport;
import br.com.gesint.modules.rh.report.dto.PeriodReportFilterDto;

public interface IRhReportService {
    GeneratedReport generateAdmissions(PeriodReportFilterDto filter);

    GeneratedReport generateLeaves(PeriodReportFilterDto filter);
}
