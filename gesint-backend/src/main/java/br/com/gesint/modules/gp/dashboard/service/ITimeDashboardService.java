package br.com.gesint.modules.gp.dashboard.service;

import java.time.LocalDate;

import br.com.gesint.modules.gp.dashboard.dto.TimeDashboardResponseDto;

public interface ITimeDashboardService {
    TimeDashboardResponseDto dashboard(LocalDate from, LocalDate to);
}
