package br.com.gesint.modules.gp.report.service;

import java.time.LocalDate;

import br.com.gesint.modules.gp.report.dto.TimeStatusMetricEnum;
import br.com.gesint.modules.gp.report.dto.TimeStatusReportResponseDto;

public interface ITimeStatusReportService {
    TimeStatusReportResponseDto report(TimeStatusMetricEnum metric, LocalDate from, LocalDate to);
}
